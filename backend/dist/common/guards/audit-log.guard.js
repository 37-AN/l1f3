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
exports.AuditLogGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const logger_service_1 = require("../logger/logger.service");
const audit_log_decorator_1 = require("../decorators/audit-log.decorator");
let AuditLogGuard = class AuditLogGuard {
    constructor(reflector, logger) {
        this.reflector = reflector;
        this.logger = logger;
    }
    canActivate(context) {
        const auditLogOptions = this.reflector.get(audit_log_decorator_1.AUDIT_LOG_KEY, context.getHandler());
        if (!auditLogOptions) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const { method, url, ip, headers, user, body, params } = request;
        const userAgent = headers['user-agent'] || '';
        const userId = user?.id || 'anonymous';
        this.logger.logFinancialAudit({
            userId,
            action: auditLogOptions.action,
            entity: auditLogOptions.entity,
            entityId: params?.id || body?.id,
            amount: body?.amount || body?.value,
            currency: body?.currency || 'ZAR',
            ipAddress: ip,
            userAgent,
            timestamp: new Date(),
            metadata: {
                endpoint: url,
                method,
                description: auditLogOptions.description,
                sensitive: auditLogOptions.sensitive,
                requestBody: auditLogOptions.sensitive ? '[REDACTED]' : body,
                params: auditLogOptions.sensitive ? '[REDACTED]' : params,
            }
        });
        return true;
    }
};
exports.AuditLogGuard = AuditLogGuard;
exports.AuditLogGuard = AuditLogGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        logger_service_1.LoggerService])
], AuditLogGuard);
//# sourceMappingURL=audit-log.guard.js.map