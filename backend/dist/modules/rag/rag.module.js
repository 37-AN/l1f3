"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RAGModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const platform_express_1 = require("@nestjs/platform-express");
const logger_module_1 = require("../../common/logger/logger.module");
const rag_controller_1 = require("./rag.controller");
const rag_service_1 = require("./rag.service");
const rag_ai_service_1 = require("./rag-ai.service");
const document_service_1 = require("./document.service");
const claude_ai_service_1 = require("../integrations/claude-ai.service");
let RAGModule = class RAGModule {
};
exports.RAGModule = RAGModule;
exports.RAGModule = RAGModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            logger_module_1.LoggerModule,
            platform_express_1.MulterModule.register({
                limits: {
                    fileSize: 10 * 1024 * 1024,
                    files: 1
                },
                fileFilter: (req, file, callback) => {
                    const allowedTypes = [
                        'application/pdf',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'text/plain',
                        'text/markdown',
                        'application/json'
                    ];
                    if (allowedTypes.includes(file.mimetype)) {
                        callback(null, true);
                    }
                    else {
                        callback(new Error('Invalid file type'), false);
                    }
                }
            })
        ],
        controllers: [rag_controller_1.RAGController],
        providers: [
            rag_service_1.RAGService,
            rag_ai_service_1.RAGAIService,
            document_service_1.DocumentService,
            claude_ai_service_1.ClaudeAIService
        ],
        exports: [rag_service_1.RAGService, rag_ai_service_1.RAGAIService, document_service_1.DocumentService]
    })
], RAGModule);
//# sourceMappingURL=rag.module.js.map