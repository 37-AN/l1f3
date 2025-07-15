import { Injectable, Logger } from '@nestjs/common';
import { MCPMessage, MCPServer } from '../mcp-framework/interfaces/mcp.interface';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class NotionMCPServer {
  private readonly logger = new Logger(NotionMCPServer.name);
  private client: AxiosInstance;

  constructor() {
    this.initializeClient();
  }

  private initializeClient(): void {
    this.client = axios.create({
      baseURL: 'https://api.notion.com/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NOTION_API_TOKEN}`,
        'Notion-Version': '2022-06-28',
      },
    });
  }

  /**
   * Get server configuration
   */
  getServerConfig(): MCPServer {
    return {
      id: 'notion_server',
      name: 'Notion MCP Server',
      description: 'Documentation and knowledge management integration',
      version: '1.0.0',
      capabilities: [
        {
          name: 'database_operations',
          version: '1.0.0',
          description: 'Interact with Notion databases',
          methods: ['query_database', 'create_page', 'update_page', 'get_page'],
        },
        {
          name: 'page_operations',
          version: '1.0.0',
          description: 'Manage Notion pages and content',
          methods: ['create_page', 'update_page', 'get_page', 'delete_page'],
        },
        {
          name: 'search',
          version: '1.0.0',
          description: 'Search across Notion workspace',
          methods: ['search_pages', 'search_databases'],
        },
        {
          name: 'blocks',
          version: '1.0.0',
          description: 'Manage page blocks and content',
          methods: ['get_blocks', 'append_blocks', 'update_block'],
        },
      ],
      endpoints: [
        {
          method: 'query_database',
          description: 'Query a Notion database',
          parameters: [
            { name: 'database_id', type: 'string', required: true, description: 'Database ID' },
            { name: 'filter', type: 'object', required: false, description: 'Filter criteria' },
            { name: 'sorts', type: 'array', required: false, description: 'Sort criteria' },
            { name: 'page_size', type: 'number', required: false, description: 'Number of results' },
          ],
          returns: { type: 'object', description: 'Database query results' },
        },
        {
          method: 'create_page',
          description: 'Create a new page',
          parameters: [
            { name: 'parent', type: 'object', required: true, description: 'Parent database or page' },
            { name: 'properties', type: 'object', required: true, description: 'Page properties' },
            { name: 'children', type: 'array', required: false, description: 'Page content blocks' },
          ],
          returns: { type: 'object', description: 'Created page' },
        },
        {
          method: 'update_page',
          description: 'Update an existing page',
          parameters: [
            { name: 'page_id', type: 'string', required: true, description: 'Page ID' },
            { name: 'properties', type: 'object', required: true, description: 'Updated properties' },
          ],
          returns: { type: 'object', description: 'Updated page' },
        },
        {
          method: 'get_page',
          description: 'Get page details',
          parameters: [
            { name: 'page_id', type: 'string', required: true, description: 'Page ID' },
          ],
          returns: { type: 'object', description: 'Page details' },
        },
        {
          method: 'search_pages',
          description: 'Search for pages',
          parameters: [
            { name: 'query', type: 'string', required: true, description: 'Search query' },
            { name: 'filter', type: 'object', required: false, description: 'Filter criteria' },
            { name: 'page_size', type: 'number', required: false, description: 'Number of results' },
          ],
          returns: { type: 'object', description: 'Search results' },
        },
      ],
      status: 'disconnected',
      config: {
        host: 'api.notion.com',
        port: 443,
        apiKey: process.env.NOTION_API_TOKEN,
        timeout: 30000,
        maxRetries: 3,
      },
    };
  }

  /**
   * Handle MCP messages
   */
  async handleMessage(message: MCPMessage): Promise<MCPMessage> {
    try {
      switch (message.method) {
        case 'ping':
          return this.handlePing(message);
        case 'query_database':
          return await this.queryDatabase(message);
        case 'create_page':
          return await this.createPage(message);
        case 'update_page':
          return await this.updatePage(message);
        case 'get_page':
          return await this.getPage(message);
        case 'delete_page':
          return await this.deletePage(message);
        case 'search_pages':
          return await this.searchPages(message);
        case 'get_blocks':
          return await this.getBlocks(message);
        case 'append_blocks':
          return await this.appendBlocks(message);
        case 'update_block':
          return await this.updateBlock(message);
        default:
          return {
            jsonrpc: '2.0',
            id: message.id,
            error: {
              code: -32601,
              message: `Method not found: ${message.method}`,
            },
          };
      }
    } catch (error) {
      this.logger.error(`Error handling Notion message:`, error);
      return {
        jsonrpc: '2.0',
        id: message.id,
        error: {
          code: -32603,
          message: `Internal error: ${error.message}`,
        },
      };
    }
  }

  private handlePing(message: MCPMessage): MCPMessage {
    return {
      jsonrpc: '2.0',
      id: message.id,
      result: 'pong',
    };
  }

  private async queryDatabase(message: MCPMessage): Promise<MCPMessage> {
    const { database_id, filter, sorts, page_size = 100 } = message.params;
    
    const requestBody: any = {
      page_size,
    };

    if (filter) requestBody.filter = filter;
    if (sorts) requestBody.sorts = sorts;

    const response = await this.client.post(`/databases/${database_id}/query`, requestBody);

    return {
      jsonrpc: '2.0',
      id: message.id,
      result: {
        results: response.data.results,
        next_cursor: response.data.next_cursor,
        has_more: response.data.has_more,
      },
    };
  }

  private async createPage(message: MCPMessage): Promise<MCPMessage> {
    const { parent, properties, children } = message.params;
    
    const pageData: any = {
      parent,
      properties,
    };

    if (children) pageData.children = children;

    const response = await this.client.post('/pages', pageData);

    return {
      jsonrpc: '2.0',
      id: message.id,
      result: { page: response.data },
    };
  }

  private async updatePage(message: MCPMessage): Promise<MCPMessage> {
    const { page_id, properties } = message.params;
    
    const response = await this.client.patch(`/pages/${page_id}`, { properties });

    return {
      jsonrpc: '2.0',
      id: message.id,
      result: { page: response.data },
    };
  }

  private async getPage(message: MCPMessage): Promise<MCPMessage> {
    const { page_id } = message.params;
    
    const response = await this.client.get(`/pages/${page_id}`);

    return {
      jsonrpc: '2.0',
      id: message.id,
      result: { page: response.data },
    };
  }

  private async deletePage(message: MCPMessage): Promise<MCPMessage> {
    const { page_id } = message.params;
    
    const response = await this.client.patch(`/pages/${page_id}`, { archived: true });

    return {
      jsonrpc: '2.0',
      id: message.id,
      result: { page: response.data },
    };
  }

  private async searchPages(message: MCPMessage): Promise<MCPMessage> {
    const { query, filter, page_size = 100 } = message.params;
    
    const searchData: any = {
      query,
      page_size,
    };

    if (filter) searchData.filter = filter;

    const response = await this.client.post('/search', searchData);

    return {
      jsonrpc: '2.0',
      id: message.id,
      result: {
        results: response.data.results,
        next_cursor: response.data.next_cursor,
        has_more: response.data.has_more,
      },
    };
  }

  private async getBlocks(message: MCPMessage): Promise<MCPMessage> {
    const { page_id, page_size = 100 } = message.params;
    
    const response = await this.client.get(`/blocks/${page_id}/children`, {
      params: { page_size },
    });

    return {
      jsonrpc: '2.0',
      id: message.id,
      result: {
        blocks: response.data.results,
        next_cursor: response.data.next_cursor,
        has_more: response.data.has_more,
      },
    };
  }

  private async appendBlocks(message: MCPMessage): Promise<MCPMessage> {
    const { page_id, children } = message.params;
    
    const response = await this.client.patch(`/blocks/${page_id}/children`, { children });

    return {
      jsonrpc: '2.0',
      id: message.id,
      result: { blocks: response.data.results },
    };
  }

  private async updateBlock(message: MCPMessage): Promise<MCPMessage> {
    const { block_id, updates } = message.params;
    
    const response = await this.client.patch(`/blocks/${block_id}`, updates);

    return {
      jsonrpc: '2.0',
      id: message.id,
      result: { block: response.data },
    };
  }

  /**
   * Helper method to create LIF3-specific documentation pages
   */
  async createLIF3Documentation(title: string, content: string, category: string): Promise<any> {
    const pageData = {
      parent: {
        database_id: process.env.NOTION_LIF3_DATABASE_ID,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: title,
              },
            },
          ],
        },
        Category: {
          select: {
            name: category,
          },
        },
        Status: {
          select: {
            name: 'Active',
          },
        },
        'Created Date': {
          date: {
            start: new Date().toISOString(),
          },
        },
      },
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: content,
                },
              },
            ],
          },
        },
      ],
    };

    const response = await this.client.post('/pages', pageData);
    return response.data;
  }

  /**
   * Helper method to update LIF3 goal progress in Notion
   */
  async updateGoalProgress(goalId: string, progress: number, notes: string): Promise<any> {
    const updateData = {
      properties: {
        Progress: {
          number: progress,
        },
        'Last Updated': {
          date: {
            start: new Date().toISOString(),
          },
        },
        Notes: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: notes,
              },
            },
          ],
        },
      },
    };

    const response = await this.client.patch(`/pages/${goalId}`, updateData);
    return response.data;
  }
}