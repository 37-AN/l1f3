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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RAGController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const logging_interceptor_1 = require("../../common/interceptors/logging.interceptor");
const audit_log_guard_1 = require("../../common/guards/audit-log.guard");
const audit_log_decorator_1 = require("../../common/decorators/audit-log.decorator");
const rag_service_1 = require("./rag.service");
const rag_ai_service_1 = require("./rag-ai.service");
const document_service_1 = require("./document.service");
const rag_dto_1 = require("./dto/rag.dto");
let RAGController = class RAGController {
    constructor(ragService, ragAIService, documentService) {
        this.ragService = ragService;
        this.ragAIService = ragAIService;
        this.documentService = documentService;
    }
    async uploadDocument(file, uploadDto) {
        if (!file) {
            throw new common_1.HttpException('No file provided', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            await this.documentService.validateFile(file);
            const userId = 'system';
            const filePath = await this.documentService.saveUploadedFile(file, userId);
            const { content, metadata } = await this.documentService.processFile(filePath, file.originalname, userId, {
                category: uploadDto.category,
                tags: uploadDto.tags,
                ...uploadDto.metadata
            });
            const result = await this.ragService.processDocument(content, metadata);
            await this.documentService.deleteFile(filePath);
            return result;
        }
        catch (error) {
            throw new common_1.HttpException(`Document processing failed: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async semanticSearch(searchDto) {
        try {
            const searchOptions = {
                query: searchDto.query,
                limit: searchDto.limit,
                threshold: searchDto.threshold,
                includeMetadata: searchDto.includeMetadata,
                filters: {
                    fileType: searchDto.fileType,
                    category: searchDto.category,
                    tags: searchDto.tags
                }
            };
            return await this.ragService.semanticSearch(searchOptions);
        }
        catch (error) {
            throw new common_1.HttpException(`Semantic search failed: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async ragQuery(queryDto) {
        try {
            return await this.ragAIService.generateRAGResponse(queryDto);
        }
        catch (error) {
            throw new common_1.HttpException(`RAG query failed: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async analyzeDocument(analyzeDto) {
        try {
            return await this.ragAIService.analyzeDocument(analyzeDto);
        }
        catch (error) {
            throw new common_1.HttpException(`Document analysis failed: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getStats() {
        try {
            return await this.ragService.getCollectionStats();
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to retrieve stats: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteDocument(documentId) {
        try {
            const success = await this.ragService.deleteDocument(documentId);
            if (!success) {
                throw new common_1.HttpException('Document not found', common_1.HttpStatus.NOT_FOUND);
            }
            return { success };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(`Failed to delete document: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async analyzePortfolio(queryDto) {
        try {
            const enhancedQuery = {
                ...queryDto,
                query: `Analyze my investment portfolio based on the uploaded documents. ${queryDto.query}`,
                category: 'investment_report',
                domain: 'portfolio_management'
            };
            return await this.ragAIService.generateRAGResponse(enhancedQuery);
        }
        catch (error) {
            throw new common_1.HttpException(`Portfolio analysis failed: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async performRiskAssessment(queryDto) {
        try {
            const riskAnalysis = {
                analysisType: 'risk_assessment',
                focusAreas: [
                    'market_risk',
                    'credit_risk',
                    'liquidity_risk',
                    'operational_risk',
                    'regulatory_risk'
                ]
            };
            return await this.ragAIService.analyzeDocument(riskAnalysis);
        }
        catch (error) {
            throw new common_1.HttpException(`Risk assessment failed: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async generateMarketInsights(queryDto) {
        try {
            const enhancedQuery = {
                ...queryDto,
                query: `Based on the market research documents, provide insights on current market trends, opportunities, and potential threats. ${queryDto.query}`,
                category: 'market_research',
                domain: 'market_analysis'
            };
            return await this.ragAIService.generateRAGResponse(enhancedQuery);
        }
        catch (error) {
            throw new common_1.HttpException(`Market insights generation failed: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async checkCompliance(queryDto) {
        try {
            const enhancedQuery = {
                ...queryDto,
                query: `Review the regulatory documents and assess compliance with current regulations. Identify any potential compliance issues or recommendations. ${queryDto.query}`,
                category: 'regulatory_doc',
                domain: 'regulatory_compliance'
            };
            return await this.ragAIService.generateRAGResponse(enhancedQuery);
        }
        catch (error) {
            throw new common_1.HttpException(`Compliance check failed: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.RAGController = RAGController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload and process a document for semantic search' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Document processed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid file format or processing error' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, common_1.UseGuards)(audit_log_guard_1.AuditLogGuard),
    (0, audit_log_decorator_1.LogIntegrationEvent)('Document uploaded for RAG processing'),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, rag_dto_1.UploadDocumentDto]),
    __metadata("design:returntype", Promise)
], RAGController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.Post)('search'),
    (0, swagger_1.ApiOperation)({ summary: 'Perform semantic search across uploaded documents' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Search results returned successfully' }),
    (0, common_1.UseGuards)(audit_log_guard_1.AuditLogGuard),
    (0, audit_log_decorator_1.LogIntegrationEvent)('Semantic search performed'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [rag_dto_1.SemanticSearchDto]),
    __metadata("design:returntype", Promise)
], RAGController.prototype, "semanticSearch", null);
__decorate([
    (0, common_1.Post)('query'),
    (0, swagger_1.ApiOperation)({ summary: 'Ask a question using RAG-enhanced AI response' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'AI response generated with document context' }),
    (0, common_1.UseGuards)(audit_log_guard_1.AuditLogGuard),
    (0, audit_log_decorator_1.LogIntegrationEvent)('RAG-enhanced AI query processed'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [rag_dto_1.RAGQueryDto]),
    __metadata("design:returntype", Promise)
], RAGController.prototype, "ragQuery", null);
__decorate([
    (0, common_1.Post)('analyze'),
    (0, swagger_1.ApiOperation)({ summary: 'Perform AI-powered document analysis' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Document analysis completed' }),
    (0, common_1.UseGuards)(audit_log_guard_1.AuditLogGuard),
    (0, audit_log_decorator_1.LogIntegrationEvent)('Document analysis performed'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [rag_dto_1.AnalyzeDocumentDto]),
    __metadata("design:returntype", Promise)
], RAGController.prototype, "analyzeDocument", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get RAG system statistics and health information' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System statistics retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RAGController.prototype, "getStats", null);
__decorate([
    (0, common_1.Delete)('document/:documentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a document and all its chunks from the vector store' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Document deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Document not found' }),
    (0, common_1.UseGuards)(audit_log_guard_1.AuditLogGuard),
    (0, audit_log_decorator_1.LogIntegrationEvent)('Document deleted from RAG system'),
    __param(0, (0, common_1.Param)('documentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RAGController.prototype, "deleteDocument", null);
__decorate([
    (0, common_1.Post)('financial/portfolio-analysis'),
    (0, swagger_1.ApiOperation)({ summary: 'Analyze portfolio documents and generate insights' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Portfolio analysis completed' }),
    (0, common_1.UseGuards)(audit_log_guard_1.AuditLogGuard),
    (0, audit_log_decorator_1.LogIntegrationEvent)('Portfolio analysis performed'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [rag_dto_1.RAGQueryDto]),
    __metadata("design:returntype", Promise)
], RAGController.prototype, "analyzePortfolio", null);
__decorate([
    (0, common_1.Post)('financial/risk-assessment'),
    (0, swagger_1.ApiOperation)({ summary: 'Perform comprehensive risk assessment using uploaded documents' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Risk assessment completed' }),
    (0, common_1.UseGuards)(audit_log_guard_1.AuditLogGuard),
    (0, audit_log_decorator_1.LogIntegrationEvent)('Financial risk assessment performed'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [rag_dto_1.RAGQueryDto]),
    __metadata("design:returntype", Promise)
], RAGController.prototype, "performRiskAssessment", null);
__decorate([
    (0, common_1.Post)('financial/market-insights'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate market insights from research documents' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Market insights generated' }),
    (0, common_1.UseGuards)(audit_log_guard_1.AuditLogGuard),
    (0, audit_log_decorator_1.LogIntegrationEvent)('Market insights analysis performed'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [rag_dto_1.RAGQueryDto]),
    __metadata("design:returntype", Promise)
], RAGController.prototype, "generateMarketInsights", null);
__decorate([
    (0, common_1.Post)('financial/compliance-check'),
    (0, swagger_1.ApiOperation)({ summary: 'Check compliance against regulatory documents' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Compliance check completed' }),
    (0, common_1.UseGuards)(audit_log_guard_1.AuditLogGuard),
    (0, audit_log_decorator_1.LogIntegrationEvent)('Compliance check performed'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [rag_dto_1.RAGQueryDto]),
    __metadata("design:returntype", Promise)
], RAGController.prototype, "checkCompliance", null);
exports.RAGController = RAGController = __decorate([
    (0, swagger_1.ApiTags)('RAG & Semantic Search'),
    (0, common_1.Controller)('rag'),
    (0, common_1.UseInterceptors)(logging_interceptor_1.LoggingInterceptor),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [rag_service_1.RAGService,
        rag_ai_service_1.RAGAIService,
        document_service_1.DocumentService])
], RAGController);
//# sourceMappingURL=rag.controller.js.map