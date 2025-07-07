import { LoggerService as NestLoggerService } from '@nestjs/common';
import { Logger } from 'winston';
export interface FinancialAuditLog {
    userId: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW';
    entity: 'TRANSACTION' | 'ACCOUNT' | 'GOAL' | 'BALANCE' | 'BUSINESS_METRIC' | 'USER';
    entityId?: string;
    amount?: number;
    currency: 'ZAR' | 'USD';
    previousValue?: any;
    newValue?: any;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
    metadata?: any;
}
export interface SecurityAuditLog {
    userId?: string;
    action: 'LOGIN' | 'LOGOUT' | 'FAILED_LOGIN' | 'REGISTER' | 'PASSWORD_CHANGE' | 'MFA_ENABLED' | 'MFA_DISABLED' | 'ACCOUNT_LOCKED' | 'ACCOUNT_UNLOCKED' | 'PERMISSION_DENIED';
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
    metadata?: any;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}
export interface BusinessMetricLog {
    metric: '43V3R_REVENUE' | '43V3R_MRR' | '43V3R_CUSTOMERS' | '43V3R_PIPELINE' | 'NET_WORTH_PROGRESS' | 'GOAL_MILESTONE';
    value: number;
    currency: 'ZAR' | 'USD';
    previousValue?: number;
    changePercent?: number;
    timestamp: Date;
    source: 'MANUAL' | 'AUTOMATED' | 'INTEGRATION';
    metadata?: any;
}
export interface IntegrationLog {
    service: 'GOOGLE_DRIVE' | 'DISCORD' | 'CLAUDE_AI' | 'BANK_API' | 'WEBSOCKET' | 'RAG_CHROMADB' | 'RAG_AI';
    action: 'CONNECT' | 'DISCONNECT' | 'SYNC' | 'ERROR' | 'RATE_LIMIT' | 'AUTHENTICATION_FAILED' | 'COMMAND_RECEIVED' | 'COMMAND_COMPLETED' | 'COMMAND_FAILED' | 'INITIALIZE' | 'PROCESS_DOCUMENT' | 'SEMANTIC_SEARCH' | 'GENERATE_RESPONSE' | 'ANALYZE_DOCUMENT' | 'DELETE_DOCUMENT';
    status: 'SUCCESS' | 'FAILED' | 'PARTIAL' | 'PROCESSING';
    duration?: number;
    recordsProcessed?: number;
    errorMessage?: string;
    timestamp: Date;
    metadata?: any;
}
export declare class LoggerService implements NestLoggerService {
    private readonly logger;
    constructor(logger: Logger);
    log(message: string, context?: string): void;
    error(message: string, trace?: string, context?: string): void;
    warn(message: string, context?: string): void;
    debug(message: string, context?: string): void;
    verbose(message: string, context?: string): void;
    logFinancialAudit(auditLog: FinancialAuditLog): void;
    logSecurityEvent(securityLog: SecurityAuditLog): void;
    logBusinessMetric(metricLog: BusinessMetricLog): void;
    logIntegration(integrationLog: IntegrationLog): void;
    logWebSocketEvent(event: string, data: any, userId?: string): void;
    logAPIAccess(method: string, endpoint: string, userId?: string, statusCode?: number, duration?: number, ipAddress?: string): void;
    logPerformanceMetric(metric: string, value: number, unit: string, context?: string): void;
    logZARCurrencyOperation(operation: string, amount: number, fromCurrency?: string, exchangeRate?: number, userId?: string): void;
    logGoalProgress(goalId: string, userId: string, currentAmount: number, targetAmount: number, progressPercent: number): void;
    logNetWorthUpdate(userId: string, previousNetWorth: number, newNetWorth: number, changeAmount: number, changePercent: number): void;
    log43V3RRevenue(amount: number, source: string, description?: string): void;
    logDailyRevenueTarget(currentRevenue: number, targetRevenue: number, achievementPercent: number): void;
    logMRRProgress(currentMRR: number, targetMRR: number, progressPercent: number): void;
}
