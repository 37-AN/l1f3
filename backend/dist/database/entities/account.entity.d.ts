import { User } from './user.entity';
import { Currency, AccountType, AccountProvider } from './enums';
import { Transaction } from './transaction.entity';
import { AccountBalance } from './account-balance.entity';
export declare class Account {
    id: string;
    name: string;
    type: AccountType;
    provider: AccountProvider;
    accountNumber: string;
    currency: Currency;
    currentBalance: number;
    availableBalance: number;
    isActive: boolean;
    isConnected: boolean;
    lastSyncAt: Date;
    institutionId: string;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    userId: string;
    transactions: Transaction[];
    balanceHistory: AccountBalance[];
}
