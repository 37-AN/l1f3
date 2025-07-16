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
var MCPIntegrationController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPIntegrationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const mcp_framework_service_1 = require("./mcp-framework.service");
let MCPIntegrationController = MCPIntegrationController_1 = class MCPIntegrationController {
    constructor(mcpFrameworkService) {
        this.mcpFrameworkService = mcpFrameworkService;
        this.logger = new common_1.Logger(MCPIntegrationController_1.name);
    }
    getServers() {
        return this.mcpFrameworkService.getServers();
    }
    getServer(serverId) {
        const server = this.mcpFrameworkService.getServer(serverId);
        if (!server) {
            throw new common_1.HttpException('Server not found', common_1.HttpStatus.NOT_FOUND);
        }
        return server;
    }
    async registerServer(serverConfig) {
        try {
            return await this.mcpFrameworkService.registerServer(serverConfig);
        }
        catch (error) {
            this.logger.error('Failed to register server:', error);
            throw new common_1.HttpException(`Failed to register server: ${error.message}`, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    getIntegrations() {
        return this.mcpFrameworkService.getIntegrations();
    }
    getIntegration(integrationId) {
        const integration = this.mcpFrameworkService.getIntegration(integrationId);
        if (!integration) {
            throw new common_1.HttpException('Integration not found', common_1.HttpStatus.NOT_FOUND);
        }
        return integration;
    }
    async registerIntegration(integrationConfig) {
        try {
            return await this.mcpFrameworkService.registerIntegration(integrationConfig);
        }
        catch (error) {
            this.logger.error('Failed to register integration:', error);
            throw new common_1.HttpException(`Failed to register integration: ${error.message}`, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async updateIntegration(integrationId, updates) {
        const integration = this.mcpFrameworkService.getIntegration(integrationId);
        if (!integration) {
            throw new common_1.HttpException('Integration not found', common_1.HttpStatus.NOT_FOUND);
        }
        try {
            const updatedIntegration = { ...integration, ...updates };
            return await this.mcpFrameworkService.registerIntegration(updatedIntegration);
        }
        catch (error) {
            this.logger.error('Failed to update integration:', error);
            throw new common_1.HttpException(`Failed to update integration: ${error.message}`, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async syncIntegration(integrationId) {
        const integration = this.mcpFrameworkService.getIntegration(integrationId);
        if (!integration) {
            throw new common_1.HttpException('Integration not found', common_1.HttpStatus.NOT_FOUND);
        }
        try {
            return await this.mcpFrameworkService.syncIntegration(integrationId);
        }
        catch (error) {
            this.logger.error('Failed to sync integration:', error);
            throw new common_1.HttpException(`Failed to sync integration: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async syncAllIntegrations() {
        try {
            return await this.mcpFrameworkService.syncAllIntegrations();
        }
        catch (error) {
            this.logger.error('Failed to sync all integrations:', error);
            throw new common_1.HttpException(`Failed to sync all integrations: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async sendMessage(serverId, message) {
        const server = this.mcpFrameworkService.getServer(serverId);
        if (!server) {
            throw new common_1.HttpException('Server not found', common_1.HttpStatus.NOT_FOUND);
        }
        try {
            return await this.mcpFrameworkService.sendMessage(serverId, message);
        }
        catch (error) {
            this.logger.error('Failed to send message:', error);
            throw new common_1.HttpException(`Failed to send message: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    getUnifiedSchema() {
        return this.mcpFrameworkService.getUnifiedSchema();
    }
    getFrameworkStatus() {
        const servers = this.mcpFrameworkService.getServers();
        const integrations = this.mcpFrameworkService.getIntegrations();
        return {
            servers: {
                total: servers.length,
                connected: servers.filter(s => s.status === 'connected').length,
                disconnected: servers.filter(s => s.status === 'disconnected').length,
                error: servers.filter(s => s.status === 'error').length,
            },
            integrations: {
                total: integrations.length,
                enabled: integrations.filter(i => i.enabled).length,
                autoSync: integrations.filter(i => i.autoSync).length,
            },
            schema: {
                version: this.mcpFrameworkService.getUnifiedSchema().version,
                entities: this.mcpFrameworkService.getUnifiedSchema().entities.length,
                relationships: this.mcpFrameworkService.getUnifiedSchema().relationships.length,
            },
        };
    }
    async testConnection(serverId) {
        const server = this.mcpFrameworkService.getServer(serverId);
        if (!server) {
            throw new common_1.HttpException('Server not found', common_1.HttpStatus.NOT_FOUND);
        }
        try {
            const pingMessage = {
                jsonrpc: '2.0',
                id: 'test_ping',
                method: 'ping',
                params: {},
            };
            const response = await this.mcpFrameworkService.sendMessage(serverId, pingMessage);
            if (response.result === 'pong') {
                return { success: true, message: 'Connection test successful' };
            }
            else {
                return { success: false, message: 'Unexpected response from server' };
            }
        }
        catch (error) {
            this.logger.error('Connection test failed:', error);
            throw new common_1.HttpException(`Connection test failed: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.MCPIntegrationController = MCPIntegrationController;
__decorate([
    (0, common_1.Get)('/servers'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all registered MCP servers' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of MCP servers' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], MCPIntegrationController.prototype, "getServers", null);
__decorate([
    (0, common_1.Get)('/servers/:serverId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get MCP server by ID' }),
    (0, swagger_1.ApiParam)({ name: 'serverId', description: 'MCP server ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'MCP server details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Server not found' }),
    __param(0, (0, common_1.Param)('serverId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], MCPIntegrationController.prototype, "getServer", null);
__decorate([
    (0, common_1.Post)('/servers'),
    (0, swagger_1.ApiOperation)({ summary: 'Register new MCP server' }),
    (0, swagger_1.ApiBody)({ description: 'MCP server configuration' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Server registered successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid server configuration' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MCPIntegrationController.prototype, "registerServer", null);
__decorate([
    (0, common_1.Get)('/integrations'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all registered integrations' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of integrations' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], MCPIntegrationController.prototype, "getIntegrations", null);
__decorate([
    (0, common_1.Get)('/integrations/:integrationId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get integration by ID' }),
    (0, swagger_1.ApiParam)({ name: 'integrationId', description: 'Integration ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Integration details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Integration not found' }),
    __param(0, (0, common_1.Param)('integrationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], MCPIntegrationController.prototype, "getIntegration", null);
__decorate([
    (0, common_1.Post)('/integrations'),
    (0, swagger_1.ApiOperation)({ summary: 'Register new integration' }),
    (0, swagger_1.ApiBody)({ description: 'Integration configuration' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Integration registered successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid integration configuration' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MCPIntegrationController.prototype, "registerIntegration", null);
__decorate([
    (0, common_1.Put)('/integrations/:integrationId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update integration configuration' }),
    (0, swagger_1.ApiParam)({ name: 'integrationId', description: 'Integration ID' }),
    (0, swagger_1.ApiBody)({ description: 'Updated integration configuration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Integration updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Integration not found' }),
    __param(0, (0, common_1.Param)('integrationId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MCPIntegrationController.prototype, "updateIntegration", null);
__decorate([
    (0, common_1.Post)('/integrations/:integrationId/sync'),
    (0, swagger_1.ApiOperation)({ summary: 'Sync integration data' }),
    (0, swagger_1.ApiParam)({ name: 'integrationId', description: 'Integration ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sync completed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Integration not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Sync failed' }),
    __param(0, (0, common_1.Param)('integrationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MCPIntegrationController.prototype, "syncIntegration", null);
__decorate([
    (0, common_1.Post)('/sync/all'),
    (0, swagger_1.ApiOperation)({ summary: 'Sync all enabled integrations' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sync completed for all integrations' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MCPIntegrationController.prototype, "syncAllIntegrations", null);
__decorate([
    (0, common_1.Post)('/servers/:serverId/message'),
    (0, swagger_1.ApiOperation)({ summary: 'Send message to MCP server' }),
    (0, swagger_1.ApiParam)({ name: 'serverId', description: 'Server ID' }),
    (0, swagger_1.ApiBody)({ description: 'MCP message' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Message sent successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Server not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Failed to send message' }),
    __param(0, (0, common_1.Param)('serverId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MCPIntegrationController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Get)('/schema'),
    (0, swagger_1.ApiOperation)({ summary: 'Get unified data schema' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Unified schema definition' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MCPIntegrationController.prototype, "getUnifiedSchema", null);
__decorate([
    (0, common_1.Get)('/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get MCP framework status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Framework status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MCPIntegrationController.prototype, "getFrameworkStatus", null);
__decorate([
    (0, common_1.Post)('/test/:serverId'),
    (0, swagger_1.ApiOperation)({ summary: 'Test MCP server connection' }),
    (0, swagger_1.ApiParam)({ name: 'serverId', description: 'Server ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Connection test successful' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Server not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Connection test failed' }),
    __param(0, (0, common_1.Param)('serverId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MCPIntegrationController.prototype, "testConnection", null);
exports.MCPIntegrationController = MCPIntegrationController = MCPIntegrationController_1 = __decorate([
    (0, swagger_1.ApiTags)('MCP Integration'),
    (0, common_1.Controller)('mcp'),
    __metadata("design:paramtypes", [mcp_framework_service_1.MCPFrameworkService])
], MCPIntegrationController);
//# sourceMappingURL=mcp-integration.controller.js.map