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
var BusinessStrategyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessStrategyService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const child_process_1 = require("child_process");
const STRATEGY_DOC_ID = 'main-strategy';
let BusinessStrategyService = BusinessStrategyService_1 = class BusinessStrategyService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(BusinessStrategyService_1.name);
        this.isInitialized = false;
        this.collectionName = 'business_strategy';
        this.persistPath = './storage/chromadb';
    }
    async onModuleInit() {
        try {
            const chromadb = await Promise.resolve().then(() => __importStar(require('chromadb')));
            this.chromaClient = new chromadb.ChromaClient();
            await this.initializeCollection();
            this.isInitialized = true;
            this.logger.log('BusinessStrategyService initialized with ChromaDB');
        }
        catch (error) {
            this.logger.error(`Failed to initialize ChromaDB: ${error.message}`);
            this.isInitialized = false;
        }
    }
    async initializeCollection() {
        try {
            const { DefaultEmbeddingFunction } = await Promise.resolve().then(() => __importStar(require('@chroma-core/default-embed')));
            const embedFunction = new DefaultEmbeddingFunction();
            this.collection = await this.chromaClient.getCollection({
                name: this.collectionName,
                embeddingFunction: embedFunction
            });
        }
        catch (error) {
            const { DefaultEmbeddingFunction } = await Promise.resolve().then(() => __importStar(require('@chroma-core/default-embed')));
            const embedFunction = new DefaultEmbeddingFunction();
            this.collection = await this.chromaClient.createCollection({
                name: this.collectionName,
                embeddingFunction: embedFunction,
                metadata: {
                    description: 'Business Strategy Data'
                }
            });
            this.logger.log(`Created new ChromaDB collection: ${this.collectionName}`);
        }
    }
    async getStrategy() {
        if (!this.isInitialized)
            return null;
        const results = await this.collection.get({ ids: [STRATEGY_DOC_ID] });
        if (results && results.documents && results.documents[0]) {
            try {
                return JSON.parse(results.documents[0]);
            }
            catch (e) {
                this.logger.error('Failed to parse business strategy document');
                return null;
            }
        }
        return null;
    }
    async updateStrategy(data) {
        if (!this.isInitialized)
            return false;
        await this.collection.upsert({
            ids: [STRATEGY_DOC_ID],
            documents: [JSON.stringify(data)],
            metadatas: [{ updatedAt: new Date().toISOString() }]
        });
        return true;
    }
    async syncToMCP(data) {
        this.logger.log('Starting MCP sync (tool-based)...');
        return new Promise((resolve, reject) => {
            const mcpProcess = (0, child_process_1.spawn)('node', [
                './lif3-integrations/business-server.js'
            ], {
                stdio: ['pipe', 'pipe', 'pipe']
            });
            const callToolRequest = {
                jsonrpc: '2.0',
                id: 1,
                method: 'call_tool',
                params: {
                    name: 'update_business_strategy',
                    arguments: { strategy: data }
                }
            };
            let output = '';
            let errorOutput = '';
            let resolved = false;
            mcpProcess.stdout.on('data', (chunk) => {
                output += chunk.toString();
                try {
                    const lines = output.split('\n').filter(Boolean);
                    for (const line of lines) {
                        const resp = JSON.parse(line);
                        if (resp && resp.result && resp.result.content) {
                            this.logger.log('MCP sync response: ' + JSON.stringify(resp.result.content));
                            resolved = true;
                            resolve();
                            mcpProcess.kill();
                            return;
                        }
                    }
                }
                catch (e) {
                }
            });
            mcpProcess.stderr.on('data', (chunk) => {
                errorOutput += chunk.toString();
            });
            mcpProcess.on('close', (code) => {
                if (!resolved) {
                    this.logger.error('MCP sync process closed without success. Code: ' + code + ' Error: ' + errorOutput);
                    reject(new Error('MCP sync failed'));
                }
            });
            mcpProcess.stdin.write(JSON.stringify(callToolRequest) + '\n');
            mcpProcess.stdin.end();
        });
    }
};
exports.BusinessStrategyService = BusinessStrategyService;
exports.BusinessStrategyService = BusinessStrategyService = BusinessStrategyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], BusinessStrategyService);
//# sourceMappingURL=business-strategy.service.js.map