#!/bin/bash

echo "🚀 Installing Discord and Slack dependencies..."
cd /Users/ccladysmith/Desktop/dev/l1f3/lif3-integrations

# Install the new dependencies
npm install @slack/bolt discord.js dotenv

echo "✅ Dependencies installed!"

# Run the integration setup
node setup-integrations.js

echo "🎯 Setup complete! Now restart Claude Desktop to pick up the new MCP servers."
