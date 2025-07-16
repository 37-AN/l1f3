import { ConfigService } from '@nestjs/config';
import { AdvancedLoggerService } from '../../../common/logger/advanced-logger.service';
import { BankAccount, Transaction, BankConnection } from '../interfaces/banking.interface';
export declare class OkraService {
    private readonly configService;
    private readonly advancedLogger;
    private readonly logger;
    private config;
    private customerTokens;
    private supportedBanks;
    constructor(configService: ConfigService, advancedLogger: AdvancedLoggerService);
    private loadConfiguration;
    initialize(): Promise<void>;
    private validateCredentials;
    connectBank(userId: string, bankId: string): Promise<BankConnection>;
    private createSandboxConnection;
    private generateWidgetUrl;
    handleWidgetCallback(customerId: string, token: string, bankId: string): Promise<BankConnection>;
    getAccounts(connection: BankConnection): Promise<BankAccount[]>;
    getTransactions(connection: BankConnection): Promise<{
        [accountId: string]: Transaction[];
    }>;
    private makeOkraRequest;
    private getSandboxAccounts;
    private getSandboxTransactions;
    private mapOkraAccountType;
    private mapOkraCategory;
    private mapOkraChannel;
    private getBankBranchCode;
    private getBankFees;
    private getOkraTransactionDescription;
    private getRandomSACity;
    getSupportedBanks(): {
        id: string;
        name: string;
        code: string;
    }[];
    refreshToken(connectionId: string): Promise<void>;
}
