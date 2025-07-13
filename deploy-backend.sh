#!/bin/bash
# Railway Backend Deployment Script for LIF3

set -e

echo "🚀 Deploying LIF3 Backend to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Login to Railway (if not already logged in)
echo "🔐 Logging into Railway..."
railway login --browserless

# Create new project or link existing
echo "🔗 Setting up Railway project..."
if [ ! -f ".railway" ]; then
    railway init
else
    echo "✅ Railway project already configured"
fi

# Set environment variables
echo "⚙️ Setting up environment variables..."
echo "Please set these environment variables in Railway dashboard:"
echo ""
echo "Required Environment Variables:"
echo "- DATABASE_URL (PostgreSQL)"
echo "- REDIS_URL (Redis)"
echo "- JWT_SECRET"
echo "- CLAUDE_API_KEY"
echo "- GOOGLE_CLIENT_ID"
echo "- GOOGLE_CLIENT_SECRET"
echo "- DISCORD_BOT_TOKEN"
echo "- DISCORD_WEBHOOK_URL"
echo "- FRONTEND_URL"
echo ""
echo "Copy them from backend/.env.production"

# Deploy
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Backend deployment complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Add PostgreSQL plugin in Railway dashboard"
echo "2. Add Redis plugin in Railway dashboard"  
echo "3. Set environment variables in Railway dashboard"
echo "4. Update FRONTEND_URL with your actual Vercel URL"
echo "5. Your backend will be live at: https://your-app.railway.app"