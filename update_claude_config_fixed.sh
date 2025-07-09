#!/bin/bash

# UPDATE CLAUDE CONFIG WITH FIXED WORKING SERVERS
echo "🔧 UPDATING CLAUDE CONFIG WITH FIXED WORKING SERVERS"
echo "===================================================="

CONFIG_FILE="$HOME/Library/Application Support/Claude/claude_desktop_config.json"

# Create backup
if [ -f "$CONFIG_FILE" ]; then
    BACKUP_FILE="$CONFIG_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$CONFIG_FILE" "$BACKUP_FILE"
    echo "💾 Created backup: $BACKUP_FILE"
fi

# Create updated config with fixed servers
python3 << 'PYTHON_EOF'
import json
import os

config_file = os.path.expanduser('~/Library/Application Support/Claude/claude_desktop_config.json')

# Read existing config or create new one
if os.path.exists(config_file):
    with open(config_file, 'r') as f:
        config = json.load(f)
    print("✅ Found existing config")
else:
    config = {}
    print("✅ Creating new config")

# Ensure mcpServers exists
if 'mcpServers' not in config:
    config['mcpServers'] = {}

# Add/update LIF3 servers with fixed versions
config['mcpServers']['lif3-financial'] = {
    "command": "node",
    "args": [
        "/Users/ccladysmith/Desktop/dev/l1f3/lif3-integrations/financial-server.js"
    ],
    "env": {
        "CURRENT_NET_WORTH": "239625",
        "TARGET_NET_WORTH": "1800000",
        "CURRENCY": "ZAR",
        "TIMEZONE": "Africa/Johannesburg"
    }
}

config['mcpServers']['43v3r-business'] = {
    "command": "node",
    "args": [
        "/Users/ccladysmith/Desktop/dev/l1f3/lif3-integrations/business-server.js"
    ],
    "env": {
        "DAILY_REVENUE_TARGET": "4881",
        "MRR_TARGET": "147917",
        "BUSINESS_NAME": "43V3R",
        "BUSINESS_SECTORS": "AI_WEB3_CRYPTO_QUANTUM"
    }
}

config['mcpServers']['lif3-test'] = {
    "command": "node",
    "args": [
        "/Users/ccladysmith/Desktop/dev/l1f3/lif3-integrations/test-server.js"
    ],
    "env": {
        "TEST_MODE": "true"
    }
}

# Write updated config
with open(config_file, 'w') as f:
    json.dump(config, f, indent=2)

print("✅ Updated Claude Desktop config with fixed servers")
print("📊 Added: lif3-financial, 43v3r-business, lif3-test")
PYTHON_EOF

# Verify config is valid
if python3 -c "import json; json.load(open('$CONFIG_FILE'))" 2>/dev/null; then
    echo "✅ Configuration JSON is valid"
else
    echo "❌ Configuration JSON is invalid"
    exit 1
fi

echo ""
echo "🎉 CLAUDE CONFIG UPDATED WITH FIXED SERVERS!"
echo "============================================"
echo ""
echo "✅ UPDATED SERVERS:"
echo "   💰 lif3-financial - Working net worth tracking"
echo "   🏢 43v3r-business - Working business metrics"
echo "   🧪 lif3-test - Connection testing"
echo ""
echo "📁 Config Location: $CONFIG_FILE"
echo ""
echo "🔄 NEXT STEPS:"
echo "   1. Restart Claude Desktop (Cmd+Q, then reopen)"
echo "   2. Test connection: 'Test MCP connection'"
echo "   3. Test financial: 'What is my net worth progress?'"
echo "   4. Test business: 'Show me 43V3R business metrics'"
echo ""
echo "🧪 TROUBLESHOOTING COMMANDS:"
echo "   • 'Test MCP connection' - Verify servers are working"
echo "   • 'What is my net worth progress?' - Test financial server"
echo "   • 'Show me 43V3R business metrics' - Test business server"
echo "   • 'Log a transaction: R500 for groceries' - Test transaction logging"
echo ""
echo "🎯 READY FOR FINANCIAL TRACKING:"
echo "   • Current: R239,625 → Target: R1,800,000"
echo "   • 43V3R: R0 → R4,881 daily revenue"
echo "   • All servers now use proper MCP protocol"
echo "============================================"