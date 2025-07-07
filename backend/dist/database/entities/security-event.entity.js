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
exports.SecurityEvent = exports.SecuritySeverity = exports.SecurityEventType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
var SecurityEventType;
(function (SecurityEventType) {
    SecurityEventType["LOGIN_ATTEMPT"] = "LOGIN_ATTEMPT";
    SecurityEventType["LOGIN_SUCCESS"] = "LOGIN_SUCCESS";
    SecurityEventType["LOGIN_FAILED"] = "LOGIN_FAILED";
    SecurityEventType["ACCOUNT_LOCKED"] = "ACCOUNT_LOCKED";
    SecurityEventType["ACCOUNT_UNLOCKED"] = "ACCOUNT_UNLOCKED";
    SecurityEventType["PASSWORD_CHANGED"] = "PASSWORD_CHANGED";
    SecurityEventType["MFA_ENABLED"] = "MFA_ENABLED";
    SecurityEventType["MFA_DISABLED"] = "MFA_DISABLED";
    SecurityEventType["SUSPICIOUS_ACTIVITY"] = "SUSPICIOUS_ACTIVITY";
    SecurityEventType["DATA_BREACH_ATTEMPT"] = "DATA_BREACH_ATTEMPT";
    SecurityEventType["UNAUTHORIZED_ACCESS"] = "UNAUTHORIZED_ACCESS";
    SecurityEventType["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
})(SecurityEventType || (exports.SecurityEventType = SecurityEventType = {}));
var SecuritySeverity;
(function (SecuritySeverity) {
    SecuritySeverity["LOW"] = "LOW";
    SecuritySeverity["MEDIUM"] = "MEDIUM";
    SecuritySeverity["HIGH"] = "HIGH";
    SecuritySeverity["CRITICAL"] = "CRITICAL";
})(SecuritySeverity || (exports.SecuritySeverity = SecuritySeverity = {}));
let SecurityEvent = class SecurityEvent {
};
exports.SecurityEvent = SecurityEvent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SecurityEvent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: SecurityEventType,
    }),
    __metadata("design:type", String)
], SecurityEvent.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: SecuritySeverity,
    }),
    __metadata("design:type", String)
], SecurityEvent.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], SecurityEvent.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 45, nullable: true }),
    __metadata("design:type", String)
], SecurityEvent.prototype, "sourceIp", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SecurityEvent.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], SecurityEvent.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], SecurityEvent.prototype, "isResolved", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SecurityEvent.prototype, "resolution", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], SecurityEvent.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SecurityEvent.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.securityEvents, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], SecurityEvent.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], SecurityEvent.prototype, "userId", void 0);
exports.SecurityEvent = SecurityEvent = __decorate([
    (0, typeorm_1.Entity)('security_events'),
    (0, typeorm_1.Index)(['userId', 'createdAt']),
    (0, typeorm_1.Index)(['eventType', 'severity'])
], SecurityEvent);
//# sourceMappingURL=security-event.entity.js.map