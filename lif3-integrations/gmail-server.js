#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  { name: 'lif3-gmail', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    { name: 'gmail_status', description: 'Gmail integration status', inputSchema: { type: 'object', properties: {} } }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  return {
    content: [{
      type: 'text',
      text: '📧 Gmail Integration: Ready for configuration\nConnect your Gmail for financial email analysis'
    }]
  };
});

const transport = new StdioServerTransport();
server.connect(transport).then(() => console.error('Gmail MCP server running'));
