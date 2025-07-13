#!/bin/bash

# QUICK SLACK SETUP AND TEST
echo "🔧 LIF3 SLACK APP - QUICK SETUP"
echo "==============================="
echo ""

cd /Users/ccladysmith/Desktop/dev/l1f3/lif3-integrations

# Check if .env file exists and has Slack tokens
if [ ! -f ".env" ]; then
    echo "❌ .env file not found"
    echo "Creating .env template..."
    cat >> .env << 'EOF'

# SLACK CONFIGURATION
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here
SLACK_APP_TOKEN=xapp-your-app-token-here
EOF
    echo "✅ .env template created"
fi

# Check if tokens are configured
if grep -q "your-bot-token-here" .env 2>/dev/null; then
    echo "⚠️  Slack tokens not configured yet"
    echo ""
    echo "🔧 QUICK SETUP:"
    echo "1. Use the app manifest from Claude to create your Slack app"
    echo "2. Get your 3 tokens from Slack app settings"
    echo "3. Update the .env file with real tokens"
    echo "4. Run: node slack-app-fixed.js"
    echo ""
    echo "📋 Required tokens:"
    echo "• SLACK_BOT_TOKEN=xoxb-... (from OAuth & Permissions)"
    echo "• SLACK_SIGNING_SECRET=... (from Basic Information)"
    echo "• SLACK_APP_TOKEN=xapp-... (from Basic Information > App-Level Tokens)"
    echo ""
else
    echo "✅ Slack tokens appear to be configured"
    echo ""
    echo "🚀 Starting Slack app..."
    node slack-app-fixed.js
fi