import { User } from './user.entity';
import { Currency } from './enums';
export declare class NetWorthSnapshot {
    id: string;
    netWorth: number;
    liquidCash: number;
    investments: number;
    businessEquity: number;
    totalAssets: number;
    totalLiabilities: number;
    targetNetWorth: number;
    progressPercentage: number;
    currency: Currency;
    breakdown: {
        accounts: {
            accountId: string;
            accountName: string;
            balance: number;
        }[];
        investments: {
            type: string;
            value: number;
        }[];
        business: {
            dailyRevenue: number;
            mrr: number;
            valuation: number;
        };
    };
    notes: string;
    createdAt: Date;
    user: User;
    userId: string;
}
