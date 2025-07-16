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
exports.UnifiedTask = exports.TaskType = exports.TaskPriority = exports.TaskStatus = void 0;
const typeorm_1 = require("typeorm");
const unified_user_entity_1 = require("./unified-user.entity");
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "pending";
    TaskStatus["IN_PROGRESS"] = "in_progress";
    TaskStatus["COMPLETED"] = "completed";
    TaskStatus["CANCELLED"] = "cancelled";
    TaskStatus["ON_HOLD"] = "on_hold";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var TaskPriority;
(function (TaskPriority) {
    TaskPriority["LOW"] = "low";
    TaskPriority["MEDIUM"] = "medium";
    TaskPriority["HIGH"] = "high";
    TaskPriority["URGENT"] = "urgent";
})(TaskPriority || (exports.TaskPriority = TaskPriority = {}));
var TaskType;
(function (TaskType) {
    TaskType["GENERAL"] = "general";
    TaskType["FINANCIAL"] = "financial";
    TaskType["BUSINESS"] = "business";
    TaskType["ERROR"] = "error";
    TaskType["AUTOMATION"] = "automation";
})(TaskType || (exports.TaskType = TaskType = {}));
let UnifiedTask = class UnifiedTask {
};
exports.UnifiedTask = UnifiedTask;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UnifiedTask.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], UnifiedTask.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UnifiedTask.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], UnifiedTask.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDING }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], UnifiedTask.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM }),
    __metadata("design:type", String)
], UnifiedTask.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TaskType, default: TaskType.GENERAL }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], UnifiedTask.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], UnifiedTask.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UnifiedTask.prototype, "assigneeId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], UnifiedTask.prototype, "platformId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UnifiedTask.prototype, "externalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], UnifiedTask.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], UnifiedTask.prototype, "syncStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], UnifiedTask.prototype, "isAutomated", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], UnifiedTask.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], UnifiedTask.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], UnifiedTask.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => unified_user_entity_1.UnifiedUser, user => user.tasks),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", unified_user_entity_1.UnifiedUser)
], UnifiedTask.prototype, "user", void 0);
exports.UnifiedTask = UnifiedTask = __decorate([
    (0, typeorm_1.Entity)('unified_tasks'),
    (0, typeorm_1.Index)(['userId', 'status']),
    (0, typeorm_1.Index)(['platformId', 'externalId'], { unique: true })
], UnifiedTask);
//# sourceMappingURL=unified-task.entity.js.map