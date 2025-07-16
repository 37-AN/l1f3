import { Injectable, Logger } from '@nestjs/common';
import { AdvancedLoggerService } from '../../../common/logger/advanced-logger.service';
import { SystemAlert, AlertAction } from '../interfaces/control-board.interface';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);
  private alerts: Map<string, SystemAlert> = new Map();
  private alertHistory: SystemAlert[] = [];

  constructor(private readonly advancedLogger: AdvancedLoggerService) {
    this.initializeSystemAlerts();
  }

  async getActiveAlerts(): Promise<SystemAlert[]> {
    const activeAlerts = Array.from(this.alerts.values())
      .filter(alert => !alert.isResolved)
      .sort((a, b) => {
        // Sort by severity and timestamp
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
        if (severityDiff !== 0) return severityDiff;
        return b.timestamp.getTime() - a.timestamp.getTime();
      });

    return activeAlerts;
  }

  async getAllAlerts(limit = 50): Promise<SystemAlert[]> {
    const allAlerts = Array.from(this.alerts.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    return allAlerts;
  }

  async createAlert(
    type: SystemAlert['type'],
    severity: SystemAlert['severity'],
    title: string,
    message: string,
    source: string,
    metadata?: Record<string, any>
  ): Promise<SystemAlert> {
    const alert: SystemAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      title,
      message,
      source,
      timestamp: new Date(),
      isRead: false,
      isResolved: false,
      actions: this.generateAlertActions(type, severity),
      metadata,
    };

    this.alerts.set(alert.id, alert);
    this.alertHistory.push(alert);

    // Keep only last 1000 alerts in history
    if (this.alertHistory.length > 1000) {
      this.alertHistory = this.alertHistory.slice(-1000);
    }

    this.logger.log(`New ${severity} alert created: ${title}`);
    
    this.advancedLogger.logSecurity(`Alert created: ${title}`, {
      operation: 'alert_creation',
      metadata: {
        alertId: alert.id,
        type,
        severity,
        source,
      },
    });

    return alert;
  }

  async resolveAlert(alertId: string, resolution?: string): Promise<boolean> {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      this.logger.warn(`Attempted to resolve non-existent alert: ${alertId}`);
      return false;
    }

    alert.isResolved = true;
    alert.metadata = {
      ...alert.metadata,
      resolvedAt: new Date(),
      resolution: resolution || 'Manually resolved',
    };

    this.alerts.set(alertId, alert);

    this.logger.log(`Alert resolved: ${alert.title}`);
    
    this.advancedLogger.logSecurity(`Alert resolved: ${alert.title}`, {
      operation: 'alert_resolution',
      metadata: {
        alertId,
        resolution,
      },
    });

    return true;
  }

  async markAsRead(alertId: string): Promise<boolean> {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      return false;
    }

    alert.isRead = true;
    this.alerts.set(alertId, alert);
    return true;
  }

  async clearResolvedAlerts(): Promise<number> {
    const resolvedAlerts = Array.from(this.alerts.values()).filter(a => a.isResolved);
    const count = resolvedAlerts.length;

    for (const alert of resolvedAlerts) {
      this.alerts.delete(alert.id);
    }

    this.logger.log(`Cleared ${count} resolved alerts`);
    return count;
  }

  getAlertStats() {
    const allAlerts = Array.from(this.alerts.values());
    const activeAlerts = allAlerts.filter(a => !a.isResolved);
    
    const severityCounts = {
      critical: activeAlerts.filter(a => a.severity === 'critical').length,
      high: activeAlerts.filter(a => a.severity === 'high').length,
      medium: activeAlerts.filter(a => a.severity === 'medium').length,
      low: activeAlerts.filter(a => a.severity === 'low').length,
    };

    const typeCounts = {
      error: activeAlerts.filter(a => a.type === 'error').length,
      warning: activeAlerts.filter(a => a.type === 'warning').length,
      security: activeAlerts.filter(a => a.type === 'security').length,
      financial: activeAlerts.filter(a => a.type === 'financial').length,
      info: activeAlerts.filter(a => a.type === 'info').length,
    };

    return {
      total: allAlerts.length,
      active: activeAlerts.length,
      resolved: allAlerts.length - activeAlerts.length,
      severityCounts,
      typeCounts,
      lastAlert: allAlerts.length > 0 ? allAlerts[allAlerts.length - 1].timestamp : null,
    };
  }

  // Monitor system conditions and create alerts automatically
  async checkSystemConditions(metrics: any): Promise<void> {
    try {
      // CPU usage alerts
      if (metrics.system?.cpuUsage > 90) {
        await this.createAlert(
          'error',
          'critical',
          'Critical CPU Usage',
          `CPU usage is at ${metrics.system.cpuUsage.toFixed(1)}%`,
          'system_monitor',
          { cpuUsage: metrics.system.cpuUsage }
        );
      } else if (metrics.system?.cpuUsage > 80) {
        const existingAlert = Array.from(this.alerts.values()).find(
          a => a.source === 'system_monitor' && a.title.includes('High CPU Usage') && !a.isResolved
        );
        
        if (!existingAlert) {
          await this.createAlert(
            'warning',
            'high',
            'High CPU Usage',
            `CPU usage is at ${metrics.system.cpuUsage.toFixed(1)}%`,
            'system_monitor',
            { cpuUsage: metrics.system.cpuUsage }
          );
        }
      }

      // Memory usage alerts
      if (metrics.system?.memoryUsage?.percentage > 95) {
        await this.createAlert(
          'error',
          'critical',
          'Critical Memory Usage',
          `Memory usage is at ${metrics.system.memoryUsage.percentage.toFixed(1)}%`,
          'system_monitor',
          { memoryUsage: metrics.system.memoryUsage }
        );
      } else if (metrics.system?.memoryUsage?.percentage > 85) {
        const existingAlert = Array.from(this.alerts.values()).find(
          a => a.source === 'system_monitor' && a.title.includes('High Memory Usage') && !a.isResolved
        );
        
        if (!existingAlert) {
          await this.createAlert(
            'warning',
            'high',
            'High Memory Usage',
            `Memory usage is at ${metrics.system.memoryUsage.percentage.toFixed(1)}%`,
            'system_monitor',
            { memoryUsage: metrics.system.memoryUsage }
          );
        }
      }

      // Error rate alerts
      if (metrics.application?.errorRate > 10) {
        await this.createAlert(
          'error',
          'high',
          'High Error Rate',
          `Application error rate is ${metrics.application.errorRate.toFixed(1)}%`,
          'application_monitor',
          { errorRate: metrics.application.errorRate }
        );
      }

    } catch (error) {
      this.logger.error('Failed to check system conditions:', error);
    }
  }

  private generateAlertActions(type: SystemAlert['type'], severity: SystemAlert['severity']): AlertAction[] {
    const actions: AlertAction[] = [];

    // Common actions
    actions.push({
      id: 'mark_read',
      label: 'Mark as Read',
      type: 'button',
      action: 'mark_read',
    });

    actions.push({
      id: 'resolve',
      label: 'Resolve',
      type: 'button',
      action: 'resolve_alert',
    });

    // Type-specific actions
    switch (type) {
      case 'error':
        actions.push({
          id: 'view_logs',
          label: 'View Logs',
          type: 'link',
          action: 'view_logs',
        });
        if (severity === 'critical') {
          actions.push({
            id: 'restart_service',
            label: 'Restart Service',
            type: 'button',
            action: 'restart_service',
          });
        }
        break;

      case 'security':
        actions.push({
          id: 'view_security_logs',
          label: 'Security Logs',
          type: 'link',
          action: 'view_security_logs',
        });
        actions.push({
          id: 'block_ip',
          label: 'Block IP',
          type: 'button',
          action: 'block_ip',
        });
        break;

      case 'financial':
        actions.push({
          id: 'view_transactions',
          label: 'View Transactions',
          type: 'link',
          action: 'view_transactions',
        });
        actions.push({
          id: 'sync_banking',
          label: 'Sync Banking',
          type: 'button',
          action: 'sync_banking',
        });
        break;
    }

    return actions;
  }

  private initializeSystemAlerts(): void {
    this.logger.log('Alerts service initialized');
    
    // Create a welcome info alert
    this.createAlert(
      'info',
      'low',
      'LIF3 Control Board Online',
      'Control board monitoring system is now active',
      'control_board',
      { systemStart: new Date() }
    );
  }
}