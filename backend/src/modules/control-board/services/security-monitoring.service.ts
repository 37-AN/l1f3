import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AdvancedLoggerService } from '../../../common/logger/advanced-logger.service';
import { AlertsService } from './alerts.service';
import { SecurityMetrics } from '../interfaces/control-board.interface';

interface SecurityEvent {
  id: string;
  type: 'login_attempt' | 'failed_auth' | 'suspicious_activity' | 'data_access' | 'fraud_detection';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  source: string;
  details: Record<string, any>;
}

@Injectable()
export class SecurityMonitoringService {
  private readonly logger = new Logger(SecurityMonitoringService.name);
  private securityEvents: SecurityEvent[] = [];
  private threatLevel: SecurityMetrics['threatLevel'] = 'low';
  private blockedIPs = new Set<string>();
  private loginAttempts = {
    successful: 0,
    failed: 0,
    blocked: 0,
  };

  constructor(
    private readonly advancedLogger: AdvancedLoggerService,
    private readonly alertsService: AlertsService,
  ) {
    this.initializeSecurityMonitoring();
  }

  async getSecurityMetrics(): Promise<SecurityMetrics> {
    const recentEvents = this.getRecentEvents(24); // Last 24 hours
    const activeThreats = recentEvents.filter(e => e.severity === 'high' || e.severity === 'critical').length;
    const fraudDetections = recentEvents.filter(e => e.type === 'fraud_detection').length;
    const blockedRequests = recentEvents.filter(e => e.type === 'suspicious_activity').length;

    return {
      timestamp: new Date(),
      threatLevel: this.threatLevel,
      activeThreats,
      blockedRequests,
      fraudDetections,
      loginAttempts: { ...this.loginAttempts },
      dataEncryption: {
        status: 'active',
        algorithm: 'AES-256-GCM',
        keyRotationDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      auditEvents: this.securityEvents.length,
    };
  }

  async logSecurityEvent(
    type: SecurityEvent['type'],
    severity: SecurityEvent['severity'],
    source: string,
    details: Record<string, any>
  ): Promise<void> {
    const event: SecurityEvent = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      timestamp: new Date(),
      source,
      details,
    };

    this.securityEvents.push(event);
    
    // Keep only last 10000 events
    if (this.securityEvents.length > 10000) {
      this.securityEvents = this.securityEvents.slice(-10000);
    }

    this.advancedLogger.logSecurity(`Security event: ${type}`, {
      operation: 'security_event',
      metadata: {
        eventId: event.id,
        type,
        severity,
        source,
        details,
      },
    });

    // Create alerts for high-severity events
    if (severity === 'high' || severity === 'critical') {
      await this.alertsService.createAlert(
        'security',
        severity === 'critical' ? 'critical' : 'high',
        this.getEventTitle(type, severity),
        this.getEventMessage(type, details),
        'security_monitor',
        { securityEventId: event.id, ...details }
      );
    }

    this.updateThreatLevel();
  }

  async logLoginAttempt(success: boolean, blocked: boolean, details: Record<string, any>): Promise<void> {
    if (blocked) {
      this.loginAttempts.blocked++;
      await this.logSecurityEvent(
        'failed_auth',
        'medium',
        'auth_system',
        { ...details, reason: 'blocked' }
      );
    } else if (success) {
      this.loginAttempts.successful++;
      await this.logSecurityEvent(
        'login_attempt',
        'low',
        'auth_system',
        { ...details, result: 'success' }
      );
    } else {
      this.loginAttempts.failed++;
      await this.logSecurityEvent(
        'failed_auth',
        'medium',
        'auth_system',
        { ...details, result: 'failed' }
      );
    }

    // Check for brute force attacks
    await this.checkBruteForceAttempts(details.ip);
  }

  async logFraudDetection(details: Record<string, any>): Promise<void> {
    await this.logSecurityEvent(
      'fraud_detection',
      'high',
      'fraud_detector',
      details
    );
  }

  async logSuspiciousActivity(activity: string, details: Record<string, any>): Promise<void> {
    await this.logSecurityEvent(
      'suspicious_activity',
      'medium',
      'activity_monitor',
      { activity, ...details }
    );
  }

  async blockIP(ip: string, reason: string): Promise<void> {
    this.blockedIPs.add(ip);
    
    await this.logSecurityEvent(
      'suspicious_activity',
      'high',
      'ip_blocker',
      { ip, reason, action: 'blocked' }
    );

    this.logger.warn(`IP blocked: ${ip} - Reason: ${reason}`);
  }

  isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  getBlockedIPs(): string[] {
    return Array.from(this.blockedIPs);
  }

  async unblockIP(ip: string): Promise<void> {
    this.blockedIPs.delete(ip);
    
    await this.logSecurityEvent(
      'suspicious_activity',
      'low',
      'ip_blocker',
      { ip, action: 'unblocked' }
    );

    this.logger.log(`IP unblocked: ${ip}`);
  }

  getRecentEvents(hours = 24): SecurityEvent[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.securityEvents.filter(event => event.timestamp >= cutoff);
  }

