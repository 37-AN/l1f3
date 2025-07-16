import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
export interface LogContext {
    userId?: string;
    sessionId?: string;
    requestId?: string;
    operation?: string;
    duration?: number;
    success?: boolean;
    error?: any;
    metadata?: any;
}
export interface FinancialLogContext extends LogContext {
    amount?: number;
    currency?: string;
    goalImpact?: 'positive' | 'negative' | 'neutral';
    goalProgress?: number;
    automationTriggered?: boolean;
    auditType?: string;
}
export interface MCPLogContext extends LogContext {
    serverId?: string;
    integrationId?: string;
    syncResult?: any;
    messageType?: string;
    performanceMetrics?: {
        requestTime: number;
        responseTime: number;
        dataSize: number;
    };
}
export declare class AdvancedLoggerService {
    private readonly configService;
    private readonly logger;
    private readonly nestLogger;
    constructor(configService: ConfigService);
    private createWinstonLogger;
    log(message: string, context?: LogContext): void;
    logFinancial(message: string, context: FinancialLogContext): void;
    logMCP(message: string, context: MCPLogContext): void;
    logSecurity(message: string, context: LogContext): void;
    logPerformance(message: string, context: LogContext & {
        operation: string;
        duration: number;
        memoryUsage?: number;
        requestSize?: number;
        responseSize?: number;
    }): void;
    logAutomation(message: string, context: LogContext & {
        ruleId?: string;
        triggeredBy?: string;
        action?: string;
        automationResult?: any;
    }): void;
    logGoalTracking(message: string, context: FinancialLogContext & {
        goalType?: 'net_worth' | 'revenue' | 'mrr' | 'savings' | 'investment' | 'expense_reduction';
        targetAmount?: number;
        currentAmount?: number;
        progressPercentage?: number;
        milestoneAchieved?: boolean;
    }): void;
    error(message: string, error: Error, context?: LogContext): void;
    warn(message: string, context?: LogContext): void;
    debug(message: string, context?: LogContext): void;
    logFinancialTransaction(type: 'income' | 'expense' | 'investment' | 'goal_progress', amount: number, currency: string, context: FinancialLogContext): void;
    logMCPOperation(operation: 'sync' | 'connect' | 'disconnect' | 'message', serverId: string, context: MCPLogContext): void;
    logAutomationTrigger(ruleId: string, triggeredBy: string, action: string, success: boolean, context?: LogContext): void;
    logGoalMilestone(goalType: 'net_worth' | 'revenue' | 'mrr' | 'savings' | 'investment' | 'expense_reduction', currentAmount: number, targetAmount: number, progressPercentage: number, context?: FinancialLogContext): void;
    getLogger(): winston.Logger;
    createChildLogger(defaultContext: LogContext): {
        log: (message: string, context?: LogContext) => void;
        error: (message: string, error: Error, context?: LogContext) => void;
        warn: (message: string, context?: LogContext) => void;
        debug: (message: string, context?: LogContext) => void;
    };
}
