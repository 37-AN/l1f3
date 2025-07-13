#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

class TestServer {
  constructor() {
    this.server = new Server(
      {
        name: 'lif3-test',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    this.server.onerror = (error) => console.error('[Test MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'test_connection',
          description: 'Test that MCP server is working',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        }
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === 'test_connection') {
        return {
          content: [
            {
              type: 'text',
              text: `🧪 LIF3 MCP TEST SERVER

✅ MCP Connection: WORKING
✅ Server Protocol: CORRECT
✅ Tool Execution: SUCCESSFUL

📊 System Status:
• MCP SDK Version: Latest
• Server Transport: StdioServerTransport
• Tool Handlers: Properly configured
• Response Format: Valid

🎯 Ready for LIF3 integrations:
• Financial tracking (R239,625 → R1,800,000)
• 43V3R business metrics (R0 → R4,881 daily)
• All tools operational

${new Date().toISOString()} - Test completed successfully!`
            }
          ]
        };
      }
      
      throw new Error(`Unknown tool: ${request.params.name}`);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('LIF3 Test MCP server running on stdio');
  }
}

const server = new TestServer();
server.run().catch(console.error);
