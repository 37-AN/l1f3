import { BankingIntegrationService } from './banking-integration.service';
import { TransactionCategorizationService } from './services/transaction-categorization.service';
import { FraudDetectionService } from './services/fraud-detection.service';
import { BankingInsightsService } from './services/banking-insights.service';
import { PaymentService } from './services/payment.service';
import { AdvancedLoggerService } from '../../common/logger/advanced-logger.service';
import { TransactionCategory } from './interfaces/banking.interface';
export declare class ConnectBankDto {
    bankId: string;
    connectionMethod?: 'direct' | 'okra';
}
export declare class UpdateTransactionCategoryDto {
    category: TransactionCategory;
}
export declare class CreatePaymentDto {
    fromAccountId: string;
    toAccount: {
        accountNumber: string;
        branchCode: string;
        accountName: string;
        bankId: string;
        reference: string;
    };
    amount: number;
    currency: string;
    paymentType: 'immediate' | 'future_dated' | 'recurring';
    scheduledDate?: string;
    description: string;
}
export declare class BankingIntegrationController {
    private readonly bankingService;
    private readonly categorizationService;
    private readonly fraudDetectionService;
    private readonly insightsService;
    private readonly paymentService;
    private readonly advancedLogger;
    private readonly logger;
    constructor(bankingService: BankingIntegrationService, categorizationService: TransactionCategorizationService, fraudDetectionService: FraudDetectionService, insightsService: BankingInsightsService, paymentService: PaymentService, advancedLogger: AdvancedLoggerService);
    getSupportedBanks(): Promise<{
        success: boolean;
        data: import("./interfaces/banking.interface").SouthAfricanBankInfo[];
        count: number;
        timestamp: string;
    }>;
    connectBank(dto: ConnectBankDto, userId: string): Promise<{
        success: boolean;
        data: import("./interfaces/banking.interface").BankConnection;
        message: string;
        timestamp: string;
    }>;
    getConnections(userId: string): Promise<{
        success: boolean;
        data: import("./interfaces/banking.interface").BankConnection[];
        count: number;
        timestamp: string;
    }>;
    syncAccountData(connectionId: string): Promise<{
        success: boolean;
        data: import("./interfaces/banking.interface").TransactionSyncResult[];
        message: string;
        timestamp: string;
    }>;
    getAccounts(userId: string): Promise<{
        success: boolean;
        data: import("./interfaces/banking.interface").BankAccount[];
        count: number;
        timestamp: string;
    }>;
    getAccountTransactions(accountId: string, limit?: string, offset?: string): Promise<{
        success: boolean;
        data: import("./interfaces/banking.interface").Transaction[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
            hasMore: boolean;
        };
        timestamp: string;
    }>;
    getBankingDashboard(userId: string): Promise<{
        success: boolean;
        data: import("./interfaces/banking.interface").BankingDashboard;
        timestamp: string;
    }>;
    updateTransactionCategory(transactionId: string, dto: UpdateTransactionCategoryDto): Promise<{
        success: boolean;
        message: string;
        timestamp: string;
    }>;
    getCategorizationStats(): Promise<{
        success: boolean;
        data: {
            totalRules: number;
            totalMerchants: number;
            learningDataSize: number;
            topCategories: {
                category: TransactionCategory;
                count: number;
            }[];
        };
        timestamp: string;
    }>;
    getFraudAlerts(userId: string, accountId?: string): Promise<{
        success: boolean;
        data: import("./interfaces/banking.interface").FraudAlert[];
        count: number;
        timestamp: string;
    } | {
        success: boolean;
        data: {
            activeAlerts: number;
        };
        timestamp: string;
        count?: undefined;
    }>;
    resolveFraudAlert(alertId: string, body: {
        resolution: string;
    }): Promise<{
        success: boolean;
        message: string;
        timestamp: string;
    }>;
    getFraudRules(): Promise<{
        success: boolean;
        data: import("./services/fraud-detection.service").FraudRule[];
        count: number;
        timestamp: string;
    }>;
    getBankingInsights(userId: string): Promise<{
        success: boolean;
        data: import("./interfaces/banking.interface").BankingInsight[];
        count: number;
        timestamp: string;
    }>;
    createPayment(dto: CreatePaymentDto): Promise<{
        success: boolean;
        data: import("./interfaces/banking.interface").PaymentInstruction;
        message: string;
        timestamp: string;
    }>;
    getPayments(): Promise<{
        success: boolean;
        data: import("./interfaces/banking.interface").PaymentInstruction[];
        count: number;
        timestamp: string;
    }>;
    getPayment(paymentId: string): Promise<{
        success: boolean;
        data: import("./interfaces/banking.interface").PaymentInstruction;
        timestamp: string;
    }>;
    disconnectBank(connectionId: string): Promise<{
        success: boolean;
        message: string;
        timestamp: string;
    }>;
    getConnectionStatus(connectionId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            status: "active" | "inactive" | "error" | "reauth_required";
            lastSyncAt: Date;
            errorMessage: string;
        };
        timestamp: string;
    }>;
}
