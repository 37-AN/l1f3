import { Controller, Get, Post, Put, Delete, Body, Param, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { MCPFrameworkService } from './mcp-framework.service';
import { MCPServer, MCPIntegration, MCPSyncResult, MCPMessage } from './interfaces/mcp.interface';

@ApiTags('MCP Integration')
@Controller('mcp')
export class MCPIntegrationController {
  private readonly logger = new Logger(MCPIntegrationController.name);

  constructor(private readonly mcpFrameworkService: MCPFrameworkService) {}

  @Get('/servers')
  @ApiOperation({ summary: 'Get all registered MCP servers' })
  @ApiResponse({ status: 200, description: 'List of MCP servers' })
  getServers(): MCPServer[] {
    return this.mcpFrameworkService.getServers();
  }

  @Get('/servers/:serverId')
  @ApiOperation({ summary: 'Get MCP server by ID' })
  @ApiParam({ name: 'serverId', description: 'MCP server ID' })
  @ApiResponse({ status: 200, description: 'MCP server details' })
  @ApiResponse({ status: 404, description: 'Server not found' })
  getServer(@Param('serverId') serverId: string): MCPServer {
    const server = this.mcpFrameworkService.getServer(serverId);
    if (!server) {
      throw new HttpException('Server not found', HttpStatus.NOT_FOUND);
    }
    return server;
  }

  @Post('/servers')
  @ApiOperation({ summary: 'Register new MCP server' })
  @ApiBody({ description: 'MCP server configuration' })
  @ApiResponse({ status: 201, description: 'Server registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid server configuration' })
  async registerServer(@Body() serverConfig: Partial<MCPServer>): Promise<MCPServer> {
    try {
      return await this.mcpFrameworkService.registerServer(serverConfig);
    } catch (error) {
      this.logger.error('Failed to register server:', error);
      throw new HttpException(
        `Failed to register server: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('/integrations')
  @ApiOperation({ summary: 'Get all registered integrations' })
  @ApiResponse({ status: 200, description: 'List of integrations' })
  getIntegrations(): MCPIntegration[] {
    return this.mcpFrameworkService.getIntegrations();
  }

  @Get('/integrations/:integrationId')
  @ApiOperation({ summary: 'Get integration by ID' })
  @ApiParam({ name: 'integrationId', description: 'Integration ID' })
  @ApiResponse({ status: 200, description: 'Integration details' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  getIntegration(@Param('integrationId') integrationId: string): MCPIntegration {
    const integration = this.mcpFrameworkService.getIntegration(integrationId);
    if (!integration) {
      throw new HttpException('Integration not found', HttpStatus.NOT_FOUND);
    }
    return integration;
  }

  @Post('/integrations')
  @ApiOperation({ summary: 'Register new integration' })
  @ApiBody({ description: 'Integration configuration' })
  @ApiResponse({ status: 201, description: 'Integration registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid integration configuration' })
  async registerIntegration(@Body() integrationConfig: Partial<MCPIntegration>): Promise<MCPIntegration> {
    try {
      return await this.mcpFrameworkService.registerIntegration(integrationConfig);
    } catch (error) {
      this.logger.error('Failed to register integration:', error);
      throw new HttpException(
        `Failed to register integration: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Put('/integrations/:integrationId')
  @ApiOperation({ summary: 'Update integration configuration' })
  @ApiParam({ name: 'integrationId', description: 'Integration ID' })
  @ApiBody({ description: 'Updated integration configuration' })
  @ApiResponse({ status: 200, description: 'Integration updated successfully' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  async updateIntegration(
    @Param('integrationId') integrationId: string,
    @Body() updates: Partial<MCPIntegration>
  ): Promise<MCPIntegration> {
    const integration = this.mcpFrameworkService.getIntegration(integrationId);
    if (!integration) {
      throw new HttpException('Integration not found', HttpStatus.NOT_FOUND);
    }

    try {
      const updatedIntegration = { ...integration, ...updates };
      return await this.mcpFrameworkService.registerIntegration(updatedIntegration);
    } catch (error) {
      this.logger.error('Failed to update integration:', error);
      throw new HttpException(
        `Failed to update integration: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('/integrations/:integrationId/sync')
  @ApiOperation({ summary: 'Sync integration data' })
  @ApiParam({ name: 'integrationId', description: 'Integration ID' })
  @ApiResponse({ status: 200, description: 'Sync completed successfully' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  @ApiResponse({ status: 500, description: 'Sync failed' })
  async syncIntegration(@Param('integrationId') integrationId: string): Promise<MCPSyncResult> {
    const integration = this.mcpFrameworkService.getIntegration(integrationId);
    if (!integration) {
      throw new HttpException('Integration not found', HttpStatus.NOT_FOUND);
    }

    try {
      return await this.mcpFrameworkService.syncIntegration(integrationId);
    } catch (error) {
      this.logger.error('Failed to sync integration:', error);
      throw new HttpException(
        `Failed to sync integration: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('/sync/all')
  @ApiOperation({ summary: 'Sync all enabled integrations' })
  @ApiResponse({ status: 200, description: 'Sync completed for all integrations' })
  async syncAllIntegrations(): Promise<MCPSyncResult[]> {
    try {
      return await this.mcpFrameworkService.syncAllIntegrations();
    } catch (error) {
      this.logger.error('Failed to sync all integrations:', error);
      throw new HttpException(
        `Failed to sync all integrations: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('/servers/:serverId/message')
  @ApiOperation({ summary: 'Send message to MCP server' })
  @ApiParam({ name: 'serverId', description: 'Server ID' })
  @ApiBody({ description: 'MCP message' })
  @ApiResponse({ status: 200, description: 'Message sent successfully' })
  @ApiResponse({ status: 404, description: 'Server not found' })
  @ApiResponse({ status: 500, description: 'Failed to send message' })
  async sendMessage(
    @Param('serverId') serverId: string,
    @Body() message: MCPMessage
  ): Promise<MCPMessage> {
    const server = this.mcpFrameworkService.getServer(serverId);
    if (!server) {
      throw new HttpException('Server not found', HttpStatus.NOT_FOUND);
    }

    try {
      return await this.mcpFrameworkService.sendMessage(serverId, message);
    } catch (error) {
      this.logger.error('Failed to send message:', error);
      throw new HttpException(
        `Failed to send message: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('/schema')
  @ApiOperation({ summary: 'Get unified data schema' })
  @ApiResponse({ status: 200, description: 'Unified schema definition' })
  getUnifiedSchema() {
    return this.mcpFrameworkService.getUnifiedSchema();
  }

  @Get('/status')
  @ApiOperation({ summary: 'Get MCP framework status' })
  @ApiResponse({ status: 200, description: 'Framework status' })
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

  @Post('/test/:serverId')
  @ApiOperation({ summary: 'Test MCP server connection' })
  @ApiParam({ name: 'serverId', description: 'Server ID' })
  @ApiResponse({ status: 200, description: 'Connection test successful' })
  @ApiResponse({ status: 404, description: 'Server not found' })
  @ApiResponse({ status: 500, description: 'Connection test failed' })
  async testConnection(@Param('serverId') serverId: string): Promise<{ success: boolean; message: string }> {
    const server = this.mcpFrameworkService.getServer(serverId);
    if (!server) {
      throw new HttpException('Server not found', HttpStatus.NOT_FOUND);
    }

    try {
      const pingMessage: MCPMessage = {
        jsonrpc: '2.0',
        id: 'test_ping',
        method: 'ping',
        params: {},
      };

      const response = await this.mcpFrameworkService.sendMessage(serverId, pingMessage);
      
      if (response.result === 'pong') {
        return { success: true, message: 'Connection test successful' };
      } else {
        return { success: false, message: 'Unexpected response from server' };
      }
    } catch (error) {
      this.logger.error('Connection test failed:', error);
      throw new HttpException(
        `Connection test failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}