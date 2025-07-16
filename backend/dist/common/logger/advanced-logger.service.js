"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AdvancedLoggerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedLoggerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const winston = __importStar(require("winston"));
const DailyRotateFile = require("winston-daily-rotate-file");
let AdvancedLoggerService = AdvancedLoggerService_1 = class AdvancedLoggerService {
    constructor(configService) {
        this.configService = configService;
        this.nestLogger = new common_1.Logger(AdvancedLoggerService_1.name);
        this.logger = this.createWinstonLogger();
    }
    createWinstonLogger() {
        const logLevel = this.configService.get('LOG_LEVEL', 'info');
        const nodeEnv = this.configService.get('NODE_ENV', 'development');
        const transports = [
            new winston.transports.Console({
                format: winston.format.combine(winston.format.colorize(), winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.printf(({ level, message, timestamp, ...meta }) => {
                    const metaStr = Object.keys(meta).length ? `\\n${JSON.stringify(meta, null, 2)}` : '';
                    return `${timestamp} [${level}] ${message}${metaStr}`;
                })),
            }),
        ];
        if (nodeEnv === 'production') {
            transports.push(new DailyRotateFile({
                filename: 'logs/lif3-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                maxFiles: '14d',
                maxSize: '20m',
                format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json()),
            }));
            transports.push(new DailyRotateFile({
                filename: 'logs/lif3-error-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                level: 'error',
                maxFiles: '30d',
                maxSize: '20m',
                format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json()),
            }));
            transports.push(new DailyRotateFile({
                filename: 'logs/financial-audit-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                maxFiles: '90d',
                maxSize: '50m',
                format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
            }));
            transports.push(new DailyRotateFile({
                filename: 'logs/security-audit-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                maxFiles: '90d',
                maxSize: '50m',
                format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
            }));
        }
        return winston.createLogger({
            level: logLevel,
            format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json()),
            transports,
            exceptionHandlers: [
                new winston.transports.File({ filename: 'logs/exceptions.log' }),
            ],
            rejectionHandlers: [
                new winston.transports.File({ filename: 'logs/rejections.log' }),
            ],
        });
    }
    log(message, context) {
        this.logger.info(message, {
            ...context,
            timestamp: new Date().toISOString(),
            service: 'lif3-backend',
        });
    }
    logFinancial(message, context) {
        this.logger.info(message, {
            ...context,
            timestamp: new Date().toISOString(),
            service: 'lif3-backend',
            category: 'financial',
            auditType: 'financial_operation',
        });
        this.logger.info(message, {
            ...context,
            timestamp: new Date().toISOString(),
            service: 'lif3-backend',
            category: 'financial_audit',
        });
    }
    logMCP(message, context) {
        this.logger.info(message, {
            ...context,
            timestamp: new Date().toISOString(),
            service: 'lif3-backend',
            category: 'mcp',
            framework: 'mcp',
        });
    }
    logSecurity(message, context) {
        this.logger.warn(message, {
            ...context,
            timestamp: new Date().toISOString(),
            service: 'lif3-backend',
            category: 'security',
            auditType: 'security_event',
        });
    }
    logPerformance(message, context) {
        this.logger.info(message, {
            ...context,
            timestamp: new Date().toISOString(),
            service: 'lif3-backend',
            category: 'performance',
        });
    }
    logAutomation(message, context) {
        this.logger.info(message, {
            ...context,
            timestamp: new Date().toISOString(),
            service: 'lif3-backend',
            category: 'automation',
            auditType: 'automation_event',
        });
    }
    logGoalTracking(message, context) {
        this.logger.info(message, {
            ...context,
            timestamp: new Date().toISOString(),
            service: 'lif3-backend',
            category: 'goal_tracking',
            auditType: 'goal_progress',
        });
    }
    error(message, error, context) {
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
    warn(message, context) {
        this.logger.warn(message, {
            ...context,
            timestamp: new Date().toISOString(),
            service: 'lif3-backend',
            category: 'warning',
        });
    }
    debug(message, context) {
        if (this.configService.get('NODE_ENV') === 'development') {
            this.logger.debug(message, {
                ...context,
                timestamp: new Date().toISOString(),
                service: 'lif3-backend',
                category: 'debug',
            });
        }
    }
    logFinancialTransaction(type, amount, currency = 'ZAR', context) {
        this.logFinancial(`Financial transaction: ${type}`, {
            ...context,
            amount,
            currency,
            operation: `financial_${type}`,
            auditType: 'financial_transaction',
        });
    }
    logMCPOperation(operation, serverId, context) {
        this.logMCP(`MCP operation: ${operation}`, {
            ...context,
            serverId,
            operation: `mcp_${operation}`,
        });
    }
    logAutomationTrigger(ruleId, triggeredBy, action, success, context) {
        this.logAutomation(`Automation triggered: ${ruleId}`, {
            ...context,
            ruleId,
            triggeredBy,
            action,
            success,
            operation: 'automation_trigger',
        });
    }
    logGoalMilestone(goalType, currentAmount, targetAmount, progressPercentage, context) {
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
    getLogger() {
        return this.logger;
    }
    createChildLogger(defaultContext) {
        return {
            log: (message, context) => this.log(message, { ...defaultContext, ...context }),
            error: (message, error, context) => this.error(message, error, { ...defaultContext, ...context }),
            warn: (message, context) => this.warn(message, { ...defaultContext, ...context }),
            debug: (message, context) => this.debug(message, { ...defaultContext, ...context }),
        };
    }
};
exports.AdvancedLoggerService = AdvancedLoggerService;
exports.AdvancedLoggerService = AdvancedLoggerService = AdvancedLoggerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AdvancedLoggerService);
//# sourceMappingURL=advanced-logger.service.js.map