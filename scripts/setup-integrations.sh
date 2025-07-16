#!/bin/bash

echo "🚀 LIF3 GitHub and Slack Integration Setup"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Setup Checklist:${NC}"
echo "1. Set up GitHub webhooks"
echo "2. Configure Slack integration"
echo "3. Add environment variables to Render"
echo "4. Test integrations"
echo ""

# Test current backend status
echo -e "${BLUE}🔍 Testing Backend Status...${NC}"
BACKEND_URL="https://lif3-backend-clean.onrender.com"
STATUS=$(curl -s "$BACKEND_URL/health" | jq -r '.status' 2>/dev/null || echo "error")

if [ "$STATUS" = "healthy" ]; then
    echo -e "${GREEN}✅ Backend is healthy and ready${NC}"
else
    echo -e "${YELLOW}⚠️  Backend may be sleeping, trying to wake it up...${NC}"
    curl -s "$BACKEND_URL/health" > /dev/null
    sleep 3
fi

# Test webhook endpoint
echo -e "${BLUE}🔍 Testing Webhook Endpoint...${NC}"
WEBHOOK_TEST=$(curl -s -X POST "$BACKEND_URL/api/dashboard/webhooks/github" \
    -H "Content-Type: application/json" \
    -d '{"action":"setup_test","head_commit":{"id":"setup123","message":"Setup test"}}' \
    | jq -r '.status' 2>/dev/null || echo "error")

if [ "$WEBHOOK_TEST" = "processed" ]; then
    echo -e "${GREEN}✅ Webhook endpoint is working${NC}"
else
    echo -e "${YELLOW}⚠️  Webhook endpoint may need a moment to start${NC}"
fi

echo ""
echo -e "${BLUE}📝 GitHub Webhook Configuration:${NC}"
echo "Repository: https://github.com/37-AN/l1f3"
echo "Settings → Webhooks → Add webhook"
echo ""
echo "Configuration:"
echo "  Payload URL: $BACKEND_URL/api/dashboard/webhooks/github"
echo "  Content type: application/json"
echo "  Secret: lif3_github_webhook_secret_2025"
echo "  Events: Push, Pull requests"
echo ""

echo -e "${BLUE}📝 Backend Repository Webhook:${NC}"
echo "Repository: https://github.com/37-AN/lif3-backend-clean"
echo "Same configuration as above"
echo ""

echo -e "${BLUE}📱 Slack Setup:${NC}"
echo "1. Go to https://api.slack.com/apps"
echo "2. Create New App → From scratch"
echo "3. App Name: 'LIF3 Deployments'"
echo "4. Features → Incoming Webhooks → Activate"
echo "5. Add New Webhook to Workspace"
echo "6. Select #deployments channel"
echo "7. Copy webhook URL for environment variables"
echo ""

echo -e "${BLUE}🔧 Environment Variables for Render:${NC}"
echo "Add these to your Render service:"
echo ""
echo "GITHUB_WEBHOOK_SECRET=lif3_github_webhook_secret_2025"
echo "SLACK_WEBHOOK_URL=[Your Slack webhook URL]"
echo ""
echo "Render Dashboard: https://dashboard.render.com/web/srv-cqh5p5q3esus739ekkf0"
echo "Go to Environment tab → Add Environment Variable"
echo ""

echo -e "${BLUE}🧪 Test Commands:${NC}"
echo "Test webhook:"
echo "  curl $BACKEND_URL/api/dashboard/notifications/test"
echo ""
echo "Check events:"
echo "  curl $BACKEND_URL/api/dashboard/github-events"
echo ""
echo "Check status:"
echo "  curl $BACKEND_URL/api/dashboard/status/overview"
echo ""

echo -e "${GREEN}🎉 Setup guide complete!${NC}"
echo "Follow the steps above to complete the integration."

# Test final connectivity
echo -e "${BLUE}🔍 Final Backend Test...${NC}"
curl -s "$BACKEND_URL/api/dashboard/status/overview" | jq '.notifications' 2>/dev/null || echo "Backend responding"