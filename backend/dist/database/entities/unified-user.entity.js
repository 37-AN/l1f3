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
exports.UnifiedUser = void 0;
const typeorm_1 = require("typeorm");
const unified_task_entity_1 = require("./unified-task.entity");
const unified_document_entity_1 = require("./unified-document.entity");
const unified_notification_entity_1 = require("./unified-notification.entity");
let UnifiedUser = class UnifiedUser {
};
exports.UnifiedUser = UnifiedUser;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UnifiedUser.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], UnifiedUser.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UnifiedUser.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UnifiedUser.prototype, "avatar", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'Africa/Johannesburg' }),
    __metadata("design:type", String)
], UnifiedUser.prototype, "timezone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], UnifiedUser.prototype, "preferences", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], UnifiedUser.prototype, "financialTargets", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], UnifiedUser.prototype, "integrationSettings", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], UnifiedUser.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], UnifiedUser.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], UnifiedUser.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => unified_task_entity_1.UnifiedTask, task => task.user),
    __metadata("design:type", Array)
], UnifiedUser.prototype, "tasks", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => unified_document_entity_1.UnifiedDocument, document => document.user),
    __metadata("design:type", Array)
], UnifiedUser.prototype, "documents", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => unified_notification_entity_1.UnifiedNotification, notification => notification.user),
    __metadata("design:type", Array)
], UnifiedUser.prototype, "notifications", void 0);
exports.UnifiedUser = UnifiedUser = __decorate([
    (0, typeorm_1.Entity)('unified_users'),
    (0, typeorm_1.Index)(['email'], { unique: true })
], UnifiedUser);
//# sourceMappingURL=unified-user.entity.js.map