# 🧹 Clean Deployment Process

## Current Status Check

### Backend (Render.com)
- **URL**: https://lif3-backend-clean.onrender.com
- **Status**: Healthy ✅ (25 min uptime)
- **Latest Commit**: `805eb3e` - Dashboard monitoring system
- **Issue**: Dashboard endpoints not yet deployed (404)

### Frontend (Vercel)
- **Status**: Need to identify current deployment
- **Latest Build**: Local build successful

## 🚀 Clean Deployment Steps

### Phase 1: Backend Cleanup & Redeploy

#### 1. Force New Render Deployment
```bash
# Trigger empty commit to force redeploy
cd /Users/ccladysmith/Desktop/dev/l1f3/backend-deploy
git commit --allow-empty -m "🔄 Force redeploy with dashboard module"
git push
```

#### 2. Monitor Deployment
- **Render Dashboard**: https://dashboard.render.com/web/srv-cqh5p5q3esus739ekkf0
- **Build Logs**: Check for successful compilation
- **Test Endpoint**: `curl https://lif3-backend-clean.onrender.com/api/dashboard/status/overview`

### Phase 2: Frontend Cleanup & Deploy

#### 1. Build & Deploy Frontend
```bash
cd /Users/ccladysmith/Desktop/dev/l1f3/frontend
npm run build
```

#### 2. Deploy to Vercel
```bash
# Option A: Vercel CLI
npm install -g vercel
vercel --prod

# Option B: Git push (if connected)
git add dist/
git commit -m "🚀 Fresh frontend build"
git push
```

### Phase 3: Cleanup Old Deployments

#### 1. Render Cleanup
```bash
# Via Render CLI
render login
render services list
# Delete any old/unused services
```

#### 2. Vercel Cleanup  
```bash
# Via Vercel CLI
vercel login
vercel list
# Remove old deployments: vercel remove [url]
```

## 🔧 Environment Variables Setup

Add these to Render.com environment variables:

```bash
NODE_ENV=production
PORT=10000

# Optional: Dashboard integrations
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR_WEBHOOK
GITHUB_WEBHOOK_SECRET=your_secret_here
```

## ✅ Verification Checklist

### Backend Verification
- [ ] Health check: `GET /health` → 200 OK
- [ ] Financial API: `GET /api/financial/dashboard` → 200 OK
- [ ] Monitoring: `GET /api/monitoring/performance` → 200 OK
- [ ] **NEW Dashboard**: `GET /api/dashboard/status/overview` → 200 OK

### Frontend Verification
- [ ] Site loads without errors
- [ ] API connections working
- [ ] WebSocket connections stable
- [ ] Claude AI assistant functional

### Integration Tests
- [ ] Dashboard endpoints responsive
- [ ] GitHub webhook ready: `POST /api/dashboard/webhooks/github`
- [ ] Notification test: `GET /api/dashboard/notifications/test`

## 📊 New Deployment URLs

Once deployed, these will be available:

### Backend API Endpoints
- **Health**: https://lif3-backend-clean.onrender.com/health
- **Dashboard**: https://lif3-backend-clean.onrender.com/api/dashboard/status/overview
- **Deployments**: https://lif3-backend-clean.onrender.com/api/dashboard/deployments
- **GitHub Events**: https://lif3-backend-clean.onrender.com/api/dashboard/github-events

### Frontend Application
- **Main App**: [Your Vercel URL]
- **Admin Dashboard**: [Frontend URL]/dashboard
- **Health Check**: [Frontend URL]/health

## 🚨 Rollback Plan

If new deployment fails:

### Backend Rollback
```bash
cd /Users/ccladysmith/Desktop/dev/l1f3/backend-deploy
git log --oneline -10  # Find last working commit
git reset --hard [working-commit-hash]
git push --force-with-lease
```

### Frontend Rollback
```bash
cd /Users/ccladysmith/Desktop/dev/l1f3/frontend
git reset --hard [working-commit-hash]
npm run build
vercel --prod
```

---

*Clean deployment process: Remove old, deploy fresh, verify functionality*