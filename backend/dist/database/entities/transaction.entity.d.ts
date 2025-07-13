import { User } from './user.entity';
import { Account } from './account.entity';
import { Currency } from './enums';
export declare enum TransactionType {
    INCOME = "INCOME",
    EXPENSE = "EXPENSE",
    TRANSFER = "TRANSFER",
    INVESTMENT = "INVESTMENT",
    BUSINESS_REVENUE = "BUSINESS_REVENUE",
    BUSINESS_EXPENSE = "BUSINESS_EXPENSE"
}
export declare enum TransactionCategory {
    SALARY = "SALARY",
    FREELANCE = "FREELANCE",
    BUSINESS_INCOME = "BUSINESS_INCOME",
    INVESTMENT_INCOME = "INVESTMENT_INCOME",
    GROCERIES = "GROCERIES",
    UTILITIES = "UTILITIES",
    RENT = "RENT",
    TRANSPORT = "TRANSPORT",
    ENTERTAINMENT = "ENTERTAINMENT",
    HEALTHCARE = "HEALTHCARE",
    EDUCATION = "EDUCATION",
    SHOPPING = "SHOPPING",
    BUSINESS_EXPENSE = "BUSINESS_EXPENSE",
    INVESTMENT = "INVESTMENT",
    TRANSFER = "TRANSFER",
    OTHER = "OTHER"
}
export declare enum TransactionStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED"
}
export declare class Transaction {
    id: string;
    amount: number;
    currency: Currency;
    type: TransactionType;
    category: TransactionCategory;
    description: string;
    date: Date;
    status: TransactionStatus;
    referenceNumber: string;
    bankReference: string;
    balanceAfter: number;
    metadata: {
        location?: string;
        merchant?: string;
        paymentMethod?: string;
        tags?: string[];
        receiptUrl?: string;
    };
    isRecurring: boolean;
    recurringPattern: string;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    userId: string;
    account: Account;
    accountId: string;
}
