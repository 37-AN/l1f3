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
var DocumentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
const common_1 = require("@nestjs/common");
const pdfParse = __importStar(require("pdf-parse"));
const mammoth = __importStar(require("mammoth"));
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const rag_interface_1 = require("./interfaces/rag.interface");
let DocumentService = DocumentService_1 = class DocumentService {
    constructor() {
        this.logger = new common_1.Logger(DocumentService_1.name);
    }
    async processFile(filePath, fileName, userId, metadata) {
        try {
            const fileExtension = path.extname(fileName).toLowerCase();
            const fileStats = await fs.stat(filePath);
            let content = '';
            let category = this.determineCategory(fileName, fileExtension);
            switch (fileExtension) {
                case '.pdf':
                    content = await this.extractPdfContent(filePath);
                    break;
                case '.docx':
                    content = await this.extractDocxContent(filePath);
                    break;
                case '.txt':
                case '.md':
                    content = await this.extractTextContent(filePath);
                    break;
                case '.json':
                    content = await this.extractJsonContent(filePath);
                    break;
                default:
                    throw new Error(`Unsupported file type: ${fileExtension}`);
            }
            const processedMetadata = {
                source: filePath,
                fileName,
                fileType: fileExtension.slice(1),
                uploadedAt: new Date(),
                chunkIndex: 0,
                totalChunks: 0,
                tokenCount: 0,
                userId,
                tags: metadata?.tags || [],
                category: metadata?.category || category,
                ...metadata
            };
            return {
                content: this.cleanContent(content),
                metadata: processedMetadata
            };
        }
        catch (error) {
            this.logger.error(`Failed to process file ${fileName}: ${error.message}`);
            throw new Error(`Document processing failed: ${error.message}`);
        }
    }
    async extractPdfContent(filePath) {
        try {
            const buffer = await fs.readFile(filePath);
            const data = await pdfParse(buffer);
            return data.text;
        }
        catch (error) {
            throw new Error(`PDF extraction failed: ${error.message}`);
        }
    }
    async extractDocxContent(filePath) {
        try {
            const buffer = await fs.readFile(filePath);
            const result = await mammoth.extractRawText({ buffer });
            return result.value;
        }
        catch (error) {
            throw new Error(`DOCX extraction failed: ${error.message}`);
        }
    }
    async extractTextContent(filePath) {
        try {
            return await fs.readFile(filePath, 'utf-8');
        }
        catch (error) {
            throw new Error(`Text extraction failed: ${error.message}`);
        }
    }
    async extractJsonContent(filePath) {
        try {
            const jsonContent = await fs.readFile(filePath, 'utf-8');
            const parsed = JSON.parse(jsonContent);
            return this.jsonToText(parsed);
        }
        catch (error) {
            throw new Error(`JSON extraction failed: ${error.message}`);
        }
    }
    jsonToText(obj, depth = 0) {
        const indent = '  '.repeat(depth);
        let text = '';
        if (Array.isArray(obj)) {
            obj.forEach((item, index) => {
                text += `${indent}[${index}]: ${this.jsonToText(item, depth + 1)}\n`;
            });
        }
        else if (typeof obj === 'object' && obj !== null) {
            for (const [key, value] of Object.entries(obj)) {
                if (typeof value === 'object') {
                    text += `${indent}${key}:\n${this.jsonToText(value, depth + 1)}`;
                }
                else {
                    text += `${indent}${key}: ${value}\n`;
                }
            }
        }
        else {
            text += `${obj}`;
        }
        return text;
    }
    determineCategory(fileName, fileExtension) {
        const name = fileName.toLowerCase();
        if (name.includes('balance') || name.includes('income') || name.includes('statement') ||
            name.includes('financial') || name.includes('p&l') || name.includes('profit')) {
            return rag_interface_1.DocumentCategory.FINANCIAL_STATEMENT;
        }
        if (name.includes('investment') || name.includes('portfolio') || name.includes('fund') ||
            name.includes('research') || name.includes('analysis')) {
            return rag_interface_1.DocumentCategory.INVESTMENT_REPORT;
        }
        if (name.includes('market') || name.includes('trend') || name.includes('sector') ||
            name.includes('industry') || name.includes('outlook')) {
            return rag_interface_1.DocumentCategory.MARKET_RESEARCH;
        }
        if (name.includes('business') || name.includes('plan') || name.includes('strategy') ||
            name.includes('model') || name.includes('proposal')) {
            return rag_interface_1.DocumentCategory.BUSINESS_PLAN;
        }
        if (name.includes('transaction') || name.includes('trade') || name.includes('record') ||
            name.includes('history') || name.includes('log')) {
            return rag_interface_1.DocumentCategory.TRANSACTION_RECORD;
        }
        if (name.includes('regulation') || name.includes('compliance') || name.includes('policy') ||
            name.includes('legal') || name.includes('regulatory')) {
            return rag_interface_1.DocumentCategory.REGULATORY_DOC;
        }
        return rag_interface_1.DocumentCategory.GENERAL;
    }
    cleanContent(content) {
        return content
            .replace(/\r\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .replace(/\t/g, ' ')
            .replace(/ {2,}/g, ' ')
            .replace(/[^\x00-\x7F]/g, '')
            .trim();
    }
    async validateFile(file) {
        const allowedTypes = ['.pdf', '.docx', '.txt', '.md', '.json'];
        const maxSize = 10 * 1024 * 1024;
        const fileExtension = path.extname(file.originalname).toLowerCase();
        if (!allowedTypes.includes(fileExtension)) {
            throw new Error(`File type ${fileExtension} not supported`);
        }
        if (file.size > maxSize) {
            throw new Error('File size exceeds 10MB limit');
        }
        return true;
    }
    async saveUploadedFile(file, userId) {
        const uploadDir = path.join(process.cwd(), 'storage', 'uploads', userId);
        await fs.mkdir(uploadDir, { recursive: true });
        const timestamp = Date.now();
        const safeFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${timestamp}_${safeFileName}`;
        const filePath = path.join(uploadDir, fileName);
        await fs.writeFile(filePath, file.buffer);
        return filePath;
    }
    async deleteFile(filePath) {
        try {
            await fs.unlink(filePath);
        }
        catch (error) {
            this.logger.warn(`Failed to delete file ${filePath}: ${error.message}`);
        }
    }
};
exports.DocumentService = DocumentService;
exports.DocumentService = DocumentService = DocumentService_1 = __decorate([
    (0, common_1.Injectable)()
], DocumentService);
//# sourceMappingURL=document.service.js.map