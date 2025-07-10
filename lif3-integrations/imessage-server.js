#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server({ name: 'lif3-imessage', version: '1.0.0' }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    { name: 'imessage_status', description: 'iMessage integration status', inputSchema: { type: 'object', properties: {} } }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  return {
    content: [{
      type: 'text',
      text: '💬 iMessage Integration: Ready for configuration\nQuick financial updates via messages'
    }]
  };
});

const transport = new StdioServerTransport();
server.connect(transport).then(() => console.error('iMessage MCP server running'));
