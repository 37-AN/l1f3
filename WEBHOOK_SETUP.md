# 🔗 GitHub and Slack Integration Setup

## 🎯 Quick Setup Commands

### 1. GitHub Webhook Setup

#### Repository: https://github.com/37-AN/l1f3
1. Go to **Settings** → **Webhooks** → **Add webhook**
2. **Payload URL**: `https://lif3-backend-clean.onrender.com/api/dashboard/webhooks/github`
3. **Content type**: `application/json`
4. **Secret**: `lif3_github_webhook_secret_2025`
5. **Events**: Select "Push", "Pull requests", "Deployments"
6. **Active**: ✅ Checked

#### Backend Repository: https://github.com/37-AN/lif3-backend-clean
1. Go to **Settings** → **Webhooks** → **Add webhook**
2. **Payload URL**: `https://lif3-backend-clean.onrender.com/api/dashboard/webhooks/github`
3. **Content type**: `application/json`
4. **Secret**: `lif3_github_webhook_secret_2025`
5. **Events**: Select "Push", "Pull requests"
6. **Active**: ✅ Checked

### 2. Slack Integration Setup

#### Create Slack App
1. Go to [Slack API](https://api.slack.com/apps)
2. **Create New App** → **From scratch**
3. **App Name**: `LIF3 Deployments`
4. **Workspace**: Select your workspace

#### Enable Incoming Webhooks
1. **Features** → **Incoming Webhooks** → **Activate**
2. **Add New Webhook to Workspace**
3. **Select Channel**: `#deployments` (or create it)
4. **Copy Webhook URL**: `https://hooks.slack.com/services/YOUR/WEBHOOK/URL`

### 3. Environment Variables for Render.com

Add these to your Render service environment variables:

```bash
# GitHub Integration
GITHUB_WEBHOOK_SECRET=lif3_github_webhook_secret_2025

# Slack Integration (replace with your actual webhook URL)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Optional: Discord Integration
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
```

## 📱 Testing the Integration

### Test GitHub Webhook
```bash
# Make a test commit to trigger webhook
git commit --allow-empty -m "Test GitHub webhook integration"
git push
```

### Test Slack Notifications
```bash
# Test notification endpoint
curl https://lif3-backend-clean.onrender.com/api/dashboard/notifications/test
```

### Verify Dashboard
```bash
# Check recent events
curl https://lif3-backend-clean.onrender.com/api/dashboard/github-events

# Check system status
curl https://lif3-backend-clean.onrender.com/api/dashboard/status/overview
```

## 🔧 Environment Variables Setup Instructions

### Via Render Dashboard
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your service: **lif3-backend-clean**
3. Go to **Environment** tab
4. **Add Environment Variable**:
   - **Key**: `GITHUB_WEBHOOK_SECRET`
   - **Value**: `lif3_github_webhook_secret_2025`
5. **Add Environment Variable**:
   - **Key**: `SLACK_WEBHOOK_URL`
   - **Value**: `[Your Slack webhook URL]`
6. **Deploy** service to apply changes

### Via Render CLI
```bash
render services env set srv-[your-service-id] GITHUB_WEBHOOK_SECRET=lif3_github_webhook_secret_2025
render services env set srv-[your-service-id] SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

## 📊 Webhook Endpoints Available

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/dashboard/webhooks/github` | POST | GitHub events |
| `/api/dashboard/webhooks/render` | POST | Render deployments |
| `/api/dashboard/webhooks/vercel` | POST | Vercel deployments |
| `/api/dashboard/notifications/test` | GET | Test notifications |
| `/api/dashboard/status/overview` | GET | System overview |
| `/api/dashboard/github-events` | GET | Recent GitHub events |

## 🎉 Expected Notifications

### Slack Messages
```
🚀 LIF3 Deployment: GITHUB
✅ Push successful
Branch: main | Commit: abc1234
Repository: l1f3
```

### GitHub Events Tracked
- Push events to main branch
- Pull request creation/merge
- Deployment status changes
- Repository activity

## 🔍 Troubleshooting

### Common Issues
1. **Webhook not receiving**: Check URL and secret configuration
2. **Slack not posting**: Verify webhook URL and permissions
3. **Environment variables**: Ensure they're set and service is redeployed

### Debug Commands
```bash
# Check webhook endpoint
curl -X POST https://lif3-backend-clean.onrender.com/api/dashboard/webhooks/github

# Check environment variables (returns available config)
curl https://lif3-backend-clean.onrender.com/api/dashboard/status/overview

# Test notification system
curl https://lif3-backend-clean.onrender.com/api/dashboard/notifications/test
```

---

**Ready to receive notifications for all LIF3 deployments and repository activity!** 🚀