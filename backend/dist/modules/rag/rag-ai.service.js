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
var RAGAIService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RAGAIService = void 0;
const common_1 = require("@nestjs/common");
const tiktoken_1 = require("tiktoken");
const rag_service_1 = require("./rag.service");
const claude_ai_service_1 = require("../integrations/claude-ai.service");
const logger_service_1 = require("../../common/logger/logger.service");
let RAGAIService = RAGAIService_1 = class RAGAIService {
    constructor(ragService, claudeAIService, loggerService) {
        this.ragService = ragService;
        this.claudeAIService = claudeAIService;
        this.loggerService = loggerService;
        this.logger = new common_1.Logger(RAGAIService_1.name);
        this.tokenizer = (0, tiktoken_1.get_encoding)('cl100k_base');
    }
    async generateRAGResponse(queryDto) {
        const startTime = Date.now();
        try {
            const searchOptions = {
                query: queryDto.query,
                limit: queryDto.contextChunks || 5,
                threshold: 0.7,
                filters: {
                    category: queryDto.category,
                    userId: 'system'
                }
            };
            const searchResults = await this.ragService.semanticSearch(searchOptions);
            if (searchResults.length === 0) {
                return {
                    response: 'I couldn\'t find any relevant information in the knowledge base to answer your question. Please try rephrasing your query or upload relevant documents.',
                    sources: [],
                    contextUsed: '',
                    tokenCount: 0,
                    confidence: 0
                };
            }
            const { context, sources } = await this.buildContext(searchResults, queryDto.maxContextTokens || 4000);
            const enhancedPrompt = this.createFinancialRAGPrompt(queryDto.query, context, queryDto.domain);
            const claudeResponse = await this.claudeAIService.generateFinancialAnalysis({
                query: enhancedPrompt,
                context: {
                    userProfile: { risk_tolerance: 'moderate' },
                    currentPortfolio: {},
                    goals: []
                }
            });
            const confidence = this.calculateConfidence(searchResults, claudeResponse.response);
            const duration = Date.now() - startTime;
            this.loggerService.logIntegration({
                service: 'RAG_AI',
                action: 'GENERATE_RESPONSE',
                status: 'SUCCESS',
                duration,
                timestamp: new Date(),
                metadata: {
                    query: queryDto.query,
                    sourcesUsed: sources.length,
                    contextTokens: this.tokenizer.encode(context).length,
                    confidence
                }
            });
            return {
                response: claudeResponse.response,
                sources,
                contextUsed: context,
                tokenCount: this.tokenizer.encode(claudeResponse.response).length,
                confidence
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.loggerService.logIntegration({
                service: 'RAG_AI',
                action: 'GENERATE_RESPONSE',
                status: 'FAILED',
                duration,
                errorMessage: error.message,
                timestamp: new Date(),
                metadata: {
                    query: queryDto.query
                }
            });
            throw new Error(`RAG response generation failed: ${error.message}`);
        }
    }
    async analyzeDocument(analyzeDto) {
        const startTime = Date.now();
        try {
            let searchQuery = '';
            let analysisPrompt = '';
            switch (analyzeDto.analysisType) {
                case 'summary':
                    searchQuery = `document summary overview key points`;
                    analysisPrompt = this.createDocumentSummaryPrompt();
                    break;
                case 'key_insights':
                    searchQuery = `insights findings conclusions recommendations`;
                    analysisPrompt = this.createKeyInsightsPrompt(analyzeDto.focusAreas);
                    break;
                case 'financial_metrics':
                    searchQuery = `financial metrics numbers ratios performance indicators`;
                    analysisPrompt = this.createFinancialMetricsPrompt();
                    break;
                case 'risk_assessment':
                    searchQuery = `risk assessment analysis threats opportunities`;
                    analysisPrompt = this.createRiskAssessmentPrompt();
                    break;
                case 'recommendations':
                    searchQuery = `recommendations actions next steps suggestions`;
                    analysisPrompt = this.createRecommendationsPrompt();
                    break;
            }
            const searchOptions = {
                query: searchQuery,
                limit: 10,
                threshold: 0.6,
                filters: analyzeDto.documentId ? { source: analyzeDto.documentId } : undefined
            };
            const searchResults = await this.ragService.semanticSearch(searchOptions);
            if (searchResults.length === 0) {
                throw new Error('No relevant content found for analysis');
            }
            const { context, sources } = await this.buildContext(searchResults, 6000);
            const finalPrompt = `${analysisPrompt}\n\n<DOCUMENT_CONTENT>\n${context}\n</DOCUMENT_CONTENT>`;
            const claudeResponse = await this.claudeAIService.generateFinancialAnalysis({
                query: finalPrompt,
                context: {
                    userProfile: { risk_tolerance: 'moderate' },
                    currentPortfolio: {},
                    goals: []
                }
            });
            const confidence = this.calculateConfidence(searchResults, claudeResponse.response);
            const duration = Date.now() - startTime;
            this.loggerService.logIntegration({
                service: 'RAG_AI',
                action: 'ANALYZE_DOCUMENT',
                status: 'SUCCESS',
                duration,
                timestamp: new Date(),
                metadata: {
                    analysisType: analyzeDto.analysisType,
                    sourcesUsed: sources.length,
                    confidence
                }
            });
            return {
                response: claudeResponse.response,
                sources,
                contextUsed: context,
                tokenCount: this.tokenizer.encode(claudeResponse.response).length,
                confidence
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.loggerService.logIntegration({
                service: 'RAG_AI',
                action: 'ANALYZE_DOCUMENT',
                status: 'FAILED',
                duration,
                errorMessage: error.message,
                timestamp: new Date(),
                metadata: {
                    analysisType: analyzeDto.analysisType
                }
            });
            throw error;
        }
    }
    async buildContext(searchResults, maxTokens) {
        let context = '';
        const sources = [];
        let tokenCount = 0;
        for (const result of searchResults) {
            const chunkText = `\n\n--- Source: ${result.chunk.metadata.fileName} ---\n${result.chunk.content}`;
            const chunkTokens = this.tokenizer.encode(chunkText).length;
            if (tokenCount + chunkTokens > maxTokens) {
                break;
            }
            context += chunkText;
            sources.push(result.chunk);
            tokenCount += chunkTokens;
        }
        return { context, sources };
    }
    createFinancialRAGPrompt(query, context, domain) {
        const domainContext = domain ? `\nFocus specifically on: ${domain}` : '';
        return `You are a highly skilled financial advisor with access to relevant documents and research. 
Provide a comprehensive, accurate response based on the context provided below.

<QUERY>
${query}
</QUERY>

<GUIDELINES>
- Base your response primarily on the provided context
- If the context doesn't contain enough information, clearly state this
- Provide specific references to the source documents when making claims
- Focus on actionable insights and practical recommendations
- Consider South African financial context and regulations where relevant
- Use clear, professional language suitable for financial decision-making${domainContext}
</GUIDELINES>

<CONTEXT>
${context}
</CONTEXT>

Please provide a detailed response that addresses the query using the available context:`;
    }
    createDocumentSummaryPrompt() {
        return `Analyze the provided document content and create a comprehensive summary that includes:

1. **Document Overview**: What type of document this is and its primary purpose
2. **Key Points**: The most important information and findings
3. **Main Topics**: Core subjects covered in the document
4. **Conclusions**: Any conclusions or outcomes presented
5. **Actionable Items**: Specific recommendations or next steps mentioned

Format your response clearly with appropriate headings and bullet points.`;
    }
    createKeyInsightsPrompt(focusAreas) {
        const focusSection = focusAreas?.length
            ? `\nPay special attention to these focus areas: ${focusAreas.join(', ')}`
            : '';
        return `Extract and analyze the key insights from the provided content:

1. **Strategic Insights**: High-level strategic observations and implications
2. **Financial Insights**: Key financial findings, trends, or metrics
3. **Market Insights**: Market conditions, opportunities, or trends
4. **Operational Insights**: Operational efficiency or process observations
5. **Risk Insights**: Potential risks or concerns identified${focusSection}

For each insight, provide:
- The insight itself
- Supporting evidence from the document
- Potential implications or impact
- Recommended actions if applicable`;
    }
    createFinancialMetricsPrompt() {
        return `Identify and analyze all financial metrics and key performance indicators from the content:

1. **Revenue Metrics**: Revenue figures, growth rates, trends
2. **Profitability Metrics**: Profit margins, EBITDA, net income
3. **Financial Ratios**: Liquidity, leverage, efficiency ratios
4. **Performance Indicators**: ROI, ROE, other performance measures
5. **Market Metrics**: Market share, valuation metrics, multiples

For each metric:
- Present the specific values or percentages
- Provide context about what these numbers mean
- Compare to industry standards if mentioned
- Highlight any concerning or exceptional figures
- Suggest areas for improvement or further investigation`;
    }
    createRiskAssessmentPrompt() {
        return `Conduct a comprehensive risk assessment based on the provided content:

1. **Financial Risks**: Credit risk, market risk, liquidity risk
2. **Operational Risks**: Process risks, technology risks, human capital risks
3. **Strategic Risks**: Competitive risks, regulatory risks, reputational risks
4. **Market Risks**: Economic risks, industry-specific risks

For each risk category:
- Identify specific risks mentioned or implied
- Assess the potential impact (High/Medium/Low)
- Evaluate the likelihood of occurrence
- Suggest mitigation strategies
- Prioritize risks by overall threat level`;
    }
    createRecommendationsPrompt() {
        return `Based on the content provided, generate actionable recommendations:

1. **Immediate Actions**: What should be done in the next 30 days
2. **Short-term Strategy**: Actions for the next 3-6 months
3. **Long-term Planning**: Strategic initiatives for 6+ months
4. **Risk Mitigation**: Specific steps to address identified risks
5. **Performance Improvement**: Ways to enhance efficiency or profitability

For each recommendation:
- Clearly state the action required
- Explain the rationale based on the document content
- Identify who should be responsible
- Suggest timelines for implementation
- Outline expected outcomes or benefits`;
    }
    calculateConfidence(searchResults, response) {
        if (searchResults.length === 0)
            return 0;
        const avgSimilarity = searchResults.reduce((sum, result) => sum + result.similarity, 0) / searchResults.length;
        const sourcesFactor = Math.min(searchResults.length / 5, 1);
        const responseFactor = Math.min(response.length / 1000, 1) * 0.1;
        return Math.min((avgSimilarity * 0.7) + (sourcesFactor * 0.2) + responseFactor, 1);
    }
};
exports.RAGAIService = RAGAIService;
exports.RAGAIService = RAGAIService = RAGAIService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rag_service_1.RAGService,
        claude_ai_service_1.ClaudeAIService,
        logger_service_1.LoggerService])
], RAGAIService);
//# sourceMappingURL=rag-ai.service.js.map