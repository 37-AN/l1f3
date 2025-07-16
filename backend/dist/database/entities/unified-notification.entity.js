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
exports.UnifiedNotification = exports.NotificationChannel = exports.NotificationPriority = exports.NotificationType = void 0;
const typeorm_1 = require("typeorm");
const unified_user_entity_1 = require("./unified-user.entity");
var NotificationType;
(function (NotificationType) {
    NotificationType["SYSTEM"] = "system";
    NotificationType["FINANCIAL"] = "financial";
    NotificationType["BUSINESS"] = "business";
    NotificationType["ERROR"] = "error";
    NotificationType["AUTOMATION"] = "automation";
    NotificationType["GOAL_PROGRESS"] = "goal_progress";
    NotificationType["ALERT"] = "alert";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var NotificationPriority;
(function (NotificationPriority) {
    NotificationPriority["LOW"] = "low";
    NotificationPriority["MEDIUM"] = "medium";
    NotificationPriority["HIGH"] = "high";
    NotificationPriority["URGENT"] = "urgent";
})(NotificationPriority || (exports.NotificationPriority = NotificationPriority = {}));
var NotificationChannel;
(function (NotificationChannel) {
    NotificationChannel["DASHBOARD"] = "dashboard";
    NotificationChannel["EMAIL"] = "email";
    NotificationChannel["DISCORD"] = "discord";
    NotificationChannel["SLACK"] = "slack";
    NotificationChannel["WEBHOOK"] = "webhook";
})(NotificationChannel || (exports.NotificationChannel = NotificationChannel = {}));
let UnifiedNotification = class UnifiedNotification {
};
exports.UnifiedNotification = UnifiedNotification;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UnifiedNotification.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], UnifiedNotification.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UnifiedNotification.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], UnifiedNotification.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: NotificationType, default: NotificationType.SYSTEM }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], UnifiedNotification.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: NotificationPriority, default: NotificationPriority.MEDIUM }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], UnifiedNotification.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], UnifiedNotification.prototype, "channels", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Boolean)
], UnifiedNotification.prototype, "read", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], UnifiedNotification.prototype, "readAt", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], UnifiedNotification.prototype, "platformId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UnifiedNotification.prototype, "externalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], UnifiedNotification.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], UnifiedNotification.prototype, "deliveryStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], UnifiedNotification.prototype, "scheduledFor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], UnifiedNotification.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], UnifiedNotification.prototype, "isAutomated", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], UnifiedNotification.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], UnifiedNotification.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => unified_user_entity_1.UnifiedUser, user => user.notifications),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", unified_user_entity_1.UnifiedUser)
], UnifiedNotification.prototype, "user", void 0);
exports.UnifiedNotification = UnifiedNotification = __decorate([
    (0, typeorm_1.Entity)('unified_notifications'),
    (0, typeorm_1.Index)(['userId', 'read']),
    (0, typeorm_1.Index)(['platformId', 'externalId'], { unique: true })
], UnifiedNotification);
//# sourceMappingURL=unified-notification.entity.js.map