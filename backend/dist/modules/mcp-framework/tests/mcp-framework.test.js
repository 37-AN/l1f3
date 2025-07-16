"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const mcp_framework_service_1 = require("../mcp-framework.service");
const mcp_server_manager_service_1 = require("../mcp-server-manager.service");
const mcp_event_dispatcher_service_1 = require("../mcp-event-dispatcher.service");
const mcp_data_sync_service_1 = require("../mcp-data-sync.service");
describe('MCPFrameworkService', () => {
    let service;
    let serverManager;
    let eventDispatcher;
    let dataSyncService;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                mcp_framework_service_1.MCPFrameworkService,
                {
                    provide: mcp_server_manager_service_1.MCPServerManager,
                    useValue: {
                        connectServer: jest.fn(),
                        sendMessage: jest.fn(),
                    },
                },
                {
                    provide: mcp_event_dispatcher_service_1.MCPEventDispatcher,
                    useValue: {
                        dispatch: jest.fn(),
                        createSyncEvent: jest.fn(),
                    },
                },
                {
                    provide: mcp_data_sync_service_1.MCPDataSyncService,
                    useValue: {
                        syncIntegration: jest.fn(),
                    },
                },
            ],
        }).compile();
        service = module.get(mcp_framework_service_1.MCPFrameworkService);
        serverManager = module.get(mcp_server_manager_service_1.MCPServerManager);
        eventDispatcher = module.get(mcp_event_dispatcher_service_1.MCPEventDispatcher);
        dataSyncService = module.get(mcp_data_sync_service_1.MCPDataSyncService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('registerServer', () => {
        it('should register a new MCP server', async () => {
            const serverConfig = {
                name: 'Test Server',
                description: 'Test MCP Server',
                version: '1.0.0',
                config: {
                    host: 'localhost',
                    port: 3000,
                },
            };
            jest.spyOn(serverManager, 'connectServer').mockResolvedValue(undefined);
            const server = await service.registerServer(serverConfig);
            expect(server).toBeDefined();
            expect(server.name).toBe('Test Server');
            expect(server.status).toBe('disconnected');
            expect(serverManager.connectServer).toHaveBeenCalledWith(server);
        });
        it('should generate ID if not provided', async () => {
            const serverConfig = {
                name: 'Test Server',
                config: {
                    host: 'localhost',
                    port: 3000,
                },
            };
            jest.spyOn(serverManager, 'connectServer').mockResolvedValue(undefined);
            const server = await service.registerServer(serverConfig);
            expect(server.id).toBeDefined();
            expect(server.id).toMatch(/^mcp_/);
        });
    });
    describe('registerIntegration', () => {
        it('should register a new integration', async () => {
            const integrationConfig = {
                serverId: 'test-server',
                name: 'Test Integration',
                description: 'Test integration',
                enabled: true,
                autoSync: false,
            };
            const integration = await service.registerIntegration(integrationConfig);
            expect(integration).toBeDefined();
            expect(integration.name).toBe('Test Integration');
            expect(integration.enabled).toBe(true);
            expect(integration.autoSync).toBe(false);
        });
        it('should set default values for optional fields', async () => {
            const integrationConfig = {
                serverId: 'test-server',
                name: 'Test Integration',
            };
            const integration = await service.registerIntegration(integrationConfig);
            expect(integration.enabled).toBe(true);
            expect(integration.autoSync).toBe(true);
            expect(integration.syncInterval).toBe(300000);
        });
    });
    describe('sendMessage', () => {
        it('should send message to server', async () => {
            const serverConfig = {
                name: 'Test Server',
                config: { host: 'localhost', port: 3000 },
            };
            jest.spyOn(serverManager, 'connectServer').mockResolvedValue(undefined);
            const server = await service.registerServer(serverConfig);
            const message = {
                jsonrpc: '2.0',
                id: 'test',
                method: 'ping',
                params: {},
            };
            const expectedResponse = {
                jsonrpc: '2.0',
                id: 'test',
                result: 'pong',
            };
            jest.spyOn(serverManager, 'sendMessage').mockResolvedValue(expectedResponse);
            const response = await service.sendMessage(server.id, message);
            expect(response).toEqual(expectedResponse);
            expect(serverManager.sendMessage).toHaveBeenCalledWith(server, message);
        });
        it('should throw error if server not found', async () => {
            const message = {
                jsonrpc: '2.0',
                id: 'test',
                method: 'ping',
                params: {},
            };
            await expect(service.sendMessage('non-existent', message)).rejects.toThrow('Server not found: non-existent');
        });
    });
    describe('syncIntegration', () => {
        it('should sync integration data', async () => {
            const serverConfig = {
                name: 'Test Server',
                config: { host: 'localhost', port: 3000 },
            };
            const integrationConfig = {
                serverId: 'test-server',
                name: 'Test Integration',
            };
            jest.spyOn(serverManager, 'connectServer').mockResolvedValue(undefined);
            const server = await service.registerServer(serverConfig);
            const integration = await service.registerIntegration({
                ...integrationConfig,
                serverId: server.id,
            });
            const expectedResult = {
                serverId: server.id,
                integrationId: integration.id,
                success: true,
                recordsProcessed: 10,
                recordsCreated: 5,
                recordsUpdated: 3,
                recordsDeleted: 2,
                errors: [],
                duration: 1000,
                timestamp: new Date(),
            };
            jest.spyOn(dataSyncService, 'syncIntegration').mockResolvedValue(expectedResult);
            const result = await service.syncIntegration(integration.id);
            expect(result).toEqual(expectedResult);
            expect(dataSyncService.syncIntegration).toHaveBeenCalledWith(integration, server);
        });
        it('should throw error if integration not found', async () => {
            await expect(service.syncIntegration('non-existent')).rejects.toThrow('Integration not found: non-existent');
        });
    });
    describe('getUnifiedSchema', () => {
        it('should return unified schema', () => {
            const schema = service.getUnifiedSchema();
            expect(schema).toBeDefined();
            expect(schema.version).toBe('1.0.0');
            expect(schema.entities).toBeDefined();
            expect(schema.relationships).toBeDefined();
            expect(schema.entities.length).toBeGreaterThan(0);
        });
        it('should include required entities', () => {
            const schema = service.getUnifiedSchema();
            const entityNames = schema.entities.map(e => e.name);
            expect(entityNames).toContain('User');
            expect(entityNames).toContain('Task');
            expect(entityNames).toContain('Document');
            expect(entityNames).toContain('Notification');
        });
    });
    describe('getServers', () => {
        it('should return all registered servers', async () => {
            const serverConfig1 = {
                name: 'Server 1',
                config: { host: 'localhost', port: 3000 },
            };
            const serverConfig2 = {
                name: 'Server 2',
                config: { host: 'localhost', port: 3001 },
            };
            jest.spyOn(serverManager, 'connectServer').mockResolvedValue(undefined);
            await service.registerServer(serverConfig1);
            await service.registerServer(serverConfig2);
            const servers = service.getServers();
            expect(servers).toHaveLength(2);
            expect(servers.map(s => s.name)).toContain('Server 1');
            expect(servers.map(s => s.name)).toContain('Server 2');
        });
    });
    describe('getIntegrations', () => {
        it('should return all registered integrations', async () => {
            const integration1 = {
                serverId: 'server1',
                name: 'Integration 1',
            };
            const integration2 = {
                serverId: 'server2',
                name: 'Integration 2',
            };
            await service.registerIntegration(integration1);
            await service.registerIntegration(integration2);
            const integrations = service.getIntegrations();
            expect(integrations).toHaveLength(2);
            expect(integrations.map(i => i.name)).toContain('Integration 1');
            expect(integrations.map(i => i.name)).toContain('Integration 2');
        });
    });
});
//# sourceMappingURL=mcp-framework.test.js.map