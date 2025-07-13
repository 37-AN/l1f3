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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyzeDocumentDto = exports.RAGQueryDto = exports.SemanticSearchDto = exports.UploadDocumentDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const rag_interface_1 = require("../interfaces/rag.interface");
class UploadDocumentDto {
}
exports.UploadDocumentDto = UploadDocumentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Document category for better organization' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(rag_interface_1.DocumentCategory),
    __metadata("design:type", String)
], UploadDocumentDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Tags for document classification', type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UploadDocumentDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional metadata' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UploadDocumentDto.prototype, "metadata", void 0);
class SemanticSearchDto {
    constructor() {
        this.limit = 10;
        this.threshold = 0.7;
        this.includeMetadata = true;
    }
}
exports.SemanticSearchDto = SemanticSearchDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Search query text' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SemanticSearchDto.prototype, "query", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum number of results', minimum: 1, maximum: 50 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], SemanticSearchDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Similarity threshold (0-1)', minimum: 0, maximum: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], SemanticSearchDto.prototype, "threshold", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by file type' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SemanticSearchDto.prototype, "fileType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by document category' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(rag_interface_1.DocumentCategory),
    __metadata("design:type", String)
], SemanticSearchDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by tags', type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], SemanticSearchDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Include detailed metadata in results' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SemanticSearchDto.prototype, "includeMetadata", void 0);
class RAGQueryDto {
    constructor() {
        this.maxContextTokens = 4000;
        this.contextChunks = 5;
        this.includeHistory = false;
    }
}
exports.RAGQueryDto = RAGQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Query for RAG-enhanced response' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RAGQueryDto.prototype, "query", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum context tokens to use', minimum: 100, maximum: 8000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(100),
    (0, class_validator_1.Max)(8000),
    __metadata("design:type", Number)
], RAGQueryDto.prototype, "maxContextTokens", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of relevant chunks to retrieve', minimum: 1, maximum: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(20),
    __metadata("design:type", Number)
], RAGQueryDto.prototype, "contextChunks", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Include conversation history for better context' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], RAGQueryDto.prototype, "includeHistory", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter results by category' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(rag_interface_1.DocumentCategory),
    __metadata("design:type", String)
], RAGQueryDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Focus on specific financial domain' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RAGQueryDto.prototype, "domain", void 0);
class AnalyzeDocumentDto {
    constructor() {
        this.comparative = false;
    }
}
exports.AnalyzeDocumentDto = AnalyzeDocumentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Analysis type to perform' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnalyzeDocumentDto.prototype, "analysisType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Document ID to analyze' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnalyzeDocumentDto.prototype, "documentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Specific focus areas for analysis', type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], AnalyzeDocumentDto.prototype, "focusAreas", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Include comparative analysis with other documents' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AnalyzeDocumentDto.prototype, "comparative", void 0);
//# sourceMappingURL=rag.dto.js.map