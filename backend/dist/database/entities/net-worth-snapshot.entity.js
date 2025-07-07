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
exports.NetWorthSnapshot = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const enums_1 = require("./enums");
let NetWorthSnapshot = class NetWorthSnapshot {
};
exports.NetWorthSnapshot = NetWorthSnapshot;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], NetWorthSnapshot.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], NetWorthSnapshot.prototype, "netWorth", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], NetWorthSnapshot.prototype, "liquidCash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], NetWorthSnapshot.prototype, "investments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], NetWorthSnapshot.prototype, "businessEquity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], NetWorthSnapshot.prototype, "totalAssets", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], NetWorthSnapshot.prototype, "totalLiabilities", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], NetWorthSnapshot.prototype, "targetNetWorth", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], NetWorthSnapshot.prototype, "progressPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.Currency,
        default: enums_1.Currency.ZAR,
    }),
    __metadata("design:type", String)
], NetWorthSnapshot.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], NetWorthSnapshot.prototype, "breakdown", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], NetWorthSnapshot.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], NetWorthSnapshot.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.netWorthSnapshots),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], NetWorthSnapshot.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], NetWorthSnapshot.prototype, "userId", void 0);
exports.NetWorthSnapshot = NetWorthSnapshot = __decorate([
    (0, typeorm_1.Entity)('net_worth_snapshots'),
    (0, typeorm_1.Index)(['userId', 'createdAt'])
], NetWorthSnapshot);
//# sourceMappingURL=net-worth-snapshot.entity.js.map