import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentMetadata, SemanticSearchOptions, SearchResult, DocumentProcessingResult } from './interfaces/rag.interface';
import { LoggerService } from '../../common/logger/logger.service';
export declare class RAGService implements OnModuleInit {
    private readonly configService;
    private readonly loggerService;
    private readonly logger;
    private chromaClient;
    private collection;
    private embeddingPipeline;
    private tokenizer;
    private isInitialized;
    private readonly config;
    constructor(configService: ConfigService, loggerService: LoggerService);
    onModuleInit(): Promise<void>;
    private initializeRAGSystem;
    private initializeCollection;
    processDocument(content: string, metadata: Partial<DocumentMetadata>): Promise<DocumentProcessingResult>;
    semanticSearch(options: SemanticSearchOptions): Promise<SearchResult[]>;
    private createDocumentChunks;
    private initializeEmbeddingPipeline;
    private generateEmbedding;
    private cleanContent;
    private calculateRelevance;
    getCollectionStats(): Promise<any>;
    deleteDocument(documentId: string): Promise<boolean>;
}
