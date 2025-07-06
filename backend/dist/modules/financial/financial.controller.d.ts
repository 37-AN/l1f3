import { FinancialService, CreateTransactionDto, UpdateBalanceDto } from './financial.service';
export declare class FinancialController {
    private readonly financialService;
    constructor(financialService: FinancialService);
    getDashboard(req: any): Promise<{
        user: {
            id: any;
            name: string;
            email: string;
        };
        netWorth: import("./financial.service").NetWorthMetrics;
        summary: {
            totalNetWorth: number;
            targetNetWorth: number;
            progressPercent: number;
            remainingToTarget: number;
            monthsToTarget: number;
        };
        accounts: {
            id: string;
            name: string;
            balance: number;
            currency: string;
        }[];
        businessMetrics: {
            dailyRevenueTarget: number;
            currentDailyRevenue: number;
            mrrTarget: number;
            currentMRR: number;
            revenueProgress: number;
        };
        goals: {
            id: string;
            name: string;
            target: number;
            current: number;
            progress: number;
            deadline: string;
        }[];
    }>;
    createTransaction(dto: CreateTransactionDto, req: any): Promise<{
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
    updateAccountBalance(accountId: string, dto: UpdateBalanceDto, req: any): Promise<{
        accountId: string;
        previousBalance: number;
        newBalance: number;
        changeAmount: number;
        changePercent: number;
        currency: "ZAR" | "USD";
        source: "MANUAL" | "BANK_SYNC" | "INTEGRATION";
        updatedAt: Date;
    }>;
    getNetWorth(req: any): Promise<import("./financial.service").NetWorthMetrics>;
    getGoals(req: any): Promise<{
        id: string;
        name: string;
        type: string;
        target: number;
        current: number;
        progress: number;
        deadline: string;
        priority: string;
    }[]>;
    getNetWorthTrend(req: any): Promise<{
        trend: string;
        averageMonthlyGrowth: number;
        projectedTargetDate: string;
        milestones: {
            amount: number;
            date: string;
            achieved: boolean;
        }[];
    }>;
    get43V3RMetrics(req: any): Promise<{
        revenue: {
            daily: {
                current: number;
                target: number;
                progress: number;
            };
            monthly: {
                current: number;
                target: number;
                progress: number;
            };
            quarterly: {
                current: number;
                target: number;
                progress: number;
            };
        };
        customers: {
            total: number;
            active: number;
            churn: number;
            acquisition: number;
        };
        pipeline: {
            value: number;
            deals: number;
            conversion: number;
        };
        growth: {
            rate: number;
            projection: string;
            targetAchievement: number;
        };
    }>;
}
export declare class BusinessController {
    private readonly financialService;
    constructor(financialService: FinancialService);
    logRevenue(dto: {
        amount: number;
        source: string;
        description?: string;
    }): Promise<{
        amount: number;
        source: string;
        description: string;
        dailyTarget: number;
        achievementPercent: number;
    }>;
    updateMRR(dto: {
        currentMRR: number;
    }): Promise<{
        currentMRR: number;
        targetMRR: number;
        progressPercent: number;
    }>;
    getMetrics(): Promise<{
        company: string;
        metrics: {
            dailyRevenue: {
                current: number;
                target: number;
                progress: number;
            };
            mrr: {
                current: number;
                target: number;
                progress: number;
            };
            customers: {
                total: number;
                active: number;
                churn: number;
            };
            pipeline: {
                value: number;
                deals: number;
                conversion: number;
            };
        };
        goals: {
            metric: string;
            target: number;
            current: number;
            priority: string;
        }[];
    }>;
}
