import { RAGService } from './rag.service';
import { RAGAIService } from './rag-ai.service';
import { DocumentService } from './document.service';
import { UploadDocumentDto, SemanticSearchDto, RAGQueryDto, AnalyzeDocumentDto } from './dto/rag.dto';
import { RAGResponse, SearchResult, DocumentProcessingResult } from './interfaces/rag.interface';
export declare class RAGController {
    private readonly ragService;
    private readonly ragAIService;
    private readonly documentService;
    constructor(ragService: RAGService, ragAIService: RAGAIService, documentService: DocumentService);
    uploadDocument(file: Express.Multer.File, uploadDto: UploadDocumentDto): Promise<DocumentProcessingResult>;
    semanticSearch(searchDto: SemanticSearchDto): Promise<SearchResult[]>;
    ragQuery(queryDto: RAGQueryDto): Promise<RAGResponse>;
    analyzeDocument(analyzeDto: AnalyzeDocumentDto): Promise<RAGResponse>;
    getStats(): Promise<any>;
    deleteDocument(documentId: string): Promise<{
        success: boolean;
    }>;
    analyzePortfolio(queryDto: RAGQueryDto): Promise<RAGResponse>;
    performRiskAssessment(queryDto: RAGQueryDto): Promise<RAGResponse>;
    generateMarketInsights(queryDto: RAGQueryDto): Promise<RAGResponse>;
    checkCompliance(queryDto: RAGQueryDto): Promise<RAGResponse>;
}
