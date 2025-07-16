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
var MCPFrameworkService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPFrameworkService = void 0;
const common_1 = require("@nestjs/common");
const mcp_server_manager_service_1 = require("./mcp-server-manager.service");
const mcp_event_dispatcher_service_1 = require("./mcp-event-dispatcher.service");
const mcp_data_sync_service_1 = require("./mcp-data-sync.service");
let MCPFrameworkService = MCPFrameworkService_1 = class MCPFrameworkService {
    constructor(serverManager, eventDispatcher, dataSyncService) {
        this.serverManager = serverManager;
        this.eventDispatcher = eventDispatcher;
        this.dataSyncService = dataSyncService;
        this.logger = new common_1.Logger(MCPFrameworkService_1.name);
        this.servers = new Map();
        this.integrations = new Map();
        this.initializeUnifiedSchema();
    }
    initializeUnifiedSchema() {
        this.unifiedSchema = {
            version: '1.0.0',
            entities: [
                {
                    name: 'User',
                    description: 'Unified user profile across all platforms',
                    fields: [
                        { name: 'id', type: 'string', required: true, unique: true, description: 'Unique user identifier' },
                        { name: 'email', type: 'string', required: true, unique: true, description: 'User email address' },
                        { name: 'name', type: 'string', required: true, description: 'User full name' },
                        { name: 'avatar', type: 'string', required: false, description: 'User avatar URL' },
                        { name: 'timezone', type: 'string', required: false, description: 'User timezone' },
                        { name: 'preferences', type: 'json', required: false, description: 'User preferences' },
                        { name: 'createdAt', type: 'datetime', required: true, description: 'Creation timestamp' },
                        { name: 'updatedAt', type: 'datetime', required: true, description: 'Last update timestamp' },
                    ],
                    indexes: [
                        { name: 'idx_user_email', fields: ['email'], unique: true },
                        { name: 'idx_user_created', fields: ['createdAt'], unique: false },
                    ],
                },
                {
                    name: 'Task',
                    description: 'Unified task management across all platforms',
                    fields: [
                        { name: 'id', type: 'string', required: true, unique: true, description: 'Unique task identifier' },
                        { name: 'userId', type: 'string', required: true, description: 'Associated user ID' },
                        { name: 'title', type: 'string', required: true, description: 'Task title' },
                        { name: 'description', type: 'text', required: false, description: 'Task description' },
                        { name: 'status', type: 'string', required: true, description: 'Task status' },
                        { name: 'priority', type: 'string', required: false, description: 'Task priority' },
                        { name: 'dueDate', type: 'datetime', required: false, description: 'Due date' },
                        { name: 'assigneeId', type: 'string', required: false, description: 'Assigned user ID' },
                        { name: 'platformId', type: 'string', required: true, description: 'Source platform ID' },
                        { name: 'externalId', type: 'string', required: false, description: 'External platform task ID' },
                        { name: 'createdAt', type: 'datetime', required: true, description: 'Creation timestamp' },
                        { name: 'updatedAt', type: 'datetime', required: true, description: 'Last update timestamp' },
                    ],
                    indexes: [
                        { name: 'idx_task_user', fields: ['userId'], unique: false },
                        { name: 'idx_task_status', fields: ['status'], unique: false },
                        { name: 'idx_task_platform', fields: ['platformId', 'externalId'], unique: true },
                    ],
                },
                {
                    name: 'Document',
                    description: 'Unified document management across all platforms',
                    fields: [
                        { name: 'id', type: 'string', required: true, unique: true, description: 'Unique document identifier' },
                        { name: 'userId', type: 'string', required: true, description: 'Associated user ID' },
                        { name: 'title', type: 'string', required: true, description: 'Document title' },
                        { name: 'content', type: 'text', required: false, description: 'Document content' },
                        { name: 'type', type: 'string', required: true, description: 'Document type' },
                        { name: 'url', type: 'string', required: false, description: 'Document URL' },
                        { name: 'size', type: 'number', required: false, description: 'Document size in bytes' },
                        { name: 'platformId', type: 'string', required: true, description: 'Source platform ID' },
                        { name: 'externalId', type: 'string', required: false, description: 'External platform document ID' },
                        { name: 'createdAt', type: 'datetime', required: true, description: 'Creation timestamp' },
                        { name: 'updatedAt', type: 'datetime', required: true, description: 'Last update timestamp' },
                    ],
                    indexes: [
                        { name: 'idx_document_user', fields: ['userId'], unique: false },
                        { name: 'idx_document_type', fields: ['type'], unique: false },
                        { name: 'idx_document_platform', fields: ['platformId', 'externalId'], unique: true },
                    ],
                },
                {
                    name: 'Notification',
                    description: 'Unified notification system across all platforms',
                    fields: [
                        { name: 'id', type: 'string', required: true, unique: true, description: 'Unique notification identifier' },
                        { name: 'userId', type: 'string', required: true, description: 'Associated user ID' },
                        { name: 'title', type: 'string', required: true, description: 'Notification title' },
                        { name: 'message', type: 'text', required: true, description: 'Notification message' },
                        { name: 'type', type: 'string', required: true, description: 'Notification type' },
                        { name: 'priority', type: 'string', required: false, description: 'Notification priority' },
                        { name: 'read', type: 'boolean', required: true, defaultValue: false, description: 'Read status' },
                        { name: 'platformId', type: 'string', required: true, description: 'Source platform ID' },
                        { name: 'externalId', type: 'string', required: false, description: 'External platform notification ID' },
                        { name: 'createdAt', type: 'datetime', required: true, description: 'Creation timestamp' },
                        { name: 'updatedAt', type: 'datetime', required: true, description: 'Last update timestamp' },
                    ],
                    indexes: [
                        { name: 'idx_notification_user', fields: ['userId'], unique: false },
                        { name: 'idx_notification_read', fields: ['read'], unique: false },
                        { name: 'idx_notification_platform', fields: ['platformId', 'externalId'], unique: true },
                    ],
                },
            ],
            relationships: [
                {
                    name: 'user_tasks',
                    from: 'User',
                    to: 'Task',
                    type: 'one-to-many',
                    cascadeDelete: true,
                },
                {
                    name: 'user_documents',
                    from: 'User',
                    to: 'Document',
                    type: 'one-to-many',
                    cascadeDelete: true,
                },
                {
                    name: 'user_notifications',
                    from: 'User',
                    to: 'Notification',
                    type: 'one-to-many',
                    cascadeDelete: true,
                },
            ],
        };
    }
    async registerServer(serverConfig) {
        const server = {
            id: serverConfig.id || this.generateId(),
            name: serverConfig.name || 'Unknown Server',
            description: serverConfig.description || '',
            version: serverConfig.version || '1.0.0',
            capabilities: serverConfig.capabilities || [],
            endpoints: serverConfig.endpoints || [],
            status: 'disconnected',
            config: serverConfig.config || {
                host: 'localhost',
                port: 3000,
                timeout: 30000,
                maxRetries: 3,
            },
        };
        this.servers.set(server.id, server);
        this.logger.log(`Registered MCP server: ${server.name} (${server.id})`);
        await this.serverManager.connectServer(server);
        return server;
    }
    getServers() {
        return Array.from(this.servers.values());
    }
    getServer(serverId) {
        return this.servers.get(serverId);
    }
    async registerIntegration(integration) {
        const newIntegration = {
            id: integration.id || this.generateId(),
            serverId: integration.serverId || '',
            name: integration.name || 'Unknown Integration',
            description: integration.description || '',
            enabled: integration.enabled ?? true,
            autoSync: integration.autoSync ?? true,
            syncInterval: integration.syncInterval || 300000,
            config: integration.config || {},
            mapping: integration.mapping || {
                sourceFields: [],
                targetFields: [],
                transformations: [],
            },
        };
        this.integrations.set(newIntegration.id, newIntegration);
        this.logger.log(`Registered integration: ${newIntegration.name} (${newIntegration.id})`);
        if (newIntegration.autoSync) {
            this.startAutoSync(newIntegration.id);
        }
        return newIntegration;
    }
    getIntegrations() {
        return Array.from(this.integrations.values());
    }
    getIntegration(integrationId) {
        return this.integrations.get(integrationId);
    }
    async sendMessage(serverId, message) {
        const server = this.servers.get(serverId);
        if (!server) {
            throw new Error(`Server not found: ${serverId}`);
        }
        return await this.serverManager.sendMessage(server, message);
    }
    async syncIntegration(integrationId) {
        const integration = this.integrations.get(integrationId);
        if (!integration) {
            throw new Error(`Integration not found: ${integrationId}`);
        }
        const server = this.servers.get(integration.serverId);
        if (!server) {
            throw new Error(`Server not found: ${integration.serverId}`);
        }
        return await this.dataSyncService.syncIntegration(integration, server);
    }
    async syncAllIntegrations() {
        const results = [];
        for (const integration of this.integrations.values()) {
            if (integration.enabled) {
                try {
                    const result = await this.syncIntegration(integration.id);
                    results.push(result);
                }
                catch (error) {
                    this.logger.error(`Failed to sync integration ${integration.id}:`, error);
                    results.push({
                        serverId: integration.serverId,
                        integrationId: integration.id,
                        success: false,
                        recordsProcessed: 0,
                        recordsCreated: 0,
                        recordsUpdated: 0,
                        recordsDeleted: 0,
                        errors: [error.message],
                        duration: 0,
                        timestamp: new Date(),
                    });
                }
            }
        }
        return results;
    }
    startAutoSync(integrationId) {
        const integration = this.integrations.get(integrationId);
        if (!integration || !integration.autoSync)
            return;
        setInterval(async () => {
            try {
                await this.syncIntegration(integrationId);
            }
            catch (error) {
                this.logger.error(`Auto-sync failed for integration ${integrationId}:`, error);
            }
        }, integration.syncInterval);
    }
    getUnifiedSchema() {
        return this.unifiedSchema;
    }
    async processEvent(event) {
        await this.eventDispatcher.dispatch(event);
    }
    generateId() {
        return `mcp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
};
exports.MCPFrameworkService = MCPFrameworkService;
exports.MCPFrameworkService = MCPFrameworkService = MCPFrameworkService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mcp_server_manager_service_1.MCPServerManager,
        mcp_event_dispatcher_service_1.MCPEventDispatcher,
        mcp_data_sync_service_1.MCPDataSyncService])
], MCPFrameworkService);
//# sourceMappingURL=mcp-framework.service.js.map