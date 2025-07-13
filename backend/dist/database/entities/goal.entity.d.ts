import { User } from './user.entity';
import { Currency } from './enums';
export declare enum GoalType {
    NET_WORTH = "NET_WORTH",
    SAVINGS = "SAVINGS",
    INVESTMENT = "INVESTMENT",
    BUSINESS_REVENUE = "BUSINESS_REVENUE",
    DEBT_REDUCTION = "DEBT_REDUCTION",
    EMERGENCY_FUND = "EMERGENCY_FUND",
    CUSTOM = "CUSTOM"
}
export declare enum GoalStatus {
    ACTIVE = "ACTIVE",
    COMPLETED = "COMPLETED",
    PAUSED = "PAUSED",
    CANCELLED = "CANCELLED"
}
export declare enum GoalPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export declare class Goal {
    id: string;
    name: string;
    description: string;
    type: GoalType;
    targetAmount: number;
    currentAmount: number;
    currency: Currency;
    deadline: Date;
    status: GoalStatus;
    priority: GoalPriority;
    monthlyTarget: number;
    weeklyTarget: number;
    dailyTarget: number;
    isRecurring: boolean;
    recurringPattern: string;
    milestones: {
        amount: number;
        date: Date;
        achieved: boolean;
        note?: string;
    }[];
    notes: string;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    userId: string;
    get progressPercentage(): number;
    get remainingAmount(): number;
    get daysRemaining(): number;
}
