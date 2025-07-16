# LIF3 Deployment Dashboard Setup Guide

## Overview
Complete guide to set up monitoring dashboards, clean up old deployments, and integrate notifications for Render, Vercel, GitHub, Discord, and Slack.

## 🚀 Quick Setup Checklist

### 1. Environment Variables Setup
Add these to your Render.com environment variables:

```bash
# Discord Integration
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN

# Slack Integration  
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# GitHub Integration
GITHUB_WEBHOOK_SECRET=your_github_webhook_secret

# Render API (for dashboard integration)
RENDER_API_KEY=your_render_api_key

# Vercel API (for dashboard integration)
VERCEL_API_TOKEN=your_vercel_api_token
```

### 2. GitHub Webhook Setup

#### Step 1: Create Webhook
1. Go to your repository: https://github.com/37-AN/l1f3
2. Settings → Webhooks → Add webhook
3. **Payload URL**: `https://lif3-backend-clean.onrender.com/api/dashboard/webhooks/github`
4. **Content type**: `application/json`
5. **Secret**: Use the `GITHUB_WEBHOOK_SECRET` from above
6. **Events**: Select "Push", "Pull requests", "Deployments"

#### Step 2: Backend Webhook
1. Go to: https://github.com/37-AN/lif3-backend-clean
2. Settings → Webhooks → Add webhook  
3. **Payload URL**: `https://lif3-backend-clean.onrender.com/api/dashboard/webhooks/github`
4. Same configuration as above

### 3. Render Dashboard Integration

#### Step 1: Get API Key
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Account Settings → API Keys → Create API Key
3. Add to environment variables as `RENDER_API_KEY`

#### Step 2: Set up Webhook
1. Go to your service: https://dashboard.render.com/web/lif3-backend-clean
2. Settings → Webhooks → Add webhook
3. **URL**: `https://lif3-backend-clean.onrender.com/api/dashboard/webhooks/render`
4. **Events**: Deploy started, Deploy succeeded, Deploy failed

#### Step 3: Clean up Old Deployments
```bash
# Use Render CLI or dashboard to remove old services
# Dashboard: https://dashboard.render.com → Services → Delete unused services
```

### 4. Vercel Dashboard Integration

#### Step 1: Get API Token
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Settings → Tokens → Create Token
3. Add to environment variables as `VERCEL_API_TOKEN`

#### Step 2: Set up Webhook
1. Go to your project settings
2. Git → Deploy Hooks → Create Hook
3. **URL**: `https://lif3-backend-clean.onrender.com/api/dashboard/webhooks/vercel`
4. **Branch**: main

#### Step 3: Clean up Old Deployments
```bash
# Use Vercel CLI or dashboard
vercel list  # See all deployments
vercel remove [deployment-url]  # Remove old ones

# Or via dashboard: https://vercel.com/dashboard → Projects → Delete unused projects
```

### 5. Discord Integration

#### Step 1: Create Discord Webhook
1. Open Discord → Server Settings → Integrations → Webhooks
2. Create New Webhook
3. Name: "LIF3 Deployments"
4. Channel: #deployments (or preferred channel)
5. Copy Webhook URL
6. Add to environment variables as `DISCORD_WEBHOOK_URL`

#### Step 2: Test Integration
```bash
curl -X GET https://lif3-backend-clean.onrender.com/api/dashboard/notifications/test
```

### 6. Slack Integration

#### Step 1: Create Slack App
1. Go to [Slack API](https://api.slack.com/apps)
2. Create New App → From scratch
3. App Name: "LIF3 Deployments"
4. Workspace: Your workspace

#### Step 2: Enable Webhooks
1. Features → Incoming Webhooks → Activate
2. Add New Webhook to Workspace
3. Select channel: #deployments
4. Copy Webhook URL
5. Add to environment variables as `SLACK_WEBHOOK_URL`

## 📊 Dashboard Endpoints

Once deployed, access these monitoring endpoints:

- **Status Overview**: `GET /api/dashboard/status/overview`
- **Deployment Status**: `GET /api/dashboard/deployments`
- **GitHub Events**: `GET /api/dashboard/github-events?limit=20`
- **Deployment Logs**: `GET /api/dashboard/logs/deployment?service=render`
- **Test Notifications**: `GET /api/dashboard/notifications/test`

## 🧹 Cleanup Commands

### Render Cleanup
```bash
# Via CLI (install: npm install -g @render-com/cli)
render login
render services list
render service delete [service-id]
```

### Vercel Cleanup  
```bash
# Via CLI (install: npm install -g vercel)
vercel login
vercel list
vercel remove [deployment-url]
```

### GitHub Cleanup
```bash
# Clean up old webhook deliveries
# Go to Settings → Webhooks → [webhook] → Recent Deliveries → Clear
```

## 🔍 Log Integration

Deployment logs are automatically stored in:
- **File**: `/logs/deployment-events.json` 
- **API**: `GET /api/dashboard/logs/deployment`
- **Repository**: Logs will be committed to repository if enabled

## 🚨 Notification Examples

### Discord Message Format
```
🚀 LIF3 Deployment: RENDER
Status: SUCCESS ✅
Branch: main
Commit: abc1234
Time: 2025-07-14T08:00:00Z
```

### Slack Message Format
```
🚀 LIF3 Deployment: VERCEL
✅ Deployment successful
Branch: main | Commit: abc1234
```

## 🔧 Troubleshooting

### Common Issues
1. **Webhook not receiving**: Check URL and secret configuration
2. **Notifications not sending**: Verify webhook URLs in environment variables  
3. **API errors**: Check API tokens and permissions
4. **Old deployments**: Manual cleanup required via dashboards

### Debug Endpoints
- Health: `GET /health`
- Test notifications: `GET /api/dashboard/notifications/test`
- Webhook status: `GET /api/dashboard/status/overview`

## 📝 Next Steps

1. ✅ Deploy dashboard module to backend
2. ✅ Set up environment variables
3. ✅ Configure webhooks
4. ✅ Test notifications
5. ✅ Clean up old deployments
6. ✅ Monitor dashboard endpoints

---

*Setup completed: Monitor all deployments, logs, and notifications from one central dashboard!*