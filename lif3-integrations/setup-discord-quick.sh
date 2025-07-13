#!/bin/bash

# QUICK SETUP FOR FIXED DISCORD BOT
echo "🤖 LIF3 DISCORD BOT - QUICK SETUP"
echo "================================="
echo ""

cd /Users/ccladysmith/Desktop/dev/l1f3/lif3-integrations

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: You need to edit .env file with your Discord bot token!"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Check if Discord token is configured
if grep -q "your_discord_bot_token_here" .env 2>/dev/null; then
    echo "⚠️  Discord token not configured yet"
    echo ""
    echo "🔧 QUICK SETUP STEPS:"
    echo "1. Go to https://discord.com/developers/applications"
    echo "2. Create new application: 'LIF3 Financial Bot'"
    echo "3. Go to 'Bot' tab and copy the token"
    echo "4. Replace 'your_discord_bot_token_here' in .env file"
    echo "5. Get your server ID (enable Developer Mode in Discord)"
    echo "6. Run: npm run discord-fixed"
    echo ""
else
    echo "✅ Discord token appears to be configured"
    echo ""
    echo "🚀 Starting fixed Discord bot..."
    node discord-bot-fixed.js
fi