#!/bin/bash

# FIX MCP SERVERS - CORRECT PATHS FOR LIF3 SYSTEM
# The issue: MCP paths point to 'lif3' but files are in 'l1f3'

echo "🔧 FIXING MCP SERVER PATHS FOR LIF3 SYSTEM"
echo "==========================================="
echo ""

# Kill any existing Claude Desktop processes
echo "🛑 Stopping Claude Desktop processes..."
pkill -f "Claude" 2>/dev/null
sleep 2

# Find the correct Claude Desktop config location
CONFIG_DIR=""
if [ -d "$HOME/Library/Application Support/Claude" ]; then
    CONFIG_DIR="$HOME/Library/Application Support/Claude"
elif [ -d "$HOME/.config/claude-desktop" ]; then
    CONFIG_DIR="$HOME/.config/claude-desktop"
else
    echo "Creating config directory..."
    mkdir -p "$HOME/Library/Application Support/Claude"
    CONFIG_DIR="$HOME/Library/Application Support/Claude"
fi

echo "📍 Using config directory: $CONFIG_DIR"

# Backup existing config
if [ -f "$CONFIG_DIR/claude_desktop_config.json" ]; then
    echo "💾 Backing up existing config..."
    cp "$CONFIG_DIR/claude_desktop_config.json" "$CONFIG_DIR/claude_desktop_config.json.backup"
fi

# Verify that the lif3-integrations directory exists with correct path
INTEGRATIONS_DIR="/Users/ccladysmith/Desktop/dev/l1f3/lif3-integrations"

if [ ! -d "$INTEGRATIONS_DIR" ]; then
    echo "❌ Integration directory not found at: $INTEGRATIONS_DIR"
    exit 1
fi

echo "✅ Found integrations directory: $INTEGRATIONS_DIR"

# Check that required MCP server files exist
REQUIRED_FILES=(
    "gmail-server.js"
    "calendar-server.js" 
    "imessage-server.js"
    "chrome-server.js"
    "analysis-server.js"
    "financial-server.js"
    "business-server.js"
    "test-server.js"
)

echo "🔍 Checking MCP server files..."
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$INTEGRATIONS_DIR/$file" ]; then
        echo "✅ Found: $file"
    else
        echo "⚠️  Missing: $file"
    fi
done

# Install Node.js dependencies for MCP servers
echo ""
echo "📦 Installing Node.js dependencies..."
cd "$INTEGRATIONS_DIR"
if [ -f "package.json" ]; then
    npm install
    echo "✅ Dependencies installed"
else
    echo "⚠️  No package.json found in integrations directory"
fi

# Create the correct Claude Desktop configuration with FIXED PATHS
echo ""
echo "📝 Creating corrected Claude Desktop configuration..."

cat > "$CONFIG_DIR/claude_desktop_config.json" << EOF
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

echo "✅ Configuration file created with corrected paths"

# Set correct permissions
chmod 644 "$CONFIG_DIR/claude_desktop_config.json"

# Make all MCP server files executable
echo ""
echo "🔧 Setting file permissions..."
chmod +x "$INTEGRATIONS_DIR"/*.js

# Test that Node.js can find the MCP SDK
echo ""
echo "🧪 Testing MCP SDK availability..."
cd "$INTEGRATIONS_DIR"
if node -e "require('@modelcontextprotocol/sdk/server/index.js'); console.log('✅ MCP SDK available')" 2>/dev/null; then
    echo "✅ MCP SDK is properly installed"
else
    echo "⚠️  MCP SDK may need installation"
    echo "   Run: npm install @modelcontextprotocol/sdk"
fi

# Test one of the MCP servers directly
echo ""
echo "🧪 Testing Gmail MCP server..."
timeout 3s node "$INTEGRATIONS_DIR/gmail-server.js" 2>/dev/null && echo "✅ Gmail server can start" || echo "⚠️  Gmail server may have issues"

# Create a test file for verification
echo ""
echo "📄 Creating test file for verification..."
cat > "/Users/ccladysmith/Desktop/dev/l1f3/MCP_CONNECTION_TEST.md" << 'TESTEOF'
# MCP CONNECTION TEST

## System Status
- **Directory:** /Users/ccladysmith/Desktop/dev/l1f3
- **MCP Servers:** All paths corrected to use l1f3 (not lif3)
- **Configuration:** ~/Library/Application Support/Claude/claude_desktop_config.json

## Available MCP Servers
1. **filesystem** - File system access to entire l1f3 directory
2. **lif3-financial** - Financial data tracking and management
3. **43v3r-business** - Business metrics for 43V3R companies
4. **lif3-gmail** - Gmail integration for financial emails
5. **lif3-calendar** - Calendar integration for scheduling
6. **lif3-imessage** - iMessage integration 
7. **lif3-chrome** - Chrome browsing data
8. **lif3-analysis** - Data analysis and insights
9. **lif3-test** - Testing and validation

## Financial Goals
- **Current Net Worth:** -R7,000 (debt)
- **Target:** R500,000 by Dec 31, 2025
- **43V3R Tech:** R0 → R100,000 MRR
- **43V3R Brand:** Futuristic clothing line

## Test Commands
Ask Claude:
- "Read this MCP_CONNECTION_TEST.md file"
- "What files are in my l1f3 directory?"
- "Check my financial status"
- "Show me my business metrics"

**Generated:** $(date)
**Status:** Ready for testing
TESTEOF

echo "✅ Test file created"

# Display configuration summary
echo ""
echo "📊 CONFIGURATION SUMMARY"
echo "========================"
echo "Config Location: $CONFIG_DIR/claude_desktop_config.json"
echo "Base Directory: /Users/ccladysmith/Desktop/dev/l1f3"
echo "MCP Servers: 9 servers configured"
echo ""
echo "✅ CORRECTED PATHS:"
echo "   All server paths now use 'l1f3' instead of 'lif3'"
echo ""
echo "🚀 NEXT STEPS:"
echo "   1. Quit Claude Desktop completely (Cmd+Q)"
echo "   2. Wait 5 seconds"
echo "   3. Restart Claude Desktop"
echo "   4. Look for MCP server connection indicators"
echo ""
echo "🧪 TEST COMMANDS:"
echo '   "Read the MCP_CONNECTION_TEST.md file"'
echo '   "List all files in my l1f3 directory"'
echo '   "What MCP servers are available?"'
echo ""
echo "✅ IF WORKING:"
echo "   All servers should show as connected (no red 'failed' status)"
echo "   You should be able to access files and run commands"
echo ""
echo "❌ IF STILL FAILING:"
echo "   1. Check Node.js version: node --version"
echo "   2. Install MCP SDK: npm install -g @modelcontextprotocol/sdk"
echo "   3. Check file permissions in integrations directory"
echo ""
echo "🎯 Ready to track your R500K journey with proper MCP!"

# Show the actual config for verification
echo ""
echo "📄 CURRENT CONFIGURATION:"
echo "=========================="
cat "$CONFIG_DIR/claude_desktop_config.json"
echo ""
echo "🎉 MCP FIX COMPLETE!"
