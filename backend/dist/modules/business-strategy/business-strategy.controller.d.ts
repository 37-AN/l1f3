import { BusinessStrategyService } from './business-strategy.service';
import { BusinessStrategyDto } from './business-strategy.dto';
import { BusinessStrategy } from './business-strategy.interface';
export declare class BusinessStrategyController {
    private readonly strategyService;
    constructor(strategyService: BusinessStrategyService);
    getStrategy(): Promise<BusinessStrategy>;
    updateStrategy(data: BusinessStrategyDto): Promise<{
        success: boolean;
    }>;
}
