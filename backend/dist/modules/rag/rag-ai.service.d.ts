import { RAGService } from './rag.service';
import { ClaudeAIService } from '../integrations/claude-ai.service';
import { LoggerService } from '../../common/logger/logger.service';
import { RAGResponse } from './interfaces/rag.interface';
import { RAGQueryDto, AnalyzeDocumentDto } from './dto/rag.dto';
export declare class RAGAIService {
    private readonly ragService;
    private readonly claudeAIService;
    private readonly loggerService;
    private readonly logger;
    private tokenizer;
    constructor(ragService: RAGService, claudeAIService: ClaudeAIService, loggerService: LoggerService);
    generateRAGResponse(queryDto: RAGQueryDto): Promise<RAGResponse>;
    analyzeDocument(analyzeDto: AnalyzeDocumentDto): Promise<RAGResponse>;
    private buildContext;
    private createFinancialRAGPrompt;
    private createDocumentSummaryPrompt;
    private createKeyInsightsPrompt;
    private createFinancialMetricsPrompt;
    private createRiskAssessmentPrompt;
    private createRecommendationsPrompt;
    private calculateConfidence;
}
