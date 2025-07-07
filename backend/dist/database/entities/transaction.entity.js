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
exports.Transaction = exports.TransactionStatus = exports.TransactionCategory = exports.TransactionType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const account_entity_1 = require("./account.entity");
const enums_1 = require("./enums");
var TransactionType;
(function (TransactionType) {
    TransactionType["INCOME"] = "INCOME";
    TransactionType["EXPENSE"] = "EXPENSE";
    TransactionType["TRANSFER"] = "TRANSFER";
    TransactionType["INVESTMENT"] = "INVESTMENT";
    TransactionType["BUSINESS_REVENUE"] = "BUSINESS_REVENUE";
    TransactionType["BUSINESS_EXPENSE"] = "BUSINESS_EXPENSE";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionCategory;
(function (TransactionCategory) {
    TransactionCategory["SALARY"] = "SALARY";
    TransactionCategory["FREELANCE"] = "FREELANCE";
    TransactionCategory["BUSINESS_INCOME"] = "BUSINESS_INCOME";
    TransactionCategory["INVESTMENT_INCOME"] = "INVESTMENT_INCOME";
    TransactionCategory["GROCERIES"] = "GROCERIES";
    TransactionCategory["UTILITIES"] = "UTILITIES";
    TransactionCategory["RENT"] = "RENT";
    TransactionCategory["TRANSPORT"] = "TRANSPORT";
    TransactionCategory["ENTERTAINMENT"] = "ENTERTAINMENT";
    TransactionCategory["HEALTHCARE"] = "HEALTHCARE";
    TransactionCategory["EDUCATION"] = "EDUCATION";
    TransactionCategory["SHOPPING"] = "SHOPPING";
    TransactionCategory["BUSINESS_EXPENSE"] = "BUSINESS_EXPENSE";
    TransactionCategory["INVESTMENT"] = "INVESTMENT";
    TransactionCategory["TRANSFER"] = "TRANSFER";
    TransactionCategory["OTHER"] = "OTHER";
})(TransactionCategory || (exports.TransactionCategory = TransactionCategory = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["COMPLETED"] = "COMPLETED";
    TransactionStatus["FAILED"] = "FAILED";
    TransactionStatus["CANCELLED"] = "CANCELLED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
let Transaction = class Transaction {
};
exports.Transaction = Transaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Transaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Transaction.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.Currency,
        default: enums_1.Currency.ZAR,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TransactionType,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TransactionCategory,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500 }),
    __metadata("design:type", String)
], Transaction.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Transaction.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TransactionStatus,
        default: TransactionStatus.COMPLETED,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "referenceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "bankReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Transaction.prototype, "balanceAfter", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Transaction.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Transaction.prototype, "isRecurring", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "recurringPattern", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Transaction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Transaction.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.transactions),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], Transaction.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Transaction.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => account_entity_1.Account, (account) => account.transactions),
    (0, typeorm_1.JoinColumn)({ name: 'accountId' }),
    __metadata("design:type", account_entity_1.Account)
], Transaction.prototype, "account", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Transaction.prototype, "accountId", void 0);
exports.Transaction = Transaction = __decorate([
    (0, typeorm_1.Entity)('transactions'),
    (0, typeorm_1.Index)(['userId', 'date']),
    (0, typeorm_1.Index)(['accountId', 'date'])
], Transaction);
//# sourceMappingURL=transaction.entity.js.map