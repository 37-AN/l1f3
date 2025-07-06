"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogIntegrationEvent = exports.LogSecurityEvent = exports.LogBusinessMetric = exports.LogGoalProgress = exports.LogAccountUpdate = exports.LogFinancialTransaction = exports.AuditLog = exports.AUDIT_LOG_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.AUDIT_LOG_KEY = 'auditLog';
const AuditLog = (options) => (0, common_1.SetMetadata)(exports.AUDIT_LOG_KEY, options);
exports.AuditLog = AuditLog;
const LogFinancialTransaction = (description) => (0, exports.AuditLog)({
    entity: 'TRANSACTION',
    action: 'CREATE',
    sensitive: true,
    description
});
exports.LogFinancialTransaction = LogFinancialTransaction;
const LogAccountUpdate = (description) => (0, exports.AuditLog)({
    entity: 'ACCOUNT',
    action: 'UPDATE',
    sensitive: true,
    description
});
exports.LogAccountUpdate = LogAccountUpdate;
const LogGoalProgress = (description) => (0, exports.AuditLog)({
    entity: 'GOAL',
    action: 'UPDATE',
    sensitive: false,
    description
});
exports.LogGoalProgress = LogGoalProgress;
const LogBusinessMetric = (description) => (0, exports.AuditLog)({
    entity: 'BUSINESS_METRIC',
    action: 'CREATE',
    sensitive: false,
    description
});
exports.LogBusinessMetric = LogBusinessMetric;
const LogSecurityEvent = (description) => (0, exports.AuditLog)({
    entity: 'USER',
    action: 'UPDATE',
    sensitive: true,
    description
});
exports.LogSecurityEvent = LogSecurityEvent;
const LogIntegrationEvent = (description) => (0, exports.AuditLog)({
    entity: 'BUSINESS_METRIC',
    action: 'CREATE',
    sensitive: false,
    description
});
exports.LogIntegrationEvent = LogIntegrationEvent;
//# sourceMappingURL=audit-log.decorator.js.map