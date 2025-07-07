"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RAGService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RAGService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const transformers_1 = require("@xenova/transformers");
const tiktoken_1 = require("tiktoken");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const logger_service_1 = require("../../common/logger/logger.service");
let RAGService = RAGService_1 = class RAGService {
    constructor(configService, loggerService) {
        this.configService = configService;
        this.loggerService = loggerService;
        this.logger = new common_1.Logger(RAGService_1.name);
        this.isInitialized = false;
        this.config = {
            chunkSize: 500,
            chunkOverlap: 50,
            maxTokens: 4000,
            embeddingModel: 'Xenova/all-MiniLM-L6-v2',
            collectionName: 'lif3_financial_docs',
            persistPath: './storage/chromadb'
        };
    }
    async onModuleInit() {
        try {
            await this.initializeRAGSystem();
            this.logger.log('RAG Service initialized successfully');
        }
        catch (error) {
            this.logger.error(`Failed to initialize RAG Service: ${error.message}`, error.stack);
            this.logger.warn('RAG Service will continue without ChromaDB - vector storage disabled');
            this.isInitialized = false;
        }
    }
    async initializeRAGSystem() {
        try {
            const chromadb = await Promise.resolve().then(() => __importStar(require('chromadb')));
            this.chromaClient = new chromadb.ChromaClient();
            this.tokenizer = (0, tiktoken_1.get_encoding)('cl100k_base');
            await this.initializeCollection();
            await fs.mkdir(path.dirname(this.config.persistPath), { recursive: true });
            this.isInitialized = true;
            this.loggerService.logIntegration({
                service: 'RAG_CHROMADB',
                action: 'INITIALIZE',
                status: 'SUCCESS',
                timestamp: new Date(),
                metadata: {
                    collectionName: this.config.collectionName,
                    embeddingModel: this.config.embeddingModel,
                    persistPath: this.config.persistPath
                }
            });
        }
        catch (error) {
            this.loggerService.logIntegration({
                service: 'RAG_CHROMADB',
                action: 'INITIALIZE',
                status: 'FAILED',
                errorMessage: error.message,
                timestamp: new Date()
            });
            throw error;
        }
    }
    async initializeCollection() {
        try {
            this.collection = await this.chromaClient.getCollection({
                name: this.config.collectionName
            });
        }
        catch (error) {
            this.collection = await this.chromaClient.createCollection({
                name: this.config.collectionName,
                metadata: {
                    'hnsw:space': 'cosine',
                    description: 'LIF3 Financial Dashboard document embeddings'
                }
            });
            this.logger.log(`Created new ChromaDB collection: ${this.config.collectionName}`);
        }
    }
    async processDocument(content, metadata) {
        if (!this.isInitialized) {
            return {
                success: false,
                chunksCreated: 0,
                documentId: '',
                error: 'RAG Service not initialized - ChromaDB unavailable',
                metadata: {}
            };
        }
        const startTime = Date.now();
        try {
            const documentId = crypto.randomUUID();
            const cleanContent = this.cleanContent(content);
            const chunks = await this.createDocumentChunks(cleanContent, {
                ...metadata,
                uploadedAt: new Date(),
                userId: metadata.userId || 'system'
            });
            const embeddings = [];
            const chunkContents = [];
            const chunkMetadata = [];
            const chunkIds = [];
            for (const chunk of chunks) {
                const embedding = await this.generateEmbedding(chunk.content);
                embeddings.push(embedding);
                chunkContents.push(chunk.content);
                chunkMetadata.push({
                    ...chunk.metadata,
                    documentId,
                    chunkId: chunk.id
                });
                chunkIds.push(chunk.id);
            }
            await this.collection.add({
                ids: chunkIds,
                embeddings: embeddings,
                documents: chunkContents,
                metadatas: chunkMetadata
            });
            const duration = Date.now() - startTime;
            this.loggerService.logIntegration({
                service: 'RAG_CHROMADB',
                action: 'PROCESS_DOCUMENT',
                status: 'SUCCESS',
                duration,
                recordsProcessed: chunks.length,
                timestamp: new Date(),
                metadata: {
                    documentId,
                    chunksCreated: chunks.length,
                    fileName: metadata.fileName,
                    fileType: metadata.fileType,
                    category: metadata.category
                }
            });
            return {
                success: true,
                chunksCreated: chunks.length,
                documentId,
                metadata: chunks[0].metadata
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.loggerService.logIntegration({
                service: 'RAG_CHROMADB',
                action: 'PROCESS_DOCUMENT',
                status: 'FAILED',
                duration,
                errorMessage: error.message,
                timestamp: new Date(),
                metadata: {
                    fileName: metadata.fileName,
                    fileType: metadata.fileType
                }
            });
            return {
                success: false,
                chunksCreated: 0,
                documentId: '',
                error: error.message,
                metadata: {}
            };
        }
    }
    async semanticSearch(options) {
        if (!this.isInitialized) {
            this.logger.warn('Semantic search requested but RAG Service not initialized');
            return [];
        }
        const startTime = Date.now();
        try {
            const queryEmbedding = await this.generateEmbedding(options.query);
            const whereClause = {};
            if (options.filters) {
                if (options.filters.fileType)
                    whereClause.fileType = options.filters.fileType;
                if (options.filters.category)
                    whereClause.category = options.filters.category;
                if (options.filters.userId)
                    whereClause.userId = options.filters.userId;
                if (options.filters.tags?.length)
                    whereClause.tags = { $in: options.filters.tags };
            }
            const results = await this.collection.query({
                queryEmbeddings: [queryEmbedding],
                nResults: options.limit || 10,
                where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
                include: ['documents', 'metadatas', 'distances']
            });
            const searchResults = [];
            if (results.documents && results.documents[0]) {
                for (let i = 0; i < results.documents[0].length; i++) {
                    const distance = results.distances?.[0]?.[i] || 1;
                    const similarity = 1 - distance;
                    if (similarity >= (options.threshold || 0.7)) {
                        const chunk = {
                            id: results.ids?.[0]?.[i] || '',
                            content: results.documents[0][i] || '',
                            metadata: results.metadatas?.[0]?.[i] || {}
                        };
                        searchResults.push({
                            chunk,
                            similarity,
                            relevance: this.calculateRelevance(options.query, chunk.content, similarity)
                        });
                    }
                }
            }
            searchResults.sort((a, b) => b.relevance - a.relevance);
            const duration = Date.now() - startTime;
            this.loggerService.logIntegration({
                service: 'RAG_CHROMADB',
                action: 'SEMANTIC_SEARCH',
                status: 'SUCCESS',
                duration,
                recordsProcessed: searchResults.length,
                timestamp: new Date(),
                metadata: {
                    query: options.query,
                    resultsFound: searchResults.length,
                    threshold: options.threshold || 0.7,
                    filters: options.filters
                }
            });
            return searchResults;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.loggerService.logIntegration({
                service: 'RAG_CHROMADB',
                action: 'SEMANTIC_SEARCH',
                status: 'FAILED',
                duration,
                errorMessage: error.message,
                timestamp: new Date(),
                metadata: {
                    query: options.query
                }
            });
            throw error;
        }
    }
    async createDocumentChunks(content, metadata) {
        const chunks = [];
        const tokens = this.tokenizer.encode(content);
        const chunkSizeInTokens = this.config.chunkSize;
        const overlapInTokens = this.config.chunkOverlap;
        let startIdx = 0;
        let chunkIndex = 0;
        while (startIdx < tokens.length) {
            const endIdx = Math.min(startIdx + chunkSizeInTokens, tokens.length);
            const chunkTokens = tokens.slice(startIdx, endIdx);
            const chunkText = this.tokenizer.decode(chunkTokens);
            const cleanChunkText = chunkText.trim();
            if (cleanChunkText.length < 50) {
                startIdx = endIdx;
                continue;
            }
            const chunk = {
                id: crypto.randomUUID(),
                content: cleanChunkText,
                metadata: {
                    ...metadata,
                    chunkIndex,
                    totalChunks: 0,
                    tokenCount: chunkTokens.length
                }
            };
            chunks.push(chunk);
            chunkIndex++;
            startIdx = endIdx - overlapInTokens;
        }
        chunks.forEach(chunk => {
            chunk.metadata.totalChunks = chunks.length;
        });
        return chunks;
    }
    async initializeEmbeddingPipeline() {
        if (!this.embeddingPipeline) {
            try {
                this.embeddingPipeline = await (0, transformers_1.pipeline)('feature-extraction', this.config.embeddingModel);
                this.logger.log('Embedding pipeline initialized successfully');
            }
            catch (error) {
                this.logger.error(`Failed to initialize embedding pipeline: ${error.message}`);
                throw error;
            }
        }
    }
    async generateEmbedding(text) {
        try {
            await this.initializeEmbeddingPipeline();
            const result = await this.embeddingPipeline(text, {
                pooling: 'mean',
                normalize: true
            });
            return Array.from(result.data);
        }
        catch (error) {
            this.logger.error(`Failed to generate embedding: ${error.message}`);
            throw new Error(`Embedding generation failed: ${error.message}`);
        }
    }
    cleanContent(content) {
        return content
            .replace(/\r\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .replace(/\t/g, ' ')
            .replace(/ {2,}/g, ' ')
            .trim();
    }
    calculateRelevance(query, content, similarity) {
        const queryWords = query.toLowerCase().split(/\s+/);
        const contentWords = content.toLowerCase().split(/\s+/);
        let keywordMatches = 0;
        for (const word of queryWords) {
            if (contentWords.some(cWord => cWord.includes(word) || word.includes(cWord))) {
                keywordMatches++;
            }
        }
        const keywordScore = keywordMatches / queryWords.length;
        return (similarity * 0.8) + (keywordScore * 0.2);
    }
    async getCollectionStats() {
        if (!this.isInitialized) {
            return {
                totalDocuments: 0,
                collectionName: this.config.collectionName,
                embeddingModel: this.config.embeddingModel,
                chunkSize: this.config.chunkSize,
                isInitialized: false,
                status: 'ChromaDB unavailable'
            };
        }
        try {
            const count = await this.collection.count();
            return {
                totalDocuments: count,
                collectionName: this.config.collectionName,
                embeddingModel: this.config.embeddingModel,
                chunkSize: this.config.chunkSize,
                isInitialized: this.isInitialized
            };
        }
        catch (error) {
            this.logger.error(`Failed to get collection stats: ${error.message}`);
            throw error;
        }
    }
    async deleteDocument(documentId) {
        if (!this.isInitialized) {
            this.logger.warn('Document deletion requested but RAG Service not initialized');
            return false;
        }
        try {
            const results = await this.collection.get({
                where: { documentId }
            });
            if (results.ids && results.ids.length > 0) {
                await this.collection.delete({
                    ids: results.ids
                });
                this.loggerService.logIntegration({
                    service: 'RAG_CHROMADB',
                    action: 'DELETE_DOCUMENT',
                    status: 'SUCCESS',
                    timestamp: new Date(),
                    metadata: {
                        documentId,
                        chunksDeleted: results.ids.length
                    }
                });
                return true;
            }
            return false;
        }
        catch (error) {
            this.loggerService.logIntegration({
                service: 'RAG_CHROMADB',
                action: 'DELETE_DOCUMENT',
                status: 'FAILED',
                errorMessage: error.message,
                timestamp: new Date(),
                metadata: { documentId }
            });
            throw error;
        }
    }
};
exports.RAGService = RAGService;
exports.RAGService = RAGService = RAGService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        logger_service_1.LoggerService])
], RAGService);
//# sourceMappingURL=rag.service.js.map