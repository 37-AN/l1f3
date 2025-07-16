import { ConfigService } from '@nestjs/config';
import { AdvancedLoggerService } from '../../../common/logger/advanced-logger.service';
import { BankAccount, Transaction, BankConnection } from '../interfaces/banking.interface';
export declare class NedBankService {
    private readonly configService;
    private readonly advancedLogger;
    private readonly logger;
    private config;
    private accessTokens;
    constructor(configService: ConfigService, advancedLogger: AdvancedLoggerService);
    private loadConfiguration;
    initialize(): Promise<void>;
    connect(userId: string): Promise<BankConnection>;
    private createSandboxConnection;
    private generateAuthUrl;
    exchangeCodeForToken(code: string, state: string): Promise<BankConnection>;
    getAccounts(connection: BankConnection): Promise<BankAccount[]>;
    getTransactions(connection: BankConnection): Promise<{
        [accountId: string]: Transaction[];
    }>;
    private getSandboxAccounts;
    private getSandboxTransactions;
    private getValidAccessToken;
    private mapAccountType;
    private getNedBankFees;
    private mapTransactionCategory;
    private mapPaymentMethod;
    private getTransactionDescription;
}
