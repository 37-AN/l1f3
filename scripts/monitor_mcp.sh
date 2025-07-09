#!/bin/bash

echo "📊 MCP CONNECTION MONITOR"
echo "========================="

# Check if Claude Desktop is running
if pgrep -f "Claude" > /dev/null; then
    echo "✅ Claude Desktop is running"
else
    echo "❌ Claude Desktop is not running"
fi

# Check MCP config exists
if [ -f ~/Library/Application\ Support/Claude/claude_desktop_config.json ]; then
    echo "✅ MCP configuration exists"
    echo "   Location: ~/Library/Application Support/Claude/claude_desktop_config.json"
else
    echo "❌ MCP configuration missing"
fi

# Check database
if [ -f /Users/ccladysmith/Desktop/dev/l1f3/data/lif3_financial.db ]; then
    echo "✅ Database file exists"
    result=$(sqlite3 /Users/ccladysmith/Desktop/dev/l1f3/data/lif3_financial.db "SELECT COUNT(*) FROM accounts;")
    echo "   Database has $result accounts"
else
    echo "❌ Database file missing"
fi

# Check Python MCP server
if python3 -c "import mcp.server" 2>/dev/null; then
    echo "✅ Python MCP server ready"
else
    echo "❌ Python MCP server not available"
fi

# Check filesystem MCP server
if npx @modelcontextprotocol/server-filesystem --help > /dev/null 2>&1; then
    echo "✅ Filesystem MCP server available"
else
    echo "❌ Filesystem MCP server missing"
fi

echo ""
echo "🧪 Test Commands:"
echo "1. 'What is my current net worth progress?'"
echo "2. 'Show me the contents of LIF3_STATUS.md'"
echo "3. 'Query the database for all my goals'"
echo "4. 'Calculate my required savings rate'"
echo "5. 'Show me 43V3R business metrics'"
echo ""
echo "📋 Configuration Summary:"
echo "• Claude config: ~/Library/Application Support/Claude/claude_desktop_config.json"
echo "• Database: /Users/ccladysmith/Desktop/dev/l1f3/data/lif3_financial.db"
echo "• Python server: /Users/ccladysmith/Desktop/dev/l1f3/scripts/lif3_mcp_server.py"
echo "• Project root: /Users/ccladysmith/Desktop/dev/l1f3"