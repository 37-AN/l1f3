import { Injectable, Logger } from '@nestjs/common';
import { MCPServer, MCPMessage, MCPError } from './interfaces/mcp.interface';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class MCPServerManager {
  private readonly logger = new Logger(MCPServerManager.name);
  private readonly connections = new Map<string, AxiosInstance>();
  private readonly healthChecks = new Map<string, NodeJS.Timeout>();

  /**
   * Connect to an MCP server
   */
  async connectServer(server: MCPServer): Promise<void> {
    try {
      const client = axios.create({
        baseURL: `http://${server.config.host}:${server.config.port}`,
        timeout: server.config.timeout || 30000,
        headers: {
          'Content-Type': 'application/json',
          ...(server.config.apiKey && { 'X-API-Key': server.config.apiKey }),
          ...(server.config.authToken && { 'Authorization': `Bearer ${server.config.authToken}` }),
        },
      });

      // Test connection with a ping
      const pingMessage: MCPMessage = {
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
        
        // Start health checks
        this.startHealthCheck(server);
        
        this.logger.log(`Successfully connected to MCP server: ${server.name}`);
      } else {
        throw new Error('Invalid ping response');
      }
    } catch (error) {
      server.status = 'error';
      this.logger.error(`Failed to connect to MCP server ${server.name}:`, error.message);
      throw error;
    }
  }

  /**
   * Disconnect from an MCP server
   */
  async disconnectServer(serverId: string): Promise<void> {
    const client = this.connections.get(serverId);
    if (!client) {
      this.logger.warn(`No connection found for server: ${serverId}`);
      return;
    }

    // Stop health checks
    this.stopHealthCheck(serverId);

    // Remove connection
    this.connections.delete(serverId);
    
    this.logger.log(`Disconnected from MCP server: ${serverId}`);
  }

  /**
   * Send message to MCP server
   */
  async sendMessage(server: MCPServer, message: MCPMessage): Promise<MCPMessage> {
    const client = this.connections.get(server.id);
    if (!client) {
      throw new Error(`No connection to server: ${server.id}`);
    }

    try {
      const response = await this.retryRequest(
        () => client.post('/rpc', message),
        server.config.maxRetries || 3
      );

      if (response.data.error) {
        throw new Error(`MCP Error: ${response.data.error.message}`);
      }

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to send message to server ${server.id}:`, error.message);
      
      // If server is unreachable, mark as disconnected
      if (error.code === 'ECONNREFUSED' || error.code === 'TIMEOUT') {
        server.status = 'disconnected';
      }
      
      throw error;
    }
  }

  /**
   * Get server capabilities
   */
  async getServerCapabilities(server: MCPServer): Promise<any> {
    const message: MCPMessage = {
      jsonrpc: '2.0',
      id: 'capabilities',
      method: 'capabilities',
      params: {},
    };

    const response = await this.sendMessage(server, message);
    return response.result;
  }

  /**
   * Start health check for a server
   */
  private startHealthCheck(server: MCPServer): void {
    const interval = setInterval(async () => {
      try {
        const pingMessage: MCPMessage = {
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
      } catch (error) {
        if (server.status === 'connected') {
          server.status = 'disconnected';
          this.logger.warn(`Server ${server.name} health check failed:`, error.message);
        }
      }
    }, 30000); // Check every 30 seconds

    this.healthChecks.set(server.id, interval);
  }

  /**
   * Stop health check for a server
   */
  private stopHealthCheck(serverId: string): void {
    const interval = this.healthChecks.get(serverId);
    if (interval) {
      clearInterval(interval);
      this.healthChecks.delete(serverId);
    }
  }

  /**
   * Retry failed requests with exponential backoff
   */
  private async retryRequest(
    requestFn: () => Promise<any>,
    maxRetries: number,
    currentRetry = 0
  ): Promise<any> {
    try {
      return await requestFn();
    } catch (error) {
      if (currentRetry >= maxRetries) {
        throw error;
      }

      const delay = Math.pow(2, currentRetry) * 1000; // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return this.retryRequest(requestFn, maxRetries, currentRetry + 1);
    }
  }

  /**
   * Get connection status for all servers
   */
  getConnectionStatus(): Map<string, 'connected' | 'disconnected' | 'error'> {
    const status = new Map<string, 'connected' | 'disconnected' | 'error'>();
    
    for (const [serverId, client] of this.connections.entries()) {
      // Simple check if connection exists
      status.set(serverId, client ? 'connected' : 'disconnected');
    }
    
    return status;
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    // Stop all health checks
    for (const [serverId, interval] of this.healthChecks.entries()) {
      clearInterval(interval);
    }
    this.healthChecks.clear();

    // Clear all connections
    this.connections.clear();
    
    this.logger.log('MCP Server Manager cleaned up');
  }
}