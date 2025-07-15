import { MCPFrameworkService } from '../mcp-framework.service';
import { MCPServerManager } from '../mcp-server-manager.service';
import { MCPEventDispatcher } from '../mcp-event-dispatcher.service';
import { MCPDataSyncService } from '../mcp-data-sync.service';

describe('MCP Framework Basic Tests', () => {
  let service: MCPFrameworkService;
  let serverManager: MCPServerManager;
  let eventDispatcher: MCPEventDispatcher;
  let dataSyncService: MCPDataSyncService;

  beforeEach(() => {
    // Mock dependencies
    serverManager = {
      connectServer: jest.fn(),
      sendMessage: jest.fn(),
    } as any;

    eventDispatcher = {
      dispatch: jest.fn(),
      createSyncEvent: jest.fn(),
    } as any;

    dataSyncService = {
      syncIntegration: jest.fn(),
    } as any;

    service = new MCPFrameworkService(serverManager, eventDispatcher, dataSyncService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have unified schema', () => {
    const schema = service.getUnifiedSchema();
    expect(schema).toBeDefined();
    expect(schema.version).toBe('1.0.0');
    expect(schema.entities).toBeDefined();
    expect(schema.entities.length).toBeGreaterThan(0);
  });

  it('should register server successfully', async () => {
    const serverConfig = {
      name: 'Test Server',
      description: 'Test MCP Server',
      config: {
        host: 'localhost',
        port: 3000,
      },
    };

    const server = await service.registerServer(serverConfig);
    expect(server).toBeDefined();
    expect(server.name).toBe('Test Server');
    expect(server.id).toBeDefined();
  });

  it('should register integration successfully', async () => {
    const integrationConfig = {
      serverId: 'test-server',
      name: 'Test Integration',
      description: 'Test integration',
    };

    const integration = await service.registerIntegration(integrationConfig);
    expect(integration).toBeDefined();
    expect(integration.name).toBe('Test Integration');
    expect(integration.id).toBeDefined();
  });

  it('should get servers and integrations', async () => {
    await service.registerServer({
      name: 'Test Server',
      config: { host: 'localhost', port: 3000 },
    });

    await service.registerIntegration({
      serverId: 'test-server',
      name: 'Test Integration',
    });

    const servers = service.getServers();
    const integrations = service.getIntegrations();

    expect(servers).toHaveLength(1);
    expect(integrations).toHaveLength(1);
  });
});