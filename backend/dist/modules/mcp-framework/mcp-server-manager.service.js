"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var MCPServerManager_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPServerManager = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let MCPServerManager = MCPServerManager_1 = class MCPServerManager {
    constructor() {
        this.logger = new common_1.Logger(MCPServerManager_1.name);
        this.connections = new Map();
        this.healthChecks = new Map();
    }
    async connectServer(server) {
        try {
            const client = axios_1.default.create({
                baseURL: `http://${server.config.host}:${server.config.port}`,
                timeout: server.config.timeout || 30000,
                headers: {
                    'Content-Type': 'application/json',
                    ...(server.config.apiKey && { 'X-API-Key': server.config.apiKey }),
                    ...(server.config.authToken && { 'Authorization': `Bearer ${server.config.authToken}` }),
                },
            });
            const pingMessage = {
                jsonrpc: '2.0',
                id: 'ping',
                method: 'ping',
                params: {},
            };
            const response = await client.post('/rpc', pingMessage);
            if (response.data.result === 'pong') {
                this.connections.set(server.id, client);
                server.status = 'connected';
                server.lastSync = new Date();
                this.startHealthCheck(server);
                this.logger.log(`Successfully connected to MCP server: ${server.name}`);
            }
            else {
                throw new Error('Invalid ping response');
            }
        }
        catch (error) {
            server.status = 'error';
            this.logger.error(`Failed to connect to MCP server ${server.name}:`, error.message);
            throw error;
        }
    }
    async disconnectServer(serverId) {
        const client = this.connections.get(serverId);
        if (!client) {
            this.logger.warn(`No connection found for server: ${serverId}`);
            return;
        }
        this.stopHealthCheck(serverId);
        this.connections.delete(serverId);
        this.logger.log(`Disconnected from MCP server: ${serverId}`);
    }
    async sendMessage(server, message) {
        const client = this.connections.get(server.id);
        if (!client) {
            throw new Error(`No connection to server: ${server.id}`);
        }
        try {
            const response = await this.retryRequest(() => client.post('/rpc', message), server.config.maxRetries || 3);
            if (response.data.error) {
                throw new Error(`MCP Error: ${response.data.error.message}`);
            }
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to send message to server ${server.id}:`, error.message);
            if (error.code === 'ECONNREFUSED' || error.code === 'TIMEOUT') {
                server.status = 'disconnected';
            }
            throw error;
        }
    }
    async getServerCapabilities(server) {
        const message = {
            jsonrpc: '2.0',
            id: 'capabilities',
            method: 'capabilities',
            params: {},
        };
        const response = await this.sendMessage(server, message);
        return response.result;
    }
    startHealthCheck(server) {
        const interval = setInterval(async () => {
            try {
                const pingMessage = {
                    jsonrpc: '2.0',
                    id: 'health_check',
                    method: 'ping',
                    params: {},
                };
                await this.sendMessage(server, pingMessage);
                if (server.status !== 'connected') {
                    server.status = 'connected';
                    this.logger.log(`Server ${server.name} is back online`);
                }
            }
            catch (error) {
                if (server.status === 'connected') {
                    server.status = 'disconnected';
                    this.logger.warn(`Server ${server.name} health check failed:`, error.message);
                }
            }
        }, 30000);
        this.healthChecks.set(server.id, interval);
    }
    stopHealthCheck(serverId) {
        const interval = this.healthChecks.get(serverId);
        if (interval) {
            clearInterval(interval);
            this.healthChecks.delete(serverId);
        }
    }
    async retryRequest(requestFn, maxRetries, currentRetry = 0) {
        try {
            return await requestFn();
        }
        catch (error) {
            if (currentRetry >= maxRetries) {
                throw error;
            }
            const delay = Math.pow(2, currentRetry) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            return this.retryRequest(requestFn, maxRetries, currentRetry + 1);
        }
    }
    getConnectionStatus() {
        const status = new Map();
        for (const [serverId, client] of this.connections.entries()) {
            status.set(serverId, client ? 'connected' : 'disconnected');
        }
        return status;
    }
    async onModuleDestroy() {
        for (const [serverId, interval] of this.healthChecks.entries()) {
            clearInterval(interval);
        }
        this.healthChecks.clear();
        this.connections.clear();
        this.logger.log('MCP Server Manager cleaned up');
    }
};
exports.MCPServerManager = MCPServerManager;
exports.MCPServerManager = MCPServerManager = MCPServerManager_1 = __decorate([
    (0, common_1.Injectable)()
], MCPServerManager);
//# sourceMappingURL=mcp-server-manager.service.js.map