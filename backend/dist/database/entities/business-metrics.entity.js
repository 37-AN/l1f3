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
exports.BusinessMetrics = exports.BusinessStage = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const enums_1 = require("./enums");
var BusinessStage;
(function (BusinessStage) {
    BusinessStage["FOUNDATION"] = "FOUNDATION";
    BusinessStage["STARTUP"] = "STARTUP";
    BusinessStage["GROWTH"] = "GROWTH";
    BusinessStage["SCALE"] = "SCALE";
    BusinessStage["MATURE"] = "MATURE";
})(BusinessStage || (exports.BusinessStage = BusinessStage = {}));
let BusinessMetrics = class BusinessMetrics {
    get revenueProgress() {
        return this.targetDailyRevenue > 0 ? (this.dailyRevenue / this.targetDailyRevenue) * 100 : 0;
    }
};
exports.BusinessMetrics = BusinessMetrics;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BusinessMetrics.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, default: '43V3R' }),
    __metadata("design:type", String)
], BusinessMetrics.prototype, "businessName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], BusinessMetrics.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], BusinessMetrics.prototype, "dailyRevenue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], BusinessMetrics.prototype, "monthlyRecurringRevenue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], BusinessMetrics.prototype, "pipelineValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], BusinessMetrics.prototype, "activeUsers", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], BusinessMetrics.prototype, "activeClients", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], BusinessMetrics.prototype, "monthlyExpenses", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], BusinessMetrics.prototype, "netProfit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, default: 4881 }),
    __metadata("design:type", Number)
], BusinessMetrics.prototype, "targetDailyRevenue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, default: 147917 }),
    __metadata("design:type", Number)
], BusinessMetrics.prototype, "targetMonthlyRevenue", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: BusinessStage,
        default: BusinessStage.FOUNDATION,
    }),
    __metadata("design:type", String)
], BusinessMetrics.prototype, "stage", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.Currency,
        default: enums_1.Currency.ZAR,
    }),
    __metadata("design:type", String)
], BusinessMetrics.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], BusinessMetrics.prototype, "metrics", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], BusinessMetrics.prototype, "serviceBreakdown", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], BusinessMetrics.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], BusinessMetrics.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], BusinessMetrics.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.businessMetrics),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], BusinessMetrics.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], BusinessMetrics.prototype, "userId", void 0);
exports.BusinessMetrics = BusinessMetrics = __decorate([
    (0, typeorm_1.Entity)('business_metrics'),
    (0, typeorm_1.Index)(['userId', 'date'])
], BusinessMetrics);
//# sourceMappingURL=business-metrics.entity.js.map