  getSecuritySummary() {
    const recentEvents = this.getRecentEvents(24);
    const last7Days = this.getRecentEvents(7 * 24);
    
    return {
      last24Hours: {
        totalEvents: recentEvents.length,
        byType: this.groupEventsByType(recentEvents),
        bySeverity: this.groupEventsBySeverity(recentEvents),
      },
      last7Days: {
        totalEvents: last7Days.length,
        byType: this.groupEventsByType(last7Days),
        bySeverity: this.groupEventsBySeverity(last7Days),
      },
      threatLevel: this.threatLevel,
      blockedIPs: this.blockedIPs.size,
      loginStats: { ...this.loginAttempts },
    };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async performSecurityAudit(): Promise<void> {
    try {
      this.logger.debug('Performing hourly security audit');

      const recentEvents = this.getRecentEvents(1); // Last hour
      const criticalEvents = recentEvents.filter(e => e.severity === 'critical');
      const highEvents = recentEvents.filter(e => e.severity === 'high');

      if (criticalEvents.length > 0) {
        this.logger.warn(`${criticalEvents.length} critical security events in the last hour`);
      }

      if (highEvents.length > 5) {
        this.logger.warn(`${highEvents.length} high-severity security events in the last hour`);
      }

      // Clean up old events (older than 30 days)
      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const oldEventsCount = this.securityEvents.length;
      this.securityEvents = this.securityEvents.filter(event => event.timestamp >= cutoff);
      
      if (this.securityEvents.length < oldEventsCount) {
        this.logger.log(`Cleaned up ${oldEventsCount - this.securityEvents.length} old security events`);
      }

      this.updateThreatLevel();

    } catch (error) {
      this.logger.error('Failed to perform security audit:', error);
    }
  }

  private async checkBruteForceAttempts(ip: string): Promise<void> {
    if (!ip) return;

    const lastHour = new Date(Date.now() - 60 * 60 * 1000);
    const recentFailures = this.securityEvents.filter(
      event => 
        event.type === 'failed_auth' && 
        event.details.ip === ip && 
        event.timestamp >= lastHour
    );

    if (recentFailures.length >= 5) {
      await this.blockIP(ip, `Brute force attempt: ${recentFailures.length} failed logins in 1 hour`);
      
      await this.alertsService.createAlert(
        'security',
        'high',
        'Brute Force Attack Detected',
        `IP ${ip} has been blocked after ${recentFailures.length} failed login attempts`,
        'security_monitor',
        { ip, failedAttempts: recentFailures.length }
      );
    }
  }

  private updateThreatLevel(): void {
    const recentEvents = this.getRecentEvents(1); // Last hour
    const criticalCount = recentEvents.filter(e => e.severity === 'critical').length;
    const highCount = recentEvents.filter(e => e.severity === 'high').length;

    let newThreatLevel: SecurityMetrics['threatLevel'];

    if (criticalCount > 0) {
      newThreatLevel = 'critical';
    } else if (highCount > 3) {
      newThreatLevel = 'high';
    } else if (highCount > 0 || recentEvents.length > 10) {
      newThreatLevel = 'medium';
    } else {
      newThreatLevel = 'low';
    }

    if (newThreatLevel !== this.threatLevel) {
      const oldLevel = this.threatLevel;
      this.threatLevel = newThreatLevel;
      
      this.logger.log(`Threat level changed from ${oldLevel} to ${newThreatLevel}`);
      
      if (newThreatLevel === 'critical' || newThreatLevel === 'high') {
        this.alertsService.createAlert(
          'security',
          newThreatLevel === 'critical' ? 'critical' : 'high',
          `Threat Level Elevated to ${newThreatLevel.toUpperCase()}`,
          `System threat level has been elevated due to recent security events`,
          'security_monitor',
          { oldLevel, newLevel: newThreatLevel, recentEventsCount: recentEvents.length }
        );
      }
    }
  }

  private getEventTitle(type: SecurityEvent['type'], severity: SecurityEvent['severity']): string {
    const titles = {
      login_attempt: 'Login Attempt',
      failed_auth: severity === 'critical' ? 'Critical Authentication Failure' : 'Authentication Failure',
      suspicious_activity: 'Suspicious Activity Detected',
      data_access: 'Unauthorized Data Access',
      fraud_detection: 'Fraud Attempt Detected',
    };

    return titles[type] || 'Security Event';
  }

  private getEventMessage(type: SecurityEvent['type'], details: Record<string, any>): string {
    switch (type) {
      case 'failed_auth':
        return `Failed authentication attempt from ${details.ip || 'unknown IP'}`;
      case 'suspicious_activity':
        return `Suspicious activity detected: ${details.activity || 'unknown activity'}`;
      case 'fraud_detection':
        return `Potential fraud detected in transaction ${details.transactionId || 'unknown'}`;
      case 'data_access':
        return `Unauthorized access attempt to ${details.resource || 'protected resource'}`;
      default:
        return `Security event: ${type}`;
    }
  }

  private groupEventsByType(events: SecurityEvent[]) {
    const grouped: Record<string, number> = {};
    for (const event of events) {
      grouped[event.type] = (grouped[event.type] || 0) + 1;
    }
    return grouped;
  }

  private groupEventsBySeverity(events: SecurityEvent[]) {
    const grouped: Record<string, number> = {};
    for (const event of events) {
      grouped[event.severity] = (grouped[event.severity] || 0) + 1;
    }
    return grouped;
  }

  private initializeSecurityMonitoring(): void {
    this.logger.log('Security monitoring service initialized');
    this.logger.log(`Initial threat level: ${this.threatLevel}`);
  }
}