import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import DailyRotateFile = require('winston-daily-rotate-file');

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

@Injectable()
export class AdvancedLoggerService {
  private readonly logger: winston.Logger;
  private readonly nestLogger = new Logger(AdvancedLoggerService.name);

  constructor(private readonly configService: ConfigService) {
    this.logger = this.createWinstonLogger();
  }

  private createWinstonLogger(): winston.Logger {
    const logLevel = this.configService.get('LOG_LEVEL', 'info');
    const nodeEnv = this.configService.get('NODE_ENV', 'development');

    const transports: winston.transport[] = [
      // Console transport for development
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.printf(({ level, message, timestamp, ...meta }) => {
            const metaStr = Object.keys(meta).length ? `\\n${JSON.stringify(meta, null, 2)}` : '';
            return `${timestamp} [${level}] ${message}${metaStr}`;
          })
        ),
      }),
    ];

    // File transports for production
    if (nodeEnv === 'production') {
      // General application logs
      transports.push(
        new DailyRotateFile({
          filename: 'logs/lif3-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxFiles: '14d',
          maxSize: '20m',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json()
          ),
        })
      );

      // Error logs
      transports.push(
        new DailyRotateFile({
          filename: 'logs/lif3-error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxFiles: '30d',
          maxSize: '20m',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json()
          ),
        })
      );

      // Financial audit logs
      transports.push(
        new DailyRotateFile({
          filename: 'logs/financial-audit-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxFiles: '90d',
          maxSize: '50m',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        })
      );

      // Security audit logs
      transports.push(
        new DailyRotateFile({
          filename: 'logs/security-audit-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxFiles: '90d',
          maxSize: '50m',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        })
      );
    }

    return winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports,
      exceptionHandlers: [
        new winston.transports.File({ filename: 'logs/exceptions.log' }),
      ],
      rejectionHandlers: [
        new winston.transports.File({ filename: 'logs/rejections.log' }),
      ],
    });
  }

  /**
   * Log general application events
   */
  log(message: string, context?: LogContext): void {
    this.logger.info(message, {
      ...context,
      timestamp: new Date().toISOString(),
      service: 'lif3-backend',
    });
  }

  /**
   * Log financial operations and events
   */
  logFinancial(message: string, context: FinancialLogContext): void {
    this.logger.info(message, {
      ...context,
      timestamp: new Date().toISOString(),
      service: 'lif3-backend',
      category: 'financial',
      auditType: 'financial_operation',
    });

    // Send to financial audit log
    this.logger.info(message, {
      ...context,
      timestamp: new Date().toISOString(),
      service: 'lif3-backend',
      category: 'financial_audit',
    });
  }

  /**
   * Log MCP framework operations
   */
  logMCP(message: string, context: MCPLogContext): void {
    this.logger.info(message, {
      ...context,
      timestamp: new Date().toISOString(),
      service: 'lif3-backend',
      category: 'mcp',
      framework: 'mcp',
    });
  }

  /**
   * Log security events
   */
  logSecurity(message: string, context: LogContext): void {
    this.logger.warn(message, {
      ...context,
      timestamp: new Date().toISOString(),
      service: 'lif3-backend',
      category: 'security',
      auditType: 'security_event',
    });
  }

  /**
   * Log performance metrics
   */
  logPerformance(message: string, context: LogContext & {
    operation: string;
    duration: number;
    memoryUsage?: number;
    requestSize?: number;
    responseSize?: number;
  }): void {
    this.logger.info(message, {
      ...context,
      timestamp: new Date().toISOString(),
      service: 'lif3-backend',
      category: 'performance',
    });
  }

  /**
   * Log automation events
   */
  logAutomation(message: string, context: LogContext & {
    ruleId?: string;
    triggeredBy?: string;
    action?: string;
    automationResult?: any;
  }): void {
    this.logger.info(message, {
      ...context,
      timestamp: new Date().toISOString(),
      service: 'lif3-backend',
      category: 'automation',
      auditType: 'automation_event',
    });
  }

  /**
   * Log goal tracking events
   */
  logGoalTracking(message: string, context: FinancialLogContext & {
    goalType?: 'net_worth' | 'revenue' | 'mrr' | 'savings' | 'investment' | 'expense_reduction';
    targetAmount?: number;
    currentAmount?: number;
    progressPercentage?: number;
    milestoneAchieved?: boolean;
  }): void {
    this.logger.info(message, {
      ...context,
      timestamp: new Date().toISOString(),
      service: 'lif3-backend',
      category: 'goal_tracking',
      auditType: 'goal_progress',
    });
  }

  /**
   * Log errors with enhanced context
   */
  error(message: string, error: Error, context?: LogContext): void {
    this.logger.error(message, {
      ...context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      timestamp: new Date().toISOString(),
      service: 'lif3-backend',
      category: 'error',
    });
  }

  /**
   * Log warnings
   */
  warn(message: string, context?: LogContext): void {
    this.logger.warn(message, {
      ...context,
      timestamp: new Date().toISOString(),
      service: 'lif3-backend',
      category: 'warning',
    });
  }

  /**
   * Log debug information (development only)
   */
  debug(message: string, context?: LogContext): void {
    if (this.configService.get('NODE_ENV') === 'development') {
      this.logger.debug(message, {
        ...context,
        timestamp: new Date().toISOString(),
        service: 'lif3-backend',
        category: 'debug',
      });
    }
  }

  /**
   * Create a structured log entry for financial transactions
   */
  logFinancialTransaction(
    type: 'income' | 'expense' | 'investment' | 'goal_progress',
    amount: number,
    currency: string = 'ZAR',
    context: FinancialLogContext
  ): void {
    this.logFinancial(`Financial transaction: ${type}`, {
      ...context,
      amount,
      currency,
      operation: `financial_${type}`,
      auditType: 'financial_transaction',
    });
  }

  /**
   * Create a structured log entry for MCP operations
   */
  logMCPOperation(
    operation: 'sync' | 'connect' | 'disconnect' | 'message',
    serverId: string,
    context: MCPLogContext
  ): void {
    this.logMCP(`MCP operation: ${operation}`, {
      ...context,
      serverId,
      operation: `mcp_${operation}`,
    });
  }

  /**
   * Create a structured log entry for automation triggers
   */
  logAutomationTrigger(
    ruleId: string,
    triggeredBy: string,
    action: string,
    success: boolean,
    context?: LogContext
  ): void {
    this.logAutomation(`Automation triggered: ${ruleId}`, {
      ...context,
      ruleId,
      triggeredBy,
      action,
      success,
      operation: 'automation_trigger',
    });
  }

  /**
   * Create a structured log entry for goal milestones
   */
  logGoalMilestone(
    goalType: 'net_worth' | 'revenue' | 'mrr' | 'savings' | 'investment' | 'expense_reduction',
    currentAmount: number,
    targetAmount: number,
    progressPercentage: number,
    context?: FinancialLogContext
  ): void {
    this.logGoalTracking(`Goal milestone: ${goalType}`, {
      ...context,
      goalType,
      currentAmount,
      targetAmount,
      progressPercentage,
      milestoneAchieved: true,
      operation: 'goal_milestone',
    });
  }

  /**
   * Get logger instance for external use
   */
  getLogger(): winston.Logger {
    return this.logger;
  }

  /**
   * Create a child logger with additional context
   */
  createChildLogger(defaultContext: LogContext): {
    log: (message: string, context?: LogContext) => void;
    error: (message: string, error: Error, context?: LogContext) => void;
    warn: (message: string, context?: LogContext) => void;
    debug: (message: string, context?: LogContext) => void;
  } {
    return {
      log: (message: string, context?: LogContext) => 
        this.log(message, { ...defaultContext, ...context }),
      error: (message: string, error: Error, context?: LogContext) => 
        this.error(message, error, { ...defaultContext, ...context }),
      warn: (message: string, context?: LogContext) => 
        this.warn(message, { ...defaultContext, ...context }),
      debug: (message: string, context?: LogContext) => 
        this.debug(message, { ...defaultContext, ...context }),
    };
  }
}