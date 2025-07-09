#!/bin/bash

# ADD LIF3 INTEGRATIONS TO EXISTING WORKING CLAUDE CONFIG
# This script safely adds LIF3 integrations to your current working configuration

echo "🔧 ADDING LIF3 INTEGRATIONS TO WORKING CLAUDE CONFIG"
echo "===================================================="
echo "💰 Financial Goal: R239,625 → R1,800,000"
echo "🏢 43V3R Business: R0 → R4,881 daily revenue"
echo "📊 All LIF3 integrations ready to add"
echo "===================================================="

# Configuration file path
CONFIG_FILE="$HOME/Library/Application Support/Claude/claude_desktop_config.json"

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Claude Desktop config file not found at: $CONFIG_FILE"
    echo "Please check your Claude Desktop installation"
    exit 1
fi

echo "✅ Found existing Claude Desktop config"

# Create backup
BACKUP_FILE="$CONFIG_FILE.backup.$(date +%Y%m%d_%H%M%S)"
cp "$CONFIG_FILE" "$BACKUP_FILE"
echo "💾 Created backup: $BACKUP_FILE"

# Create temporary file with LIF3 integrations
cat > /tmp/lif3_integrations.json << 'EOF'
{
  "lif3-financial": {
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
  "43v3r-business": {
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
  "lif3-gmail": {
    "command": "node",
    "args": [
      "/Users/ccladysmith/Desktop/dev/l1f3/lif3-integrations/gmail-server.js"
    ],
    "env": {
      "GMAIL_INTEGRATION": "ready"
    }
  },
  "lif3-calendar": {
    "command": "node",
    "args": [
      "/Users/ccladysmith/Desktop/dev/l1f3/lif3-integrations/calendar-server.js"
    ],
    "env": {
      "CALENDAR_INTEGRATION": "ready"
    }
  },
  "lif3-imessage": {
    "command": "node",
    "args": [
      "/Users/ccladysmith/Desktop/dev/l1f3/lif3-integrations/imessage-server.js"
    ],
    "env": {
      "IMESSAGE_INTEGRATION": "ready"
    }
  },
  "lif3-chrome": {
    "command": "node",
    "args": [
      "/Users/ccladysmith/Desktop/dev/l1f3/lif3-integrations/chrome-server.js"
    ],
    "env": {
      "CHROME_INTEGRATION": "ready"
    }
  },
  "lif3-analysis": {
    "command": "node",
    "args": [
      "/Users/ccladysmith/Desktop/dev/l1f3/lif3-integrations/analysis-server.js"
    ],
    "env": {
      "ANALYSIS_MODE": "financial",
      "REPL_ENABLED": "true"
    }
  }
}
EOF

# Python script to merge configurations
python3 << 'PYTHON_EOF'
import json
import sys

try:
    # Read existing config
    with open('/Users/ccladysmith/Library/Application Support/Claude/claude_desktop_config.json', 'r') as f:
        existing_config = json.load(f)
    
    # Read LIF3 integrations
    with open('/tmp/lif3_integrations.json', 'r') as f:
        lif3_integrations = json.load(f)
    
    # Ensure mcpServers exists
    if 'mcpServers' not in existing_config:
        existing_config['mcpServers'] = {}
    
    # Add LIF3 integrations to existing config
    for server_name, server_config in lif3_integrations.items():
        existing_config['mcpServers'][server_name] = server_config
        print(f"✅ Added {server_name} to configuration")
    
    # Write updated config
    with open('/Users/ccladysmith/Library/Application Support/Claude/claude_desktop_config.json', 'w') as f:
        json.dump(existing_config, f, indent=2)
    
    print("✅ Successfully merged LIF3 integrations with existing config")
    
except Exception as e:
    print(f"❌ Error merging configurations: {e}")
    sys.exit(1)
PYTHON_EOF

# Verify the configuration is valid JSON
if python3 -c "import json; json.load(open('$CONFIG_FILE'))" 2>/dev/null; then
    echo "✅ Configuration JSON is valid"
else
    echo "❌ Configuration JSON is invalid - restoring backup"
    cp "$BACKUP_FILE" "$CONFIG_FILE"
    exit 1
fi

# Clean up temporary file
rm -f /tmp/lif3_integrations.json

# Display summary
echo ""
echo "🎉 LIF3 INTEGRATIONS ADDED TO WORKING CONFIG!"
echo "============================================="
echo ""
echo "✅ ADDED INTEGRATIONS:"
echo "   💰 lif3-financial - Net worth tracking (R239,625 → R1,800,000)"
echo "   🏢 43v3r-business - Business metrics (R0 → R4,881 daily revenue)"
echo "   📧 lif3-gmail - Gmail integration (ready for configuration)"
echo "   📅 lif3-calendar - Calendar integration (ready for configuration)"
echo "   💬 lif3-imessage - iMessage integration (ready for configuration)"
echo "   🌐 lif3-chrome - Chrome integration (ready for configuration)"
echo "   📊 lif3-analysis - Analysis tools (financial mode enabled)"
echo ""
echo "📁 CONFIGURATION LOCATION:"
echo "   $CONFIG_FILE"
echo ""
echo "💾 BACKUP CREATED:"
echo "   $BACKUP_FILE"
echo ""
echo "🔄 NEXT STEPS:"
echo "   1. Restart Claude Desktop (Cmd+Q, then reopen)"
echo "   2. Test LIF3 integrations:"
echo "      • 'What is my current net worth progress?'"
echo "      • 'Show me 43V3R business metrics'"
echo "      • 'Log a transaction: R500 for groceries'"
echo "      • 'Calculate my required savings rate'"
echo ""
echo "🎯 FINANCIAL TARGETS NOW ACTIVE:"
echo "   • Current: R239,625 (13.3% of R1,800,000 goal)"
echo "   • 43V3R Daily Revenue: R0 → R4,881 target"
echo "   • 43V3R MRR: R0 → R147,917 target"
echo "   • Timeline: 18 months to achieve goals"
echo ""
echo "============================================="
echo "✅ LIF3 SYSTEM READY FOR WEALTH BUILDING!"
echo "============================================="