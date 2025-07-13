import { LoggerService } from '../../common/logger/logger.service';
export interface SystemHealth {
    status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    timestamp: Date;
    uptime: number;
    memory: {
        used: number;
        total: number;
        percentage: number;
    };
    cpu: {
        usage: number;
    };
    database: {
        connected: boolean;
        responseTime: number;
    };
    integrations: {
        googleDrive: boolean;
        discord: boolean;
        claudeAI: boolean;
        websocket: boolean;
    };
    metrics: {
        activeUsers: number;
        totalRequests: number;
        averageResponseTime: number;
        errorRate: number;
    };
}
export interface AlertConfig {
    type: 'EMAIL' | 'SLACK' | 'DISCORD' | 'WEBHOOK';
    enabled: boolean;
    threshold: any;
    recipients: string[];
}
export interface LogAnalytics {
    timeframe: string;
    totalLogs: number;
    errorCount: number;
    warningCount: number;
    financialTransactions: number;
    securityEvents: number;
    performanceMetrics: {
        averageResponseTime: number;
        slowestEndpoint: string;
        totalRequests: number;
    };
    userActivity: {
        activeUsers: number;
        topActions: string[];
    };
    businessMetrics: {
        revenueLogged: number;
        goalUpdates: number;
        netWorthChanges: number;
    };
}
export declare class MonitoringService {
    private readonly logger;
    private healthCheckInterval;
    private logAnalyticsInterval;
    private systemMetrics;
    constructor(logger: LoggerService);
    private initializeMonitoring;
    getSystemHealth(): Promise<SystemHealth>;
    analyzeLogsAndGenerateReport(timeframe?: string): Promise<LogAnalytics>;
    getFinancialMetrics(): Promise<any>;
    getSecurityMetrics(): Promise<any>;
    getPerformanceMetrics(): Promise<any>;
    incrementRequestCount(): void;
    incrementErrorCount(): void;
    addResponseTime(duration: number): void;
    setActiveConnections(count: number): void;
    private performHealthCheck;
    private checkDatabaseHealth;
    private checkIntegrationHealth;
    private pingGoogleDrive;
    private pingDiscord;
    private pingClaudeAI;
    private pingWebSocket;
    private getCPUUsage;
    private calculateOverallStatus;
    private getLogFiles;
    private analyzeLogs;
    private generateAnalyticsReport;
    private sendAlert;
    onModuleDestroy(): void;
}
