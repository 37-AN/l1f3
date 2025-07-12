import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BusinessStrategy } from './business-strategy.interface';
export declare class BusinessStrategyService implements OnModuleInit {
    private readonly configService;
    private readonly logger;
    private chromaClient;
    private collection;
    private isInitialized;
    private readonly collectionName;
    private readonly persistPath;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    private initializeCollection;
    getStrategy(): Promise<BusinessStrategy | null>;
    updateStrategy(data: BusinessStrategy): Promise<boolean>;
    syncToMCP(data: BusinessStrategy): Promise<void>;
}
