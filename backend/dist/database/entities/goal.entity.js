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
exports.Goal = exports.GoalPriority = exports.GoalStatus = exports.GoalType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const enums_1 = require("./enums");
var GoalType;
(function (GoalType) {
    GoalType["NET_WORTH"] = "NET_WORTH";
    GoalType["SAVINGS"] = "SAVINGS";
    GoalType["INVESTMENT"] = "INVESTMENT";
    GoalType["BUSINESS_REVENUE"] = "BUSINESS_REVENUE";
    GoalType["DEBT_REDUCTION"] = "DEBT_REDUCTION";
    GoalType["EMERGENCY_FUND"] = "EMERGENCY_FUND";
    GoalType["CUSTOM"] = "CUSTOM";
})(GoalType || (exports.GoalType = GoalType = {}));
var GoalStatus;
(function (GoalStatus) {
    GoalStatus["ACTIVE"] = "ACTIVE";
    GoalStatus["COMPLETED"] = "COMPLETED";
    GoalStatus["PAUSED"] = "PAUSED";
    GoalStatus["CANCELLED"] = "CANCELLED";
})(GoalStatus || (exports.GoalStatus = GoalStatus = {}));
var GoalPriority;
(function (GoalPriority) {
    GoalPriority["LOW"] = "LOW";
    GoalPriority["MEDIUM"] = "MEDIUM";
    GoalPriority["HIGH"] = "HIGH";
    GoalPriority["CRITICAL"] = "CRITICAL";
})(GoalPriority || (exports.GoalPriority = GoalPriority = {}));
let Goal = class Goal {
    get progressPercentage() {
        return this.targetAmount > 0 ? (this.currentAmount / this.targetAmount) * 100 : 0;
    }
    get remainingAmount() {
        return Math.max(0, this.targetAmount - this.currentAmount);
    }
    get daysRemaining() {
        const today = new Date();
        const deadline = new Date(this.deadline);
        const timeDiff = deadline.getTime() - today.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }
};
exports.Goal = Goal;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Goal.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Goal.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Goal.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: GoalType,
    }),
    __metadata("design:type", String)
], Goal.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Goal.prototype, "targetAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Goal.prototype, "currentAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.Currency,
        default: enums_1.Currency.ZAR,
    }),
    __metadata("design:type", String)
], Goal.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Goal.prototype, "deadline", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: GoalStatus,
        default: GoalStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], Goal.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: GoalPriority,
        default: GoalPriority.MEDIUM,
    }),
    __metadata("design:type", String)
], Goal.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Goal.prototype, "monthlyTarget", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Goal.prototype, "weeklyTarget", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Goal.prototype, "dailyTarget", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Goal.prototype, "isRecurring", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Goal.prototype, "recurringPattern", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], Goal.prototype, "milestones", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Goal.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Goal.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Goal.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.goals),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], Goal.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Goal.prototype, "userId", void 0);
exports.Goal = Goal = __decorate([
    (0, typeorm_1.Entity)('goals'),
    (0, typeorm_1.Index)(['userId', 'status'])
], Goal);
//# sourceMappingURL=goal.entity.js.map