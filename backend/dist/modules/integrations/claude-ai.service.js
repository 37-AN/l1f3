"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeAIService = void 0;
const common_1 = require("@nestjs/common");
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const logger_service_1 = require("../../common/logger/logger.service");
let ClaudeAIService = class ClaudeAIService {
    constructor(logger) {
        this.logger = logger;
        this.conversationContexts = new Map();
        this.analysisCount = 0;
        this.insightGenerationCount = 0;
        this.initializeClaudeAI();
    }
    async initializeClaudeAI() {
        const startTime = Date.now();
        try {
            this.anthropic = new sdk_1.default({
                apiKey: process.env.ANTHROPIC_API_KEY,
            });
            const duration = Date.now() - startTime;
            this.logger.logIntegration({
                service: 'CLAUDE_AI',
                action: 'CONNECT',
                status: 'SUCCESS',
                duration,
                timestamp: new Date(),
                metadata: {
                    model: 'claude-3-sonnet-20240229',
                    initialized: true
                }
            });
            this.logger.log('Claude AI service initialized successfully', 'ClaudeAIService');
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error(`Failed to initialize Claude AI: ${error.message}`, error.stack, 'ClaudeAIService');
            this.logger.logIntegration({
                service: 'CLAUDE_AI',
                action: 'CONNECT',
                status: 'FAILED',
                duration,
                errorMessage: error.message,
                timestamp: new Date(),
                metadata: {
                    initialized: false
                }
            });
        }
    }
    async analyzeSpendingPatterns(userId, transactionData, timeframe = '30d') {
        const startTime = Date.now();
        this.analysisCount++;
        try {
            const prompt = this.buildSpendingAnalysisPrompt(transactionData, timeframe);
            const response = await this.anthropic.messages.create({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 1500,
                messages: [{
                        role: 'user',
                        content: prompt
                    }]
            });
            const insight = this.parseFinancialInsight(response.content[0].text, 'SPENDING_ANALYSIS');
            const duration = Date.now() - startTime;
            this.logger.logIntegration({
                service: 'CLAUDE_AI',
                action: 'SYNC',
                status: 'SUCCESS',
                duration,
                recordsProcessed: transactionData.length,
                timestamp: new Date(),
                metadata: {
                    operation: 'SPENDING_ANALYSIS',
                    userId,
                    timeframe,
                    transactionCount: transactionData.length,
                    analysisCount: this.analysisCount,
                    tokensUsed: response.usage?.input_tokens + response.usage?.output_tokens
                }
            });
            this.logger.log(`Spending analysis completed for user: ${userId}`, 'ClaudeAIService');
            return insight;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error(`Failed to analyze spending patterns: ${error.message}`, error.stack, 'ClaudeAIService');
            this.logger.logIntegration({
                service: 'CLAUDE_AI',
                action: 'SYNC',
                status: 'FAILED',
                duration,
                errorMessage: error.message,
                timestamp: new Date(),
                metadata: {
                    operation: 'SPENDING_ANALYSIS',
                    userId,
                    timeframe,
                    transactionCount: transactionData.length
                }
            });
            throw error;
        }
    }
    async generateInvestmentAdvice(userId, portfolioData, goalData) {
        const startTime = Date.now();
        try {
            const prompt = this.buildInvestmentAdvicePrompt(portfolioData, goalData);
            const response = await this.anthropic.messages.create({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 2000,
                messages: [{
                        role: 'user',
                        content: prompt
                    }]
            });
            const insight = this.parseFinancialInsight(response.content[0].text, 'INVESTMENT_ADVICE');
            const duration = Date.now() - startTime;
            this.logger.logIntegration({
                service: 'CLAUDE_AI',
                action: 'SYNC',
                status: 'SUCCESS',
                duration,
                recordsProcessed: 1,
                timestamp: new Date(),
                metadata: {
                    operation: 'INVESTMENT_ADVICE',
                    userId,
                    currentNetWorth: portfolioData.netWorth,
                    targetNetWorth: goalData.target,
                    tokensUsed: response.usage?.input_tokens + response.usage?.output_tokens
                }
            });
            this.logger.log(`Investment advice generated for user: ${userId}`, 'ClaudeAIService');
            return insight;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error(`Failed to generate investment advice: ${error.message}`, error.stack, 'ClaudeAIService');
            this.logger.logIntegration({
                service: 'CLAUDE_AI',
                action: 'SYNC',
                status: 'FAILED',
                duration,
                errorMessage: error.message,
                timestamp: new Date(),
                metadata: {
                    operation: 'INVESTMENT_ADVICE',
                    userId
                }
            });
            throw error;
        }
    }
    async optimize43V3RStrategy(userId, businessData) {
        const startTime = Date.now();
        try {
            const prompt = this.build43V3RStrategyPrompt(businessData);
            const response = await this.anthropic.messages.create({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 2500,
                messages: [{
                        role: 'user',
                        content: prompt
                    }]
            });
            const insight = this.parseFinancialInsight(response.content[0].text, 'BUSINESS_STRATEGY');
            const duration = Date.now() - startTime;
            this.logger.logIntegration({
                service: 'CLAUDE_AI',
                action: 'SYNC',
                status: 'SUCCESS',
                duration,
                recordsProcessed: 1,
                timestamp: new Date(),
                metadata: {
                    operation: '43V3R_STRATEGY_OPTIMIZATION',
                    userId,
                    currentRevenue: businessData.currentRevenue,
                    revenueTarget: businessData.dailyTarget,
                    mrrTarget: businessData.mrrTarget,
                    tokensUsed: response.usage?.input_tokens + response.usage?.output_tokens
                }
            });
            this.logger.log(`43V3R strategy optimization completed for user: ${userId}`, 'ClaudeAIService');
            return insight;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error(`Failed to optimize 43V3R strategy: ${error.message}`, error.stack, 'ClaudeAIService');
            this.logger.logIntegration({
                service: 'CLAUDE_AI',
                action: 'SYNC',
                status: 'FAILED',
                duration,
                errorMessage: error.message,
                timestamp: new Date(),
                metadata: {
                    operation: '43V3R_STRATEGY_OPTIMIZATION',
                    userId
                }
            });
            throw error;
        }
    }
    async assessFinancialRisk(userId, financialData) {
        const startTime = Date.now();
        try {
            const prompt = this.buildRiskAssessmentPrompt(financialData);
            const response = await this.anthropic.messages.create({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 1800,
                messages: [{
                        role: 'user',
                        content: prompt
                    }]
            });
            const insight = this.parseFinancialInsight(response.content[0].text, 'RISK_ASSESSMENT');
            const duration = Date.now() - startTime;
            this.logger.logIntegration({
                service: 'CLAUDE_AI',
                action: 'SYNC',
                status: 'SUCCESS',
                duration,
                recordsProcessed: 1,
                timestamp: new Date(),
                metadata: {
                    operation: 'RISK_ASSESSMENT',
                    userId,
                    netWorth: financialData.netWorth,
                    liquidityRatio: financialData.liquidityRatio,
                    tokensUsed: response.usage?.input_tokens + response.usage?.output_tokens
                }
            });
            this.logger.log(`Financial risk assessment completed for user: ${userId}`, 'ClaudeAIService');
            return insight;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error(`Failed to assess financial risk: ${error.message}`, error.stack, 'ClaudeAIService');
            this.logger.logIntegration({
                service: 'CLAUDE_AI',
                action: 'SYNC',
                status: 'FAILED',
                duration,
                errorMessage: error.message,
                timestamp: new Date(),
                metadata: {
                    operation: 'RISK_ASSESSMENT',
                    userId
                }
            });
            throw error;
        }
    }
    async generateDailyInsights(userId, dailyData) {
        const startTime = Date.now();
        this.insightGenerationCount++;
        try {
            const insights = await Promise.all([
                this.analyzeSpendingPatterns(userId, dailyData.transactions, '1d'),
                this.assessFinancialRisk(userId, dailyData.financial),
                this.optimize43V3RStrategy(userId, dailyData.business)
            ]);
            const duration = Date.now() - startTime;
            this.logger.logIntegration({
                service: 'CLAUDE_AI',
                action: 'SYNC',
                status: 'SUCCESS',
                duration,
                recordsProcessed: insights.length,
                timestamp: new Date(),
                metadata: {
                    operation: 'GENERATE_DAILY_INSIGHTS',
                    userId,
                    insightCount: insights.length,
                    insightGenerationCount: this.insightGenerationCount
                }
            });
            this.logger.log(`Daily insights generated for user: ${userId}`, 'ClaudeAIService');
            return insights;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error(`Failed to generate daily insights: ${error.message}`, error.stack, 'ClaudeAIService');
            this.logger.logIntegration({
                service: 'CLAUDE_AI',
                action: 'SYNC',
                status: 'FAILED',
                duration,
                errorMessage: error.message,
                timestamp: new Date(),
                metadata: {
                    operation: 'GENERATE_DAILY_INSIGHTS',
                    userId
                }
            });
            throw error;
        }
    }
    async generateFinancialAnalysis(request) {
        const startTime = Date.now();
        try {
            const response = await this.anthropic.messages.create({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 2000,
                messages: [{
                        role: 'user',
                        content: request.query
                    }]
            });
            const responseText = response.content[0].text;
            const duration = Date.now() - startTime;
            this.logger.logIntegration({
                service: 'CLAUDE_AI',
                action: 'SYNC',
                status: 'SUCCESS',
                duration,
                timestamp: new Date(),
                metadata: {
                    operation: 'FINANCIAL_ANALYSIS',
                    queryLength: request.query.length,
                    responseLength: responseText.length
                }
            });
            return { response: responseText };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.logger.logIntegration({
                service: 'CLAUDE_AI',
                action: 'SYNC',
                status: 'FAILED',
                duration,
                errorMessage: error.message,
                timestamp: new Date(),
                metadata: {
                    operation: 'FINANCIAL_ANALYSIS'
                }
            });
            throw error;
        }
    }
    async conversationalQuery(userId, query, context) {
        const startTime = Date.now();
        try {
            const conversationContext = this.getOrCreateConversationContext(userId);
            const prompt = this.buildConversationalPrompt(query, context, conversationContext);
            const response = await this.anthropic.messages.create({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 1000,
                messages: [{
                        role: 'user',
                        content: prompt
                    }]
            });
            const responseText = response.content[0].text;
            conversationContext.history.push({
                role: 'user',
                content: query,
                timestamp: new Date()
            });
            conversationContext.history.push({
                role: 'assistant',
                content: responseText,
                timestamp: new Date()
            });
            const duration = Date.now() - startTime;
            this.logger.logIntegration({
                service: 'CLAUDE_AI',
                action: 'SYNC',
                status: 'SUCCESS',
                duration,
                recordsProcessed: 1,
                timestamp: new Date(),
                metadata: {
                    operation: 'CONVERSATIONAL_QUERY',
                    userId,
                    queryLength: query.length,
                    responseLength: responseText.length,
                    conversationLength: conversationContext.history.length,
                    tokensUsed: response.usage?.input_tokens + response.usage?.output_tokens
                }
            });
            this.logger.log(`Conversational query processed for user: ${userId}`, 'ClaudeAIService');
            return responseText;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error(`Failed to process conversational query: ${error.message}`, error.stack, 'ClaudeAIService');
            this.logger.logIntegration({
                service: 'CLAUDE_AI',
                action: 'SYNC',
                status: 'FAILED',
                duration,
                errorMessage: error.message,
                timestamp: new Date(),
                metadata: {
                    operation: 'CONVERSATIONAL_QUERY',
                    userId,
                    queryLength: query.length
                }
            });
            throw error;
        }
    }
    buildSpendingAnalysisPrompt(transactionData, timeframe) {
        return `As a financial analyst, analyze the following transaction data for spending patterns and provide insights:

Time Period: ${timeframe}
Transaction Data: ${JSON.stringify(transactionData, null, 2)}

Please provide:
1. Key spending patterns and trends
2. Areas of overspending
3. Recommendations for optimization
4. Risk assessment
5. Specific action items

Focus on ZAR currency and South African financial context. Be concise and actionable.`;
    }
    buildInvestmentAdvicePrompt(portfolioData, goalData) {
        return `As an investment advisor, provide investment recommendations based on:

Current Portfolio: ${JSON.stringify(portfolioData, null, 2)}
Financial Goals: ${JSON.stringify(goalData, null, 2)}

Context:
- Currency: ZAR (South African Rand)
- Target: R1,800,000 net worth
- Current: R239,625 (13.3% progress)
- Location: Cape Town, South Africa

Please provide:
1. Portfolio optimization recommendations
2. Asset allocation suggestions
3. Risk-adjusted investment strategies
4. Timeline and milestones
5. Specific action items for reaching R1.8M goal

Consider South African investment vehicles and tax implications.`;
    }
    build43V3RStrategyPrompt(businessData) {
        return `As a business strategist, optimize the 43V3R AI startup strategy:

Business Data: ${JSON.stringify(businessData, null, 2)}

43V3R Context:
- Industry: AI + Web3 + Crypto
- Target Daily Revenue: R4,881
- Target MRR: R147,917
- Current Revenue: R0
- Location: Cape Town, South Africa

Please provide:
1. Revenue optimization strategies
2. Customer acquisition recommendations
3. Product development priorities
4. Market positioning advice
5. Specific action items to reach daily revenue target

Focus on practical, actionable strategies for a South African AI startup.`;
    }
    buildRiskAssessmentPrompt(financialData) {
        return `As a risk analyst, assess the financial risk profile:

Financial Data: ${JSON.stringify(financialData, null, 2)}

Please analyze:
1. Current risk exposure
2. Liquidity risks
3. Investment concentration risks
4. Business income risks
5. Emergency fund adequacy

Provide:
- Risk level assessment (LOW/MEDIUM/HIGH)
- Specific risk mitigation strategies
- Emergency fund recommendations
- Diversification suggestions
- Action items for risk reduction

Consider South African economic context and ZAR currency stability.`;
    }
    buildConversationalPrompt(query, context, conversationContext) {
        return `You are a personal financial advisor for Ethan Barnes, helping with his LIF3 dashboard.

Context:
- User: Ethan Barnes, IT Engineer, Cape Town
- Current Net Worth: R239,625
- Target: R1,800,000 (13.3% progress)
- Business: 43V3R AI startup
- Currency: ZAR

Previous conversation: ${JSON.stringify(conversationContext.history.slice(-4), null, 2)}
Current context: ${JSON.stringify(context, null, 2)}

User query: "${query}"

Provide a helpful, personalized response focusing on practical financial advice and business growth strategies. Be conversational but professional.`;
    }
    parseFinancialInsight(responseText, type) {
        return {
            type,
            title: `${type.replace('_', ' ')} Analysis`,
            summary: responseText.substring(0, 200) + '...',
            recommendations: this.extractRecommendations(responseText),
            riskLevel: this.extractRiskLevel(responseText),
            confidence: 0.85,
            actionItems: this.extractActionItems(responseText),
            timestamp: new Date()
        };
    }
    extractRecommendations(text) {
        const recommendations = text.match(/\d+\.\s+([^\n]+)/g) || [];
        return recommendations.slice(0, 5);
    }
    extractRiskLevel(text) {
        if (text.toLowerCase().includes('high risk'))
            return 'HIGH';
        if (text.toLowerCase().includes('medium risk'))
            return 'MEDIUM';
        return 'LOW';
    }
    extractActionItems(text) {
        const actionItems = text.match(/[-•]\s+([^\n]+)/g) || [];
        return actionItems.slice(0, 3);
    }
    getOrCreateConversationContext(userId) {
        if (!this.conversationContexts.has(userId)) {
            this.conversationContexts.set(userId, {
                userId,
                conversationId: `conv_${Date.now()}`,
                history: [],
                preferences: {},
                financialProfile: {}
            });
        }
        return this.conversationContexts.get(userId);
    }
    getAnalysisCount() {
        return this.analysisCount;
    }
    getInsightGenerationCount() {
        return this.insightGenerationCount;
    }
    getActiveConversations() {
        return this.conversationContexts.size;
    }
    clearConversationContext(userId) {
        this.conversationContexts.delete(userId);
        this.logger.logIntegration({
            service: 'CLAUDE_AI',
            action: 'SYNC',
            status: 'SUCCESS',
            timestamp: new Date(),
            metadata: {
                operation: 'CLEAR_CONVERSATION_CONTEXT',
                userId
            }
        });
    }
};
exports.ClaudeAIService = ClaudeAIService;
exports.ClaudeAIService = ClaudeAIService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [logger_service_1.LoggerService])
], ClaudeAIService);
//# sourceMappingURL=claude-ai.service.js.map