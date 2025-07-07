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
exports.Account = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const enums_1 = require("./enums");
const transaction_entity_1 = require("./transaction.entity");
const account_balance_entity_1 = require("./account-balance.entity");
let Account = class Account {
};
exports.Account = Account;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Account.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Account.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.AccountType,
    }),
    __metadata("design:type", String)
], Account.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.AccountProvider,
    }),
    __metadata("design:type", String)
], Account.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Account.prototype, "accountNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.Currency,
        default: enums_1.Currency.ZAR,
    }),
    __metadata("design:type", String)
], Account.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Account.prototype, "currentBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Account.prototype, "availableBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Account.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Account.prototype, "isConnected", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Account.prototype, "lastSyncAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Account.prototype, "institutionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Account.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Account.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Account.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.accounts),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], Account.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Account.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => transaction_entity_1.Transaction, (transaction) => transaction.account),
    __metadata("design:type", Array)
], Account.prototype, "transactions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => account_balance_entity_1.AccountBalance, (balance) => balance.account),
    __metadata("design:type", Array)
], Account.prototype, "balanceHistory", void 0);
exports.Account = Account = __decorate([
    (0, typeorm_1.Entity)('accounts')
], Account);
//# sourceMappingURL=account.entity.js.map