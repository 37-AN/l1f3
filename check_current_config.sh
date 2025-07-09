#!/bin/bash

# CHECK CURRENT WORKING CLAUDE CONFIG AND SHOW WHAT TO ADD
echo "🔍 CHECKING CURRENT WORKING CLAUDE CONFIG"
echo "=========================================="

CONFIG_FILE="$HOME/Library/Application Support/Claude/claude_desktop_config.json"

if [ -f "$CONFIG_FILE" ]; then
    echo "✅ Claude Desktop config found"
    
    # Check if it's valid JSON
    if python3 -c "import json; json.load(open('$CONFIG_FILE'))" 2>/dev/null; then
        echo "✅ Configuration is valid JSON"
        
        # Show current MCP servers
        echo ""
        echo "📊 CURRENT MCP SERVERS:"
        python3 << 'PYTHON_EOF'
import json
with open('/Users/ccladysmith/Library/Application Support/Claude/claude_desktop_config.json', 'r') as f:
    config = json.load(f)

if 'mcpServers' in config:
    for server_name in config['mcpServers'].keys():
        print(f"   ✅ {server_name}")
else:
    print("   ❌ No mcpServers section found")
PYTHON_EOF
        
        # Check for LIF3 integrations
        echo ""
        echo "🔍 CHECKING FOR LIF3 INTEGRATIONS:"
        
        lif3_servers=("lif3-financial" "43v3r-business" "lif3-gmail" "lif3-calendar" "lif3-imessage" "lif3-chrome" "lif3-analysis")
        
        for server in "${lif3_servers[@]}"; do
            if python3 -c "import json; config = json.load(open('$CONFIG_FILE')); print('found' if 'mcpServers' in config and '$server' in config['mcpServers'] else 'not_found')" 2>/dev/null | grep -q "found"; then
                echo "   ✅ $server - Already configured"
            else
                echo "   ❌ $server - Missing"
            fi
        done
        
    else
        echo "❌ Configuration JSON is invalid"
    fi
else
    echo "❌ Claude Desktop config not found"
    echo "   Expected location: $CONFIG_FILE"
fi

echo ""
echo "🚀 TO ADD MISSING LIF3 INTEGRATIONS:"
echo "   Run: chmod +x add_lif3_to_working_config.sh && ./add_lif3_to_working_config.sh"
echo ""
echo "💡 MANUAL ADDITION GUIDE:"
echo "   1. Open: $CONFIG_FILE"
echo "   2. Add the servers from claude_config_addition.json"
echo "   3. Restart Claude Desktop"
echo ""
echo "🧪 TEST COMMANDS AFTER ADDING:"
echo "   • 'What is my current net worth progress?'"
echo "   • 'Show me 43V3R business metrics'"
echo "   • 'Log a transaction: R500 for groceries'"