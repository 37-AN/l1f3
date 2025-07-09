#\!/usr/bin/env node
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');

const server = new Server({ name: 'lif3-gmail', version: '1.0.0' }, { capabilities: { tools: {} } });

server.setRequestHandler('tools/list', async () => ({
  tools: [
    { name: 'gmail_status', description: 'Gmail integration status', inputSchema: { type: 'object', properties: {} } }
  ]
}));

server.setRequestHandler('tools/call', async (request) => {
  return {
    content: [{
      type: 'text',
      text: '📧 Gmail Integration: Ready for configuration\nConnect your Gmail for financial email analysis'
    }]
  };
});

const transport = new StdioServerTransport();
server.connect(transport).then(() => console.error('Gmail MCP server running'));
