import { User } from './user.entity';
import { Currency } from './enums';
export declare enum BusinessStage {
    FOUNDATION = "FOUNDATION",
    STARTUP = "STARTUP",
    GROWTH = "GROWTH",
    SCALE = "SCALE",
    MATURE = "MATURE"
}
export declare class BusinessMetrics {
    id: string;
    businessName: string;
    date: Date;
    dailyRevenue: number;
    monthlyRecurringRevenue: number;
    pipelineValue: number;
    activeUsers: number;
    activeClients: number;
    monthlyExpenses: number;
    netProfit: number;
    targetDailyRevenue: number;
    targetMonthlyRevenue: number;
    stage: BusinessStage;
    currency: Currency;
    metrics: {
        conversionRate?: number;
        customerAcquisitionCost?: number;
        lifetimeValue?: number;
        churnRate?: number;
        growthRate?: number;
        burnRate?: number;
        runway?: number;
    };
    serviceBreakdown: {
        ai: number;
        web3: number;
        crypto: number;
        quantum: number;
        consulting: number;
        other: number;
    };
    notes: string;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    userId: string;
    get revenueProgress(): number;
}
