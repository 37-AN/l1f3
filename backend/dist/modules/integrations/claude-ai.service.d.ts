import { LoggerService } from '../../common/logger/logger.service';
export interface ClaudeAIConfig {
    apiKey: string;
    model: string;
    maxTokens: number;
}
export interface FinancialAnalysisRequest {
    type: 'SPENDING_ANALYSIS' | 'INVESTMENT_ADVICE' | 'GOAL_OPTIMIZATION' | 'BUSINESS_STRATEGY' | 'RISK_ASSESSMENT' | 'MARKET_ANALYSIS';
    data: any;
    userId: string;
    context?: string;
}
export interface FinancialInsight {
    type: string;
    title: string;
    summary: string;
    recommendations: string[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    confidence: number;
    actionItems: string[];
    timestamp: Date;
}
export interface ConversationContext {
    userId: string;
    conversationId: string;
    history: any[];
    preferences: any;
    financialProfile: any;
}
export declare class ClaudeAIService {
    private readonly logger;
    private anthropic;
    private conversationContexts;
    private analysisCount;
    private insightGenerationCount;
    constructor(logger: LoggerService);
    private initializeClaudeAI;
    analyzeSpendingPatterns(userId: string, transactionData: any[], timeframe?: string): Promise<FinancialInsight>;
    generateInvestmentAdvice(userId: string, portfolioData: any, goalData: any): Promise<FinancialInsight>;
    optimize43V3RStrategy(userId: string, businessData: any): Promise<FinancialInsight>;
    assessFinancialRisk(userId: string, financialData: any): Promise<FinancialInsight>;
    generateDailyInsights(userId: string, dailyData: any): Promise<FinancialInsight[]>;
    conversationalQuery(userId: string, query: string, context?: any): Promise<string>;
    private buildSpendingAnalysisPrompt;
    private buildInvestmentAdvicePrompt;
    private build43V3RStrategyPrompt;
    private buildRiskAssessmentPrompt;
    private buildConversationalPrompt;
    private parseFinancialInsight;
    private extractRecommendations;
    private extractRiskLevel;
    private extractActionItems;
    private getOrCreateConversationContext;
    getAnalysisCount(): number;
    getInsightGenerationCount(): number;
    getActiveConversations(): number;
    clearConversationContext(userId: string): void;
}
