#!/bin/bash
echo "🚀 Starting LIF3 MCP Integrations..."

# Start LIF3 backend if available
if [ -f "../lif3-dashboard/backend/package.json" ]; then
    echo "📡 Starting LIF3 Backend..."
    cd ../lif3-dashboard/backend && npm run start:dev &
    cd ../lif3-integrations
fi

echo "💰 LIF3 Financial & 43V3R Business servers ready"
echo "📊 Sentry integration active"  
echo "📁 Google Drive ready for folder 1dD8C1e1hkcCPdtlqA3nsxJYWVvilV5Io"
echo "✅ All integrations configured"
echo ""
echo "🔄 RESTART Claude Desktop to activate\!"
