import { Injectable, Logger } from '@nestjs/common';
import { MCPMessage, MCPServer, MCPIntegration, MCPEvent, MCPSyncResult, MCPUnifiedSchema } from './interfaces/mcp.interface';
import { MCPServerManager } from './mcp-server-manager.service';
import { MCPEventDispatcher } from './mcp-event-dispatcher.service';
import { MCPDataSyncService } from './mcp-data-sync.service';

@Injectable()
export class MCPFrameworkService {
  private readonly logger = new Logger(MCPFrameworkService.name);
  private readonly servers = new Map<string, MCPServer>();
  private readonly integrations = new Map<string, MCPIntegration>();
  private unifiedSchema: MCPUnifiedSchema;

  constructor(
    private readonly serverManager: MCPServerManager,
    private readonly eventDispatcher: MCPEventDispatcher,
    private readonly dataSyncService: MCPDataSyncService,
  ) {
    this.initializeUnifiedSchema();
  }

  /**
   * Initialize the unified schema for cross-platform data synchronization
   */
  private initializeUnifiedSchema(): void {
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

  /**
   * Register a new MCP server
   */
  async registerServer(serverConfig: Partial<MCPServer>): Promise<MCPServer> {
    const server: MCPServer = {
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

    // Attempt to connect to the server
    await this.serverManager.connectServer(server);
    
    return server;
  }

  /**
   * Get all registered servers
   */
  getServers(): MCPServer[] {
    return Array.from(this.servers.values());
  }

  /**
   * Get server by ID
   */
  getServer(serverId: string): MCPServer | undefined {
    return this.servers.get(serverId);
  }

  /**
   * Register a new integration
   */
  async registerIntegration(integration: Partial<MCPIntegration>): Promise<MCPIntegration> {
    const newIntegration: MCPIntegration = {
      id: integration.id || this.generateId(),
      serverId: integration.serverId || '',
      name: integration.name || 'Unknown Integration',
      description: integration.description || '',
      enabled: integration.enabled ?? true,
      autoSync: integration.autoSync ?? true,
      syncInterval: integration.syncInterval || 300000, // 5 minutes
      config: integration.config || {},
      mapping: integration.mapping || {
        sourceFields: [],
        targetFields: [],
        transformations: [],
      },
    };

    this.integrations.set(newIntegration.id, newIntegration);
    this.logger.log(`Registered integration: ${newIntegration.name} (${newIntegration.id})`);

    // Start auto-sync if enabled
    if (newIntegration.autoSync) {
      this.startAutoSync(newIntegration.id);
    }

    return newIntegration;
  }

  /**
   * Get all integrations
   */
  getIntegrations(): MCPIntegration[] {
    return Array.from(this.integrations.values());
  }

  /**
   * Get integration by ID
   */
  getIntegration(integrationId: string): MCPIntegration | undefined {
    return this.integrations.get(integrationId);
  }

  /**
   * Send message to MCP server
   */
  async sendMessage(serverId: string, message: MCPMessage): Promise<MCPMessage> {
    const server = this.servers.get(serverId);
    if (!server) {
      throw new Error(`Server not found: ${serverId}`);
    }

    return await this.serverManager.sendMessage(server, message);
  }

  /**
   * Sync data for a specific integration
   */
  async syncIntegration(integrationId: string): Promise<MCPSyncResult> {
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

  /**
   * Sync all enabled integrations
   */
  async syncAllIntegrations(): Promise<MCPSyncResult[]> {
    const results: MCPSyncResult[] = [];
    
    for (const integration of this.integrations.values()) {
      if (integration.enabled) {
        try {
          const result = await this.syncIntegration(integration.id);
          results.push(result);
        } catch (error) {
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

  /**
   * Start auto-sync for an integration
   */
  private startAutoSync(integrationId: string): void {
    const integration = this.integrations.get(integrationId);
    if (!integration || !integration.autoSync) return;

    setInterval(async () => {
      try {
        await this.syncIntegration(integrationId);
      } catch (error) {
        this.logger.error(`Auto-sync failed for integration ${integrationId}:`, error);
      }
    }, integration.syncInterval);
  }

  /**
   * Get unified schema
   */
  getUnifiedSchema(): MCPUnifiedSchema {
    return this.unifiedSchema;
  }

  /**
   * Process incoming events
   */
  async processEvent(event: MCPEvent): Promise<void> {
    await this.eventDispatcher.dispatch(event);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `mcp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}