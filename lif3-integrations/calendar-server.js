#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  { name: 'lif3-calendar', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    { name: 'calendar_status', description: 'Calendar integration status', inputSchema: { type: 'object', properties: {} } }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  return {
    content: [{
      type: 'text',
      text: '📅 Calendar Integration: Ready for configuration\nSync calendar for time management insights'
    }]
  };
});

const transport = new StdioServerTransport();
server.connect(transport).then(() => console.error('Calendar MCP server running'));
