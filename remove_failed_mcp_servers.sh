#!/bin/bash

# FIX FAILED MCP SERVERS IN CLAUDE DESKTOP
# Remove broken stub servers and keep only working ones

echo "🔧 FIXING FAILED MCP SERVERS"
echo "============================="
echo "✅ Working: filesystem, lif3-financial, 43v3r-business, lif3-test"
echo "❌ Failed: lif3-gmail, lif3-imessage, lif3-analysis"
echo "============================="

CONFIG_FILE="$HOME/Library/Application Support/Claude/claude_desktop_config.json"

# Create backup
if [ -f "$CONFIG_FILE" ]; then
    BACKUP_FILE="$CONFIG_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$CONFIG_FILE" "$BACKUP_FILE"
    echo "💾 Created backup: $BACKUP_FILE"
fi

# Create clean config with only working servers
echo "🧹 Creating clean config with only working servers..."

python3 << 'PYTHON_EOF'
import json
import os

config_file = os.path.expanduser('~/Library/Application Support/Claude/claude_desktop_config.json')

# Read existing config
if os.path.exists(config_file):
    with open(config_file, 'r') as f:
        config = json.load(f)
else:
    config = {}

# Ensure mcpServers exists
if 'mcpServers' not in config:
    config['mcpServers'] = {}

# Remove failed servers and keep only working ones
working_servers = {
    'filesystem': {
        "command": "npx",
        "args": [
            "@modelcontextprotocol/server-filesystem",
            "/Users/ccladysmith/Desktop/dev/l1f3"
        ]
    },
    'lif3-financial': {
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
    },
    '43v3r-business': {
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
    },
    'lif3-test': {
        "command": "node",
        "args": [
            "/Users/ccladysmith/Desktop/dev/l1f3/lif3-integrations/test-server.js"
        ],
        "env": {
            "TEST_MODE": "true"
        }
    }
}

# Replace mcpServers with only working ones
config['mcpServers'] = working_servers

# Write clean config
with open(config_file, 'w') as f:
    json.dump(config, f, indent=2)

print("✅ Removed failed servers: lif3-gmail, lif3-imessage, lif3-analysis")
print("✅ Kept working servers: filesystem, lif3-financial, 43v3r-business, lif3-test")
PYTHON_EOF

# Verify config is valid
if python3 -c "import json; json.load(open('$CONFIG_FILE'))" 2>/dev/null; then
    echo "✅ Configuration JSON is valid"
else
    echo "❌ Configuration JSON is invalid - restoring backup"
    cp "$BACKUP_FILE" "$CONFIG_FILE"
    exit 1
fi

echo ""
echo "🎉 MCP SERVERS FIXED!"
echo "===================="
echo ""
echo "✅ WORKING SERVERS:"
echo "   🗂️ filesystem - File system access to LIF3 project"
echo "   💰 lif3-financial - Net worth tracking (R239,625 → R1,800,000)"
echo "   🏢 43v3r-business - Business metrics (R0 → R4,881 daily revenue)"
echo "   🧪 lif3-test - Connection testing and verification"
echo ""
echo "❌ REMOVED FAILED SERVERS:"
echo "   📧 lif3-gmail (stub implementation - not functional)"
echo "   💬 lif3-imessage (stub implementation - not functional)"
echo "   📊 lif3-analysis (stub implementation - not functional)"
echo ""
echo "🔄 NEXT STEPS:"
echo "   1. Restart Claude Desktop (Cmd+Q, then reopen)"
echo "   2. Check Developer settings - should show no red triangles"
echo "   3. Test working integrations:"
echo ""
echo "🧪 TEST COMMANDS:"
echo "   • 'Test MCP connection' - Verify test server"
echo "   • 'What is my net worth progress?' - Financial tracking"
echo "   • 'Show me 43V3R business metrics' - Business dashboard"
echo "   • 'List files in the current directory' - Filesystem access"
echo "   • 'Log a transaction: R500 for groceries' - Transaction logging"
echo ""
echo "💡 OPTIONAL: Add Working Integrations Later"
echo "   If you need Gmail/iMessage/Analysis later, I can create"
echo "   proper working implementations instead of stub files."
echo ""
echo "🎯 CORE LIF3 FUNCTIONALITY READY:"
echo "   • Financial tracking toward R1,800,000 goal"
echo "   • 43V3R business metrics for R4,881 daily revenue"
echo "   • File system access for project management"
echo "   • Connection testing for troubleshooting"
echo "===================="