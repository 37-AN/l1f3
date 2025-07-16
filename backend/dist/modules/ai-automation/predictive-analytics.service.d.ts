import { ConfigService } from '@nestjs/config';
import { AdvancedLoggerService } from '../../common/logger/advanced-logger.service';
import { MCPFrameworkService } from '../mcp-framework/mcp-framework.service';
import { FinancialGoal, PredictionResult, ProgressPoint, ExpenseAnalysis } from './interfaces/ai-automation.interface';
export interface PredictionModel {
    id: string;
    name: string;
    type: 'linear' | 'exponential' | 'polynomial' | 'lstm' | 'ensemble';
    accuracy: number;
    trainingData: number;
    lastTrained: Date;
}
export interface MarketData {
    date: Date;
    zarUsdRate: number;
    inflationRate: number;
    interestRate: number;
    marketVolatility: number;
}
export declare class PredictiveAnalyticsService {
    private readonly configService;
    private readonly advancedLogger;
    private readonly mcpFramework;
    private readonly logger;
    private models;
    private marketData;
    private predictions;
    constructor(configService: ConfigService, advancedLogger: AdvancedLoggerService, mcpFramework: MCPFrameworkService);
    private initializePredictionModels;
    generateGoalPrediction(goal: FinancialGoal, historicalData: ProgressPoint[]): Promise<PredictionResult>;
    private preprocessData;
    private generateLinearPrediction;
    private generateExponentialPrediction;
    private generateAIPrediction;
    private calculateMarketAdjustment;
    private calculateSeasonalAdjustment;
    private calculateVelocity;
    private combineModelPredictions;
    private generateScenarioAnalysis;
    private generatePredictionRecommendations;
    private assessRiskFactors;
    private getMarketFactors;
    analyzeExpensePatterns(expenses: any[]): Promise<ExpenseAnalysis>;
    private categorizeExpenses;
    private analyzeExpenseTrends;
    private detectExpenseAnomalies;
    private generateExpenseOptimizations;
    updatePredictions(): Promise<void>;
    private updateMarketData;
    private retrainModels;
    getPrediction(goalId: string): PredictionResult | undefined;
    getModels(): PredictionModel[];
    getMarketData(): MarketData[];
    generateCustomPrediction(goalId: string, customScenario: {
        savingsIncrease?: number;
        timeExtension?: number;
    }): Promise<PredictionResult>;
}
