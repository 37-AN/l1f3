import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdvancedLoggerService } from '../../../common/logger/advanced-logger.service';
import { Transaction, TransactionCategory } from '../interfaces/banking.interface';
export declare class TransactionCategorizationService implements OnModuleInit {
    private readonly configService;
    private readonly advancedLogger;
    private readonly logger;
    private categoryRules;
    private southAfricanMerchants;
    private learningData;
    constructor(configService: ConfigService, advancedLogger: AdvancedLoggerService);
    onModuleInit(): Promise<void>;
    initializeModels(): Promise<void>;
    categorizeTransaction(transaction: Transaction): Promise<TransactionCategory>;
    private loadCategorizationRules;
    private loadSouthAfricanMerchants;
    private initializeMLModels;
    private categorizeBySouthAfricanMerchant;
    private categorizeByRules;
    private categorizeByKeywords;
    private categorizeByAmount;
    private updateLearningData;
    getCategorySuggestions(transaction: Transaction): Promise<TransactionCategory[]>;
    learnFromCorrection(transaction: Transaction, correctCategory: TransactionCategory): Promise<void>;
    getCategorizationStats(): {
        totalRules: number;
        totalMerchants: number;
        learningDataSize: number;
        topCategories: {
            category: TransactionCategory;
            count: number;
        }[];
    };
    exportLearningData(): Array<{
        description: string;
        category: TransactionCategory;
        frequency: number;
    }>;
}
