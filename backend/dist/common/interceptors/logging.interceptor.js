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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const logger_service_1 = require("../logger/logger.service");
let LoggingInterceptor = class LoggingInterceptor {
    constructor(logger) {
        this.logger = logger;
    }
    intercept(context, next) {
        const now = Date.now();
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const { method, url, ip, headers } = request;
        const userAgent = headers['user-agent'] || '';
        const userId = request.user?.id || null;
        return next.handle().pipe((0, operators_1.tap)((data) => {
            const duration = Date.now() - now;
            const statusCode = response.statusCode;
            this.logger.logAPIAccess(method, url, userId, statusCode, duration, ip);
            if (url.includes('/financial/') || url.includes('/transactions/') || url.includes('/accounts/')) {
                this.logger.logFinancialAudit({
                    userId: userId || 'anonymous',
                    action: 'VIEW',
                    entity: this.getEntityFromUrl(url),
                    currency: 'ZAR',
                    ipAddress: ip,
                    userAgent,
                    timestamp: new Date(),
                    metadata: { endpoint: url, method, statusCode, duration }
                });
            }
            if (url.includes('/auth/') || url.includes('/login') || url.includes('/register')) {
                this.logger.logSecurityEvent({
                    userId: userId || 'anonymous',
                    action: this.getSecurityActionFromUrl(url, method),
                    ipAddress: ip,
                    userAgent,
                    timestamp: new Date(),
                    riskLevel: this.calculateRiskLevel(url, method, statusCode),
                    metadata: { endpoint: url, method, statusCode, duration }
                });
            }
            if (url.includes('/business/') || url.includes('/43v3r/')) {
                this.logger.logBusinessMetric({
                    metric: this.getBusinessMetricFromUrl(url),
                    value: data?.value || 0,
                    currency: 'ZAR',
                    timestamp: new Date(),
                    source: 'MANUAL',
                    metadata: { endpoint: url, method, statusCode, duration }
                });
            }
            if (duration > 5000) {
                this.logger.logPerformanceMetric('SLOW_REQUEST', duration, 'ms', `${method} ${url}`);
            }
        }));
    }
    getEntityFromUrl(url) {
        if (url.includes('/transactions'))
            return 'TRANSACTION';
        if (url.includes('/accounts'))
            return 'ACCOUNT';
        if (url.includes('/goals'))
            return 'GOAL';
        if (url.includes('/balance'))
            return 'BALANCE';
        return 'TRANSACTION';
    }
    getSecurityActionFromUrl(url, method) {
        if (url.includes('/login'))
            return 'LOGIN';
        if (url.includes('/logout'))
            return 'LOGOUT';
        if (url.includes('/register'))
            return 'REGISTER';
        if (url.includes('/password') && method === 'PUT')
            return 'PASSWORD_CHANGE';
        return 'PERMISSION_DENIED';
    }
    getBusinessMetricFromUrl(url) {
        if (url.includes('/revenue'))
            return '43V3R_REVENUE';
        if (url.includes('/mrr'))
            return '43V3R_MRR';
        if (url.includes('/customers'))
            return '43V3R_CUSTOMERS';
        if (url.includes('/pipeline'))
            return '43V3R_PIPELINE';
        if (url.includes('/net-worth'))
            return 'NET_WORTH_PROGRESS';
        return 'GOAL_MILESTONE';
    }
    calculateRiskLevel(url, method, statusCode) {
        if (statusCode >= 400)
            return 'HIGH';
        if (url.includes('/admin/'))
            return 'HIGH';
        if (url.includes('/financial/') && method !== 'GET')
            return 'MEDIUM';
        return 'LOW';
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [logger_service_1.LoggerService])
], LoggingInterceptor);
//# sourceMappingURL=logging.interceptor.js.map