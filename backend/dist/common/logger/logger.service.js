"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerService = void 0;
const common_1 = require("@nestjs/common");
const nest_winston_1 = require("nest-winston");
const winston_1 = require("winston");
let LoggerService = class LoggerService {
    constructor(logger) {
        this.logger = logger;
    }
    log(message, context) {
        this.logger.info(message, { context });
    }
    error(message, trace, context) {
        this.logger.error(message, { trace, context });
    }
    warn(message, context) {
        this.logger.warn(message, { context });
    }
    debug(message, context) {
        this.logger.debug(message, { context });
    }
    verbose(message, context) {
        this.logger.verbose(message, { context });
    }
    logFinancialAudit(auditLog) {
        this.logger.info('FINANCIAL_AUDIT', {
            type: 'FINANCIAL_AUDIT',
            ...auditLog,
        });
    }
    logSecurityEvent(securityLog) {
        this.logger.info('SECURITY_AUDIT', {
            type: 'SECURITY_AUDIT',
            ...securityLog,
        });
    }
    logBusinessMetric(metricLog) {
        this.logger.info('BUSINESS_METRIC', {
            type: 'BUSINESS_METRIC',
            ...metricLog,
        });
    }
    logIntegration(integrationLog) {
        this.logger.info('INTEGRATION', {
            type: 'INTEGRATION',
            ...integrationLog,
        });
    }
    logWebSocketEvent(event, data, userId) {
        this.logger.info('WEBSOCKET_EVENT', {
            type: 'WEBSOCKET_EVENT',
            event,
            userId,
            data,
            timestamp: new Date(),
        });
    }
    logAPIAccess(method, endpoint, userId, statusCode, duration, ipAddress) {
        this.logger.info('API_ACCESS', {
            type: 'API_ACCESS',
            method,
            endpoint,
            userId,
            statusCode,
            duration,
            ipAddress,
            timestamp: new Date(),
        });
    }
    logPerformanceMetric(metric, value, unit, context) {
        this.logger.info('PERFORMANCE_METRIC', {
            type: 'PERFORMANCE_METRIC',
            metric,
            value,
            unit,
            context,
            timestamp: new Date(),
        });
    }
    logZARCurrencyOperation(operation, amount, fromCurrency, exchangeRate, userId) {
        this.logger.info('ZAR_CURRENCY_OPERATION', {
            type: 'ZAR_CURRENCY_OPERATION',
            operation,
            amount,
            fromCurrency,
            exchangeRate,
            userId,
            timestamp: new Date(),
        });
    }
    logGoalProgress(goalId, userId, currentAmount, targetAmount, progressPercent) {
        this.logger.info('GOAL_PROGRESS', {
            type: 'GOAL_PROGRESS',
            goalId,
            userId,
            currentAmount,
            targetAmount,
            progressPercent,
            timestamp: new Date(),
        });
    }
    logNetWorthUpdate(userId, previousNetWorth, newNetWorth, changeAmount, changePercent) {
        this.logger.info('NET_WORTH_UPDATE', {
            type: 'NET_WORTH_UPDATE',
            userId,
            previousNetWorth,
            newNetWorth,
            changeAmount,
            changePercent,
            timestamp: new Date(),
        });
    }
    log43V3RRevenue(amount, source, description) {
        this.logger.info('43V3R_REVENUE', {
            type: '43V3R_REVENUE',
            amount,
            currency: 'ZAR',
            source,
            description,
            timestamp: new Date(),
        });
    }
    logDailyRevenueTarget(currentRevenue, targetRevenue = 4881, achievementPercent) {
        this.logger.info('DAILY_REVENUE_TARGET', {
            type: 'DAILY_REVENUE_TARGET',
            currentRevenue,
            targetRevenue,
            achievementPercent,
            timestamp: new Date(),
        });
    }
    logMRRProgress(currentMRR, targetMRR = 147917, progressPercent) {
        this.logger.info('MRR_PROGRESS', {
            type: 'MRR_PROGRESS',
            currentMRR,
            targetMRR,
            progressPercent,
            timestamp: new Date(),
        });
    }
};
exports.LoggerService = LoggerService;
exports.LoggerService = LoggerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(nest_winston_1.WINSTON_MODULE_PROVIDER)),
    __metadata("design:paramtypes", [winston_1.Logger])
], LoggerService);
//# sourceMappingURL=logger.service.js.map