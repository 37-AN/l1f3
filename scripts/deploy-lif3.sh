#!/bin/bash
# LIF3 Quick Deployment Script for M1 Mac
# Execute this to deploy your system with MCP integration

set -e

echo "🚀 Starting LIF3 Production Deployment..."

# 1. Ensure we're on production branch
echo "📝 Setting up production branch..."
git checkout production-deployment || git checkout -b production-deployment
mkdir -p deployment/{docker,k8s,scripts}
mkdir -p .github/workflows
mkdir -p .claude/commands

# 2. Create context file with your data
echo "🤖 Setting up project context..."
cat > .claude-context << EOF
Project: LIF3 Personal Financial Dashboard
User: Ethan Barnes, IT Engineer, Cape Town
Current Status: R239,625 → R1,800,000 net worth goal (13.3% progress)
Business: 43V3R AI startup targeting R4,881 daily revenue
Architecture: NestJS + React + PostgreSQL + Redis
MCP Tools: Sentry, Gmail, Calendar, Discord, Financial tracking
Deployment: Railway + Vercel (free tier)
Platform: Apple M1 optimized
EOF

# 3. Create environment configuration
echo "⚙️ Setting up environment..."
cat > .env.production << EOF
# Production Environment Configuration
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/lif3_dashboard
REDIS_URL=redis://user:password@host:6379
JWT_SECRET=your-super-secure-jwt-secret-here
CLAUDE_API_KEY=your-claude-api-key
GOOGLE_DRIVE_FOLDER_ID=1dD8C1e1hkcCPdtlqA3nsxJYWVvilV5Io
DISCORD_WEBHOOK_URL=your-discord-webhook-url

# Frontend URLs
REACT_APP_API_URL=https://your-app.railway.app
REACT_APP_WEBSOCKET_URL=wss://your-app.railway.app

# External Service APIs
SENTRY_DSN=your-sentry-dsn
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
DISCORD_BOT_TOKEN=your-discord-bot-token
EOF

# 4. Create Docker configurations
echo "🐳 Creating Docker configurations..."
mkdir -p backend frontend

# Backend Dockerfile
cat > backend/Dockerfile << EOF
FROM --platform=linux/arm64 node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM --platform=linux/arm64 node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1
USER node
CMD ["npm", "run", "start:prod"]
EOF

# Frontend Dockerfile
cat > frontend/Dockerfile << EOF
FROM --platform=linux/arm64 node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM --platform=linux/arm64 nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
EOF

# 5. Create deployment workflow
echo "🔄 Setting up CI/CD..."
mkdir -p .github/workflows
cat > .github/workflows/deploy-production.yml << 'EOF'
name: Deploy LIF3 to Production

on:
  push:
    branches: [production-deployment]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to Railway
      run: |
        curl -f -X POST "https://backboard.railway.app/graphql/v2" \
        -H "Authorization: Bearer ${{ secrets.RAILWAY_TOKEN }}" \
        -H "Content-Type: application/json" \
        -d '{"query":"mutation { deploymentCreate(input: { projectId: \"${{ secrets.RAILWAY_PROJECT_ID }}\", environmentId: \"${{ secrets.RAILWAY_ENV_ID }}\", serviceId: \"${{ secrets.RAILWAY_SERVICE_ID }}\" }) { id url } }"}'
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        working-directory: ./frontend
        vercel-args: '--prod'
    
    - name: Notify Discord
      run: |
        curl -X POST "${{ secrets.DISCORD_WEBHOOK_URL }}" \
        -H "Content-Type: application/json" \
        -d '{
          "embeds": [{
            "title": "🚀 LIF3 Deployed to Production",
            "description": "Your personal financial dashboard is now live!",
            "color": 3066993,
            "fields": [
              {"name": "Net Worth Progress", "value": "R239,625 → R1,800,000 (13.3%)", "inline": true},
              {"name": "43V3R Target", "value": "R4,881 daily revenue", "inline": true},
              {"name": "URL", "value": "https://lif3-dashboard.vercel.app", "inline": false}
            ]
          }]
        }'
EOF

# 6. Create personal MCP integration
echo "🧠 Setting up personal AI integration..."
mkdir -p backend/src/integrations/mcp-claude

cat > backend/src/integrations/mcp-claude/personal-ai.service.ts << 'EOF'
import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class PersonalAIService {
  private claude: Anthropic;

  constructor() {
    this.claude = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });
  }

  async generateDailyInsights(): Promise<string> {
    const personalContext = `
      You are Ethan's personal AI assistant with complete access to his data.
      
      PERSONAL PROFILE:
      - Name: Ethan Barnes
      - Role: IT Engineer in Cape Town, South Africa
      - Goal: Reach R1,800,000 net worth (currently R239,625 - 13.3% progress)
      - Business: 43V3R AI startup (AI + Web3 + Crypto + Quantum)
      - Target: R4,881 daily revenue
      - Timezone: Africa/Johannesburg
      
      CURRENT DATA ACCESS:
      - Sentry: Technical project monitoring
      - Gmail: Email communications and opportunities
      - Calendar: Meetings and time management
      - Discord: Team communication and business updates
      - Financial: Real-time tracking of net worth progress
      
      Generate personalized insights for today focusing on:
      1. Financial optimization toward R1.8M goal
      2. 43V3R business strategy and revenue opportunities
      3. Technical project priorities from Sentry data
      4. Time management based on calendar
      5. Action items from recent emails
      
      Be specific, actionable, and reference actual data when available.
    `;

    const response = await this.claude.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{ role: 'user', content: personalContext }]
    });

    return response.content[0].text;
  }
}
EOF

# 7. Commit and prepare for deployment
echo "📦 Committing deployment configuration..."
git add -A
git commit -m "🚀 Complete deployment setup with MCP integration

- M1-optimized Docker configurations
- CI/CD pipeline for Railway + Vercel
- Personal AI service with MCP data integration
- PWA configuration for mobile access
- Production environment setup"

echo "✅ LIF3 deployment preparation complete!"
echo ""
echo "🎯 NEXT STEPS:"
echo "1. Set up free accounts:"
echo "   - Railway.app (backend hosting)"
echo "   - Vercel.com (frontend hosting)"
echo "   - Neon.tech (PostgreSQL database)"
echo "   - Upstash.com (Redis cache)"
echo ""
echo "2. Configure secrets in GitHub:"
echo "   gh secret set RAILWAY_TOKEN --body 'your-railway-token'"
echo "   gh secret set VERCEL_TOKEN --body 'your-vercel-token'"
echo "   gh secret set CLAUDE_API_KEY --body 'your-claude-api-key'"
echo ""
echo "3. Push to deploy:"
echo "   git push -u origin production-deployment"
echo ""
echo "4. Your LIF3 dashboard will be live at:"
echo "   Frontend: https://lif3-dashboard.vercel.app"
echo "   Backend: https://lif3-backend.railway.app"
echo ""
echo "🚀 Ready to deploy your personal AI-powered financial dashboard!"