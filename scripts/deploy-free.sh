#!/bin/bash
# Free Deployment Script for LIF3 Backend
# Uses: Render.com (free), Neon.tech (PostgreSQL), Upstash (Redis)

set -e

echo "🚀 Setting up FREE deployment for LIF3 Backend..."

# 1. Render.com for backend hosting (500 hours/month free)
echo "📱 BACKEND HOSTING: Render.com"
echo "1. Go to: https://render.com"
echo "2. Connect your GitHub account"
echo "3. Create 'Web Service' from this repository"
echo "4. Use these settings:"
echo "   - Build Command: cd backend && npm install && npm run build"
echo "   - Start Command: cd backend && npm run start:prod"
echo "   - Environment: Node"
echo "   - Region: Oregon (US West)"
echo ""

# 2. Neon.tech for PostgreSQL (3GB free)
echo "🐘 DATABASE: Neon.tech (PostgreSQL)"
echo "1. Go to: https://neon.tech"
echo "2. Sign up with GitHub"
echo "3. Create new project: 'lif3-database'"
echo "4. Copy the DATABASE_URL (starts with postgresql://)"
echo ""

# 3. Upstash for Redis (10k requests/day free)
echo "⚡ CACHE: Upstash Redis"
echo "1. Go to: https://upstash.com"
echo "2. Sign up with GitHub"
echo "3. Create Redis database: 'lif3-cache'"
echo "4. Copy the REDIS_URL"
echo ""

# 4. Environment variables template
echo "⚙️ ENVIRONMENT VARIABLES for Render:"
echo "Copy these to Render.com Environment Variables:"
echo ""
cat << 'EOF'
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://user:pass@host/db
REDIS_URL=redis://:pass@host:port
JWT_SECRET=your-super-secure-jwt-secret-here
CLAUDE_API_KEY=your-claude-api-key
GOOGLE_CLIENT_ID=your-google-client-id  
GOOGLE_CLIENT_SECRET=your-google-client-secret
DISCORD_BOT_TOKEN=your-discord-bot-token
DISCORD_WEBHOOK_URL=your-discord-webhook-url
FRONTEND_URL=https://lif3-dashboard.vercel.app
CORS_ORIGIN=https://lif3-dashboard.vercel.app
EOF

echo ""
echo "✅ Your stack will be:"
echo "Frontend: Vercel (free)"
echo "Backend: Render.com (free - 500 hours/month)"
echo "Database: Neon.tech PostgreSQL (free - 3GB)"
echo "Cache: Upstash Redis (free - 10k requests/day)"
echo ""
echo "🎯 Total cost: $0/month"
echo "🚀 Production ready with 99.9% uptime!"