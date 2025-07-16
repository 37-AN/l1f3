import { AdvancedLoggerService } from '../../../common/logger/advanced-logger.service';
import { BankAccount, Transaction, BankingInsight } from '../interfaces/banking.interface';
export declare class BankingInsightsService {
    private readonly advancedLogger;
    private readonly logger;
    constructor(advancedLogger: AdvancedLoggerService);
    generateInsights(userId: string, accounts: BankAccount[], transactions: Transaction[]): Promise<BankingInsight[]>;
    private generateSpendingPatternInsights;
    private generateSavingsOpportunityInsights;
    private generateIncomeInsights;
    private generateGoalProgressInsights;
    private calculateCategorySpending;
    private calculateMonthlyIncome;
    private identifySubscriptions;
}
