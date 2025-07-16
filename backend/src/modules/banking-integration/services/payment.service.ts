import { Injectable, Logger } from '@nestjs/common';
import { AdvancedLoggerService } from '../../../common/logger/advanced-logger.service';
import { PaymentInstruction } from '../interfaces/banking.interface';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private pendingPayments = new Map<string, PaymentInstruction>();

  constructor(private readonly advancedLogger: AdvancedLoggerService) {}

  async createPayment(payment: Omit<PaymentInstruction, 'id' | 'status' | 'createdAt'>): Promise<PaymentInstruction> {
    const paymentInstruction: PaymentInstruction = {
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

  async getPayment(paymentId: string): Promise<PaymentInstruction | undefined> {
    return this.pendingPayments.get(paymentId);
  }

  async getAllPayments(): Promise<PaymentInstruction[]> {
    return Array.from(this.pendingPayments.values());
  }
}