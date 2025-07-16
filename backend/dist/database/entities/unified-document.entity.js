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
exports.UnifiedDocument = exports.DocumentStatus = exports.DocumentType = void 0;
const typeorm_1 = require("typeorm");
const unified_user_entity_1 = require("./unified-user.entity");
var DocumentType;
(function (DocumentType) {
    DocumentType["FINANCIAL_REPORT"] = "financial_report";
    DocumentType["BUSINESS_PLAN"] = "business_plan";
    DocumentType["GOAL_TRACKING"] = "goal_tracking";
    DocumentType["SYSTEM_DOCUMENTATION"] = "system_documentation";
    DocumentType["ERROR_REPORT"] = "error_report";
    DocumentType["AUTOMATION_LOG"] = "automation_log";
    DocumentType["GENERAL"] = "general";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
var DocumentStatus;
(function (DocumentStatus) {
    DocumentStatus["DRAFT"] = "draft";
    DocumentStatus["PUBLISHED"] = "published";
    DocumentStatus["ARCHIVED"] = "archived";
    DocumentStatus["DELETED"] = "deleted";
})(DocumentStatus || (exports.DocumentStatus = DocumentStatus = {}));
let UnifiedDocument = class UnifiedDocument {
};
exports.UnifiedDocument = UnifiedDocument;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UnifiedDocument.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], UnifiedDocument.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UnifiedDocument.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], UnifiedDocument.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: DocumentType, default: DocumentType.GENERAL }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], UnifiedDocument.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: DocumentStatus, default: DocumentStatus.DRAFT }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], UnifiedDocument.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UnifiedDocument.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], UnifiedDocument.prototype, "size", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UnifiedDocument.prototype, "mimeType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], UnifiedDocument.prototype, "platformId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UnifiedDocument.prototype, "externalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], UnifiedDocument.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], UnifiedDocument.prototype, "syncStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], UnifiedDocument.prototype, "aiAnalysis", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], UnifiedDocument.prototype, "isAutomated", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], UnifiedDocument.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], UnifiedDocument.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], UnifiedDocument.prototype, "lastAccessedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => unified_user_entity_1.UnifiedUser, user => user.documents),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", unified_user_entity_1.UnifiedUser)
], UnifiedDocument.prototype, "user", void 0);
exports.UnifiedDocument = UnifiedDocument = __decorate([
    (0, typeorm_1.Entity)('unified_documents'),
    (0, typeorm_1.Index)(['userId', 'type']),
    (0, typeorm_1.Index)(['platformId', 'externalId'], { unique: true })
], UnifiedDocument);
//# sourceMappingURL=unified-document.entity.js.map