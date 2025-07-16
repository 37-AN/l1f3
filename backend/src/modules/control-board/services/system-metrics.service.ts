import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as os from 'os';
import * as fs from 'fs';
import { SystemMetrics } from '../interfaces/control-board.interface';

@Injectable()
export class SystemMetricsService {
  private readonly logger = new Logger(SystemMetricsService.name);
  private metricsHistory: SystemMetrics[] = [];
  private startTime = Date.now();
  private requestCount = 0;
  private totalResponseTime = 0;
  private errorCount = 0;

  constructor() {
    this.collectInitialMetrics();
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    const metrics = await this.collectCurrentMetrics();
    this.metricsHistory.push(metrics);
    
    // Keep only last 100 metrics (for performance)
    if (this.metricsHistory.length > 100) {
      this.metricsHistory = this.metricsHistory.slice(-100);
    }
    
    return metrics;
  }

  getMetricsHistory(): SystemMetrics[] {
    return this.metricsHistory;
  }

  incrementRequestCount(): void {
    this.requestCount++;
  }

  addResponseTime(time: number): void {
    this.totalResponseTime += time;
  }

  incrementErrorCount(): void {
    this.errorCount++;
  }

  private async collectCurrentMetrics(): Promise<SystemMetrics> {
    const uptime = Date.now() - this.startTime;
    const cpuUsage = await this.getCPUUsage();
    const memoryUsage = this.getMemoryUsage();
    const diskUsage = await this.getDiskUsage();

    const averageResponseTime = this.requestCount > 0 
      ? this.totalResponseTime / this.requestCount 
      : 0;
    
    const errorRate = this.requestCount > 0 
      ? (this.errorCount / this.requestCount) * 100 
      : 0;

    return {
      timestamp: new Date(),
      system: {
        uptime,
        cpuUsage,
        memoryUsage,
        diskUsage,
      },
      application: {
        activeConnections: this.getActiveConnections(),
        totalRequests: this.requestCount,
        averageResponseTime,
        errorRate,
      },
      database: {
        connections: this.getDatabaseConnections(),
        queryTime: this.getAverageQueryTime(),
        cacheHitRate: this.getCacheHitRate(),
      },
    };
  }

  private async getCPUUsage(): Promise<number> {
    return new Promise((resolve) => {
      const cpus = os.cpus();
      const startMeasure = cpus.map(cpu => {
        const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
        const idle = cpu.times.idle;
        return { total, idle };
      });

      setTimeout(() => {
        const endMeasure = os.cpus().map(cpu => {
          const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
          const idle = cpu.times.idle;
          return { total, idle };
        });

        let totalUsage = 0;
        for (let i = 0; i < startMeasure.length; i++) {
          const start = startMeasure[i];
          const end = endMeasure[i];
          const totalDiff = end.total - start.total;
          const idleDiff = end.idle - start.idle;
          const usage = 100 - (100 * idleDiff / totalDiff);
          totalUsage += usage;
        }

        resolve(totalUsage / startMeasure.length);
      }, 100);
    });
  }

  private getMemoryUsage() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const percentage = (usedMemory / totalMemory) * 100;

    return {
      used: Math.round(usedMemory / 1024 / 1024), // MB
      total: Math.round(totalMemory / 1024 / 1024), // MB
      percentage: Math.round(percentage * 100) / 100,
    };
  }

  private async getDiskUsage() {
    try {
      const stats = await fs.promises.statSync(process.cwd());
      // This is a simplified disk usage calculation
      // In production, you'd want to use a more comprehensive approach
      return {
        used: 15000, // MB (placeholder)
        total: 50000, // MB (placeholder)
        percentage: 30, // % (placeholder)
      };
    } catch (error) {
      this.logger.warn('Could not get disk usage:', error.message);
      return {
        used: 0,
        total: 0,
        percentage: 0,
      };
    }
  }

  private getActiveConnections(): number {
    // This would typically integrate with your WebSocket or HTTP connection tracking
    return Math.floor(Math.random() * 20) + 5; // Placeholder: 5-25 connections
  }

  private getDatabaseConnections(): number {
    // This would integrate with your database pool monitoring
    return Math.floor(Math.random() * 10) + 2; // Placeholder: 2-12 connections
  }

  private getAverageQueryTime(): number {
    // This would integrate with your database query monitoring
    return Math.random() * 50 + 10; // Placeholder: 10-60ms
  }

  private getCacheHitRate(): number {
    // This would integrate with your cache monitoring (Redis, etc.)
    return Math.random() * 20 + 80; // Placeholder: 80-100%
  }

  private collectInitialMetrics(): void {
    this.logger.log('System metrics service initialized');
    this.logger.log(`Platform: ${os.platform()}`);
    this.logger.log(`Architecture: ${os.arch()}`);
    this.logger.log(`Node.js version: ${process.version}`);
    this.logger.log(`Total memory: ${Math.round(os.totalmem() / 1024 / 1024)}MB`);
    this.logger.log(`CPU cores: ${os.cpus().length}`);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async logSystemHealth(): Promise<void> {
    try {
      const metrics = await this.getSystemMetrics();
      
      // Log warnings for high resource usage
      if (metrics.system.cpuUsage > 80) {
        this.logger.warn(`High CPU usage: ${metrics.system.cpuUsage.toFixed(1)}%`);
      }
      
      if (metrics.system.memoryUsage.percentage > 85) {
        this.logger.warn(`High memory usage: ${metrics.system.memoryUsage.percentage.toFixed(1)}%`);
      }
      
      if (metrics.application.errorRate > 5) {
        this.logger.warn(`High error rate: ${metrics.application.errorRate.toFixed(1)}%`);
      }

      // Log summary every 5 minutes
      if (this.metricsHistory.length % 5 === 0) {
        this.logger.log(`System Health Summary - CPU: ${metrics.system.cpuUsage.toFixed(1)}%, Memory: ${metrics.system.memoryUsage.percentage.toFixed(1)}%, Errors: ${metrics.application.errorRate.toFixed(1)}%`);
      }

    } catch (error) {
      this.logger.error('Failed to collect system metrics:', error);
    }
  }

  getPerformanceSummary() {
    if (this.metricsHistory.length === 0) {
      return null;
    }

    const recent = this.metricsHistory.slice(-10); // Last 10 metrics
    
    const avgCpu = recent.reduce((sum, m) => sum + m.system.cpuUsage, 0) / recent.length;
    const avgMemory = recent.reduce((sum, m) => sum + m.system.memoryUsage.percentage, 0) / recent.length;
    const avgResponseTime = recent.reduce((sum, m) => sum + m.application.averageResponseTime, 0) / recent.length;
    const totalErrors = recent.reduce((sum, m) => sum + (m.application.errorRate * m.application.totalRequests / 100), 0);

    return {
      averageCpuUsage: Math.round(avgCpu * 100) / 100,
      averageMemoryUsage: Math.round(avgMemory * 100) / 100,
      averageResponseTime: Math.round(avgResponseTime * 100) / 100,
      totalErrors: Math.round(totalErrors),
      uptime: Date.now() - this.startTime,
      dataPoints: recent.length,
    };
  }
}