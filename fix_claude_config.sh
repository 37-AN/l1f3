#!/bin/bash

# IMMEDIATE FIX FOR CLAUDE DESKTOP MCP CONFIGURATION
# Fix the lif3 vs l1f3 path issue

echo "🔧 FIXING CLAUDE DESKTOP MCP PATHS"
echo "=================================="

# Find Claude Desktop config location
CONFIG_LOCATIONS=(
    "$HOME/Library/Application Support/Claude/claude_desktop_config.json"
    "$HOME/.config/claude-desktop/claude_desktop_config.json"
)

CONFIG_FILE=""
for location in "${CONFIG_LOCATIONS[@]}"; do
    if [ -f "$location" ]; then
        CONFIG_FILE="$location"
        echo "✅ Found config at: $CONFIG_FILE"
        break
    fi
done

if [ -z "$CONFIG_FILE" ]; then
    echo "❌ Claude Desktop config not found, creating new one..."
    mkdir -p "$HOME/Library/Application Support/Claude"
    CONFIG_FILE="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
fi

# Backup existing config
if [ -f "$CONFIG_FILE" ]; then
    cp "$CONFIG_FILE" "${CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    echo "💾 Backed up existing config"
fi

# Create the CORRECTED configuration with proper l1f3 paths
echo "📝 Writing corrected configuration..."

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
    }
  }
}
EOF

echo "✅ Configuration updated with correct l1f3 paths"

# Verify the file was created correctly
if [ -f "$CONFIG_FILE" ]; then
    echo "✅ Config file exists"
    
    # Check if it contains the correct paths
    if grep -q "l1f3" "$CONFIG_FILE"; then
        echo "✅ Contains correct l1f3 paths"
    else
        echo "❌ Still contains incorrect paths"
    fi
else
    echo "❌ Config file creation failed"
fi

# Show the current configuration
echo ""
echo "📄 CURRENT CONFIGURATION:"
echo "========================="
cat "$CONFIG_FILE"

echo ""
echo "🎯 NEXT STEPS:"
echo "============="
echo "1. Quit Claude Desktop completely (Cmd+Q)"
echo "2. Wait 3 seconds"
echo "3. Open Claude Desktop again" 
echo "4. Check MCP servers - should all show as connected"
echo ""
echo "🧪 TEST COMMAND:"
echo "Ask Claude: 'Test the MCP connection'"
echo ""
echo "✅ All paths now use correct 'l1f3' directory!"

# Verify all server files exist
echo ""
echo "🔍 VERIFYING SERVER FILES:"
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
echo "🎉 MCP CONFIGURATION FIX COMPLETE!"
