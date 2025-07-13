import { LoggerService } from '../../common/logger/logger.service';
export interface CreateTransactionDto {
    accountId: string;
    amount: number;
    currency: 'ZAR' | 'USD';
    description: string;
    category: string;
    type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
    date: Date;
}
export interface UpdateBalanceDto {
    accountId: string;
    newBalance: number;
    currency: 'ZAR' | 'USD';
    source: 'MANUAL' | 'BANK_SYNC' | 'INTEGRATION';
}
export interface NetWorthMetrics {
    current: number;
    target: number;
    progress: number;
    liquidCash: number;
    investments: number;
    businessEquity: number;
    totalAssets: number;
    totalLiabilities: number;
}
export declare class FinancialService {
    private readonly logger;
    constructor(logger: LoggerService);
    createTransaction(userId: string, dto: CreateTransactionDto, ipAddress?: string, userAgent?: string): Promise<{
        userId: string;
        createdAt: Date;
        accountId: string;
        amount: number;
        currency: "ZAR" | "USD";
        description: string;
        category: string;
        type: "INCOME" | "EXPENSE" | "TRANSFER";
        date: Date;
        id: string;
    }>;
    updateAccountBalance(userId: string, dto: UpdateBalanceDto, ipAddress?: string, userAgent?: string): Promise<{
        accountId: string;
        previousBalance: number;
        newBalance: number;
        changeAmount: number;
        changePercent: number;
        currency: "ZAR" | "USD";
        source: "MANUAL" | "BANK_SYNC" | "INTEGRATION";
        updatedAt: Date;
    }>;
    calculateNetWorth(userId: string): Promise<NetWorthMetrics>;
    log43V3RRevenue(amount: number, source: string, description?: string): Promise<{
        amount: number;
        source: string;
        description: string;
        dailyTarget: number;
        achievementPercent: number;
    }>;
    updateMRRProgress(currentMRR: number): Promise<{
        currentMRR: number;
        targetMRR: number;
        progressPercent: number;
    }>;
    private getAccountBalance;
    private getPreviousNetWorth;
}
