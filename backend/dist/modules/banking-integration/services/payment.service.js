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
var PaymentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const advanced_logger_service_1 = require("../../../common/logger/advanced-logger.service");
let PaymentService = PaymentService_1 = class PaymentService {
    constructor(advancedLogger) {
        this.advancedLogger = advancedLogger;
        this.logger = new common_1.Logger(PaymentService_1.name);
        this.pendingPayments = new Map();
    }
    async createPayment(payment) {
        const paymentInstruction = {
            ...payment,
            id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            status: 'pending',
            createdAt: new Date(),
        };
        this.pendingPayments.set(paymentInstruction.id, paymentInstruction);
        this.advancedLogger.logFinancial(`Payment instruction created: ${paymentInstruction.id}`, {
            operation: 'payment_creation',
            metadata: {
                paymentId: paymentInstruction.id,
                amount: paymentInstruction.amount,
                paymentType: paymentInstruction.paymentType,
            },
        });
        return paymentInstruction;
    }
    async getPayment(paymentId) {
        return this.pendingPayments.get(paymentId);
    }
    async getAllPayments() {
        return Array.from(this.pendingPayments.values());
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = PaymentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [advanced_logger_service_1.AdvancedLoggerService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map