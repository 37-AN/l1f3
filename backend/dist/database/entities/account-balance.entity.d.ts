import { User } from './user.entity';
import { Currency, BalanceSource } from './enums';
import { Account } from './account.entity';
export declare class AccountBalance {
    id: string;
    balance: number;
    availableBalance: number;
    currency: Currency;
    source: BalanceSource;
    sourceReference: string;
    metadata: {
        syncId?: string;
        institutionTransactionId?: string;
        confidence?: number;
    };
    createdAt: Date;
    user: User;
    userId: string;
    account: Account;
    accountId: string;
}
