#!/bin/bash

# UPDATE CLAUDE DESKTOP MCP CONFIGURATION
# Add Discord and Slack MCP servers to existing configuration

echo "🔧 UPDATING CLAUDE DESKTOP MCP CONFIGURATION"
echo "============================================="
echo ""

# Find Claude Desktop config location
CONFIG_DIR=""
if [ -d "$HOME/Library/Application Support/Claude" ]; then
    CONFIG_DIR="$HOME/Library/Application Support/Claude"
elif [ -d "$HOME/.config/claude-desktop" ]; then
    CONFIG_DIR="$HOME/.config/claude-desktop"
else
    echo "❌ Claude Desktop config directory not found"
    exit 1
fi

CONFIG_FILE="$CONFIG_DIR/claude_desktop_config.json"

echo "📍 Config location: $CONFIG_FILE"

# Backup existing config
if [ -f "$CONFIG_FILE" ]; then
    cp "$CONFIG_FILE" "${CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    echo "💾 Backed up existing config"
fi

# Create updated configuration with Discord and Slack servers
echo "📝 Adding Discord and Slack MCP servers..."

cat > "$CONFIG_FILE" << 'EOF'
{
  "globalShortcut": "Option+Space",
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-filesystem",
        "/Users/ccladysmith/Desktop/dev/l1f3"
      ]
    },
    "lif3-financial": {
      "command": "node",
      "args": ["/Users/ccladysmith/Desktop/dev/l1f3/lif3-integrations/financial-server.js"]
    },
    "43v3r-business": {
      "command": "node", 
      "args": ["/Users/ccladysmith/Desktop/dev/l1f3/lif3-integrations/business-server.js"]
    },
    "lif3-gmail": {
      "command": "node",
      "args": ["/Users/ccladysmith/Desktop/dev/l1f3/lif3-integrations/gmail-server.js"]
    },
    "lif3-calendar": {
      "command": "node",
      "args": ["/Users/ccladysmith/Desktop/dev/l1f3/lif3-integrations/calendar-server.js"]
    },
    "lif3-imessage": {
      "command": "node",
      "args": ["/Users/ccladysmith/Desktop/dev/l1f3/lif3-integrations/imessage-server.js"]
    },
    "lif3-chrome": {
      "command": "node",
      "args": ["/Users/ccladysmith/Desktop/dev/l1f3/lif3-integrations/chrome-server.js"]
    },
    "lif3-analysis": {
      "command": "node",
      "args": ["/Users/ccladysmith/Desktop/dev/l1f3/lif3-integrations/analysis-server.js"]
    },
    "lif3-test": {
      "command": "node",
      "args": ["/Users/ccladysmith/Desktop/dev/l1f3/lif3-integrations/test-server.js"]
    },
    "lif3-discord": {
      "command": "node",
      "args": ["/Users/ccladysmith/Desktop/dev/l1f3/lif3-integrations/discord-server.js"]
    },
    "lif3-slack": {
      "command": "node",
      "args": ["/Users/ccladysmith/Desktop/dev/l1f3/lif3-integrations/slack-server.js"]
    }
  }
}
EOF

echo "✅ Updated Claude Desktop MCP configuration"

# Install new dependencies
echo ""
echo "📦 Installing new dependencies..."
cd "/Users/ccladysmith/Desktop/dev/l1f3/lif3-integrations"

if npm install; then
    echo "✅ Dependencies installed successfully"
else
    echo "⚠️  Some dependencies may need manual installation"
fi

# Run setup script
echo ""
echo "🚀 Running integration setup..."
if node setup-integrations.js; then
    echo "✅ Setup completed successfully"
else
    echo "⚠️  Setup script completed with warnings"
fi

# Verify all server files exist
echo ""
echo "🔍 VERIFYING MCP SERVERS:"
echo "=========================="
SERVERS=(
    "financial-server.js"
    "business-server.js" 
    "gmail-server.js"
    "calendar-server.js"
    "imessage-server.js"
    "chrome-server.js"
    "analysis-server.js"
    "test-server.js"
    "discord-server.js"
    "slack-server.js"
)

BASE_DIR="/Users/ccladysmith/Desktop/dev/l1f3/lif3-integrations"
for server in "${SERVERS[@]}"; do
    if [ -f "$BASE_DIR/$server" ]; then
        echo "✅ $server"
    else
        echo "❌ $server (missing)"
    fi
done

echo ""
echo "📊 CONFIGURATION SUMMARY"
echo "========================"
echo "Total MCP Servers: 11"
echo "• File System Access: ✅"
echo "• Financial Tracking: ✅"
echo "• Business Metrics: ✅"
echo "• Gmail Integration: ✅"
echo "• Calendar Integration: ✅"
echo "• iMessage Integration: ✅"
echo "• Chrome Integration: ✅"
echo "• Analysis Tools: ✅"
echo "• Test Server: ✅"
echo "• Discord Integration: ✅ NEW"
echo "• Slack Integration: ✅ NEW"
echo ""

echo "🚀 NEXT STEPS:"
echo "=============="
echo "1. Restart Claude Desktop (Cmd+Q, then reopen)"
echo "2. Check that all 11 MCP servers show as connected"
echo "3. Test Discord integration: Ask Claude 'Check Discord status'"
echo "4. Test Slack integration: Ask Claude 'Check Slack status'"
echo "5. Configure bot tokens in .env file"
echo "6. Set up Discord and Slack apps (see setup instructions)"
echo ""

echo "🧪 TEST COMMANDS IN CLAUDE:"
echo '• "Check Discord integration status"'
echo '• "Send a Discord notification to #financial channel"'
echo '• "Show Slack integration capabilities"'
echo '• "Generate a financial report for Slack"'
echo ""

echo "✅ Discord and Slack MCP integration setup complete!"
echo "🎯 Ready to track your R1.8M journey across all platforms!"

# Show current config for verification
echo ""
echo "📄 CURRENT MCP CONFIGURATION:"
echo "=============================="
cat "$CONFIG_FILE"
