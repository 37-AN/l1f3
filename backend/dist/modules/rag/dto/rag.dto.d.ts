import { DocumentCategory } from '../interfaces/rag.interface';
export declare class UploadDocumentDto {
    category?: DocumentCategory;
    tags?: string[];
    metadata?: Record<string, any>;
}
export declare class SemanticSearchDto {
    query: string;
    limit?: number;
    threshold?: number;
    fileType?: string;
    category?: DocumentCategory;
    tags?: string[];
    includeMetadata?: boolean;
}
export declare class RAGQueryDto {
    query: string;
    maxContextTokens?: number;
    contextChunks?: number;
    includeHistory?: boolean;
    category?: DocumentCategory;
    domain?: string;
}
export declare class AnalyzeDocumentDto {
    analysisType: 'summary' | 'key_insights' | 'financial_metrics' | 'risk_assessment' | 'recommendations';
    documentId?: string;
    focusAreas?: string[];
    comparative?: boolean;
}
