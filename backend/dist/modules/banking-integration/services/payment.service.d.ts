import { AdvancedLoggerService } from '../../../common/logger/advanced-logger.service';
import { PaymentInstruction } from '../interfaces/banking.interface';
export declare class PaymentService {
    private readonly advancedLogger;
    private readonly logger;
    private pendingPayments;
    constructor(advancedLogger: AdvancedLoggerService);
    createPayment(payment: Omit<PaymentInstruction, 'id' | 'status' | 'createdAt'>): Promise<PaymentInstruction>;
    getPayment(paymentId: string): Promise<PaymentInstruction | undefined>;
    getAllPayments(): Promise<PaymentInstruction[]>;
}
