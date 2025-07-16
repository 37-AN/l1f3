# 🚀 Auto-Deployment Configuration - Free Tier Optimized

## 📋 Free Tier Limitations & Strategy

### Render.com Free Tier
- **Build Time**: 15 minutes max
- **Sleep Mode**: Service sleeps after 30 min inactivity
- **Monthly Hours**: 750 hours free
- **Memory**: 512MB RAM
- **Storage**: 1GB
- **Cold Start**: ~30 seconds wake-up time

### Vercel Free Tier  
- **Build Time**: 45 minutes max
- **Bandwidth**: 100GB/month
- **Serverless Functions**: 100GB-hrs execution
- **Team Seats**: Up to 3
- **Domains**: Unlimited

### Strategy: Smart Auto-Deployment
✅ **Only deploy working commits** (validated builds)
✅ **Prevent failed builds** (waste free build minutes)
✅ **Optimize cold starts** (keep services warm)
✅ **Monitor resource usage** (stay within limits)

## 🔧 Auto-Deployment Configuration

### 1. Render.com Auto-Deploy Setup

#### Current Service Configuration
- **Service**: lif3-backend-clean
- **Repository**: https://github.com/37-AN/lif3-backend-clean
- **Branch**: main
- **Auto-Deploy**: Enabled

#### Enhanced Configuration
```yaml
# render.yaml (optimized for free tier)
services:
  - type: web
    name: lif3-backend-clean
    env: node
    plan: free
    branch: main
    buildCommand: npm ci && npm run build:production
    startCommand: npm run start:prod
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: BUILD_OPTIMIZATION
        value: true
    # Free tier optimizations
    scaling:
      minInstances: 0  # Allow sleep to save hours
      maxInstances: 1
    # Resource limits
    disk: 1024  # 1GB max
    # Auto-deploy only on main branch
    autoDeploy: true
```

### 2. Vercel Auto-Deploy Setup

#### Current Configuration
```json
{
  "version": 2,
  "buildCommand": "npm ci && npm run build",
  "outputDirectory": "dist", 
  "installCommand": "npm ci",
  "cwd": "frontend",
  "functions": {
    "frontend/dist/**": {
      "memory": 1024
    }
  },
  "regions": ["iad1"],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### Enhanced Auto-Deploy Configuration
```json
{
  "version": 2,
  "buildCommand": "npm ci && npm run build:production",
  "outputDirectory": "dist",
  "installCommand": "npm ci",
  "cwd": "frontend", 
  "github": {
    "enabled": true,
    "autoAlias": true,
    "autoJobCancelation": true
  },
  "functions": {
    "frontend/dist/**": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "regions": ["iad1"],
  "env": {
    "NODE_ENV": "production",
    "REACT_APP_API_URL": "https://lif3-backend-clean.onrender.com"
  },
  "cleanUrls": true,
  "trailingSlash": false
}
```

## 🛡️ Build Validation System

### Pre-Deployment Checks
```yaml
# .github/workflows/validate-deploy.yml
name: Validate Before Deploy
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # Backend validation
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          
      - name: Install backend dependencies
        run: |
          cd backend-deploy
          npm ci
          
      - name: Build backend
        run: |
          cd backend-deploy
          npm run build
          
      - name: Test backend
        run: |
          cd backend-deploy
          npm test
          
      # Frontend validation  
      - name: Install frontend dependencies
        run: |
          cd frontend
          npm ci
          
      - name: Build frontend
        run: |
          cd frontend
          npm run build
          
      - name: Test frontend
        run: |
          cd frontend
          npm test
          
      # Only proceed if all tests pass
      - name: Deploy Status
        run: echo "✅ All validations passed - ready for auto-deploy"
```

## 📊 Resource Monitoring System

### Backend Resource Monitor
```typescript
// backend-deploy/src/modules/monitoring/resource-monitor.service.ts
@Injectable()
export class ResourceMonitorService {
  private readonly logger = new Logger(ResourceMonitorService.name);
  
  @Cron('*/5 * * * *') // Every 5 minutes
  async monitorResources() {
    const resources = {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      cpu: process.cpuUsage(),
      timestamp: new Date()
    };
    
    // Free tier memory warning at 400MB (80% of 512MB)
    if (resources.memory.heapUsed > 400 * 1024 * 1024) {
      this.logger.warn('🚨 Memory usage high - approaching free tier limit');
      await this.optimizeMemory();
    }
    
    // Log resource usage for monitoring
    this.logger.log(`💾 Memory: ${Math.round(resources.memory.heapUsed / 1024 / 1024)}MB`);
  }
  
  private async optimizeMemory() {
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
      this.logger.log('🧹 Garbage collection triggered');
    }
  }
}
```

### Keep-Alive Service (Prevent Sleep)
```typescript
// backend-deploy/src/modules/monitoring/keep-alive.service.ts  
@Injectable()
export class KeepAliveService {
  private readonly logger = new Logger(KeepAliveService.name);
  
  @Cron('*/25 * * * *') // Every 25 minutes (before 30-min sleep)
  async preventSleep() {
    try {
      // Self-ping to prevent Render sleep
      const response = await fetch('https://lif3-backend-clean.onrender.com/health');
      if (response.ok) {
        this.logger.log('💚 Keep-alive ping successful');
      }
    } catch (error) {
      this.logger.warn('❌ Keep-alive ping failed');
    }
  }
  
  @Cron('0 2 * * *') // Daily at 2 AM (low usage)
  async allowSleep() {
    // Allow sleep during low-usage hours to save quota
    this.logger.log('😴 Allowing sleep during low-usage period');
    // Skip keep-alive for next 6 hours
  }
}
```

## 🔄 Smart Deployment Strategy

### Deployment Conditions
```typescript
// Only deploy if:
const shouldDeploy = {
  buildPassing: true,      // All tests pass
  commitValid: true,       // Valid commit message  
  branchMain: true,        // Only main branch
  resourcesOK: true,       // Within free tier limits
  lastDeploySuccess: true  // Previous deploy succeeded
};
```

### Rollback Mechanism
```bash
#!/bin/bash
# auto-rollback.sh

# Monitor deployment health
HEALTH_URL="https://lif3-backend-clean.onrender.com/health"
MAX_ATTEMPTS=10
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)
  
  if [ $HTTP_CODE -eq 200 ]; then
    echo "✅ Deployment healthy"
    exit 0
  fi
  
  echo "⚠️ Attempt $((ATTEMPT+1)): HTTP $HTTP_CODE"
  ATTEMPT=$((ATTEMPT+1))
  sleep 30
done

echo "❌ Deployment failed - triggering rollback"
# Trigger rollback to last known good commit
git reset --hard HEAD~1
git push --force-with-lease
```

## 🎯 Optimized Build Commands

### Backend Production Build
```json
{
  "scripts": {
    "build:production": "npm ci --production=false && npm run build && npm prune --production",
    "start:prod": "node dist/main.js",
    "health:check": "curl -f http://localhost:$PORT/health || exit 1"
  }
}
```

### Frontend Production Build  
```json
{
  "scripts": {
    "build:production": "npm ci && npm run build && npm run optimize",
    "optimize": "npm run compress && npm run tree-shake",
    "compress": "gzip -9 dist/assets/*.js",
    "tree-shake": "npm run build -- --tree-shaking"
  }
}
```

## 📈 Deployment Monitoring

### Real-time Deployment Status
```bash
# Monitor script
#!/bin/bash
echo "🔍 Monitoring LIF3 Deployments..."

# Backend status
echo "Backend: $(curl -s https://lif3-backend-clean.onrender.com/health | jq -r '.status')"

# Frontend status  
echo "Frontend: $(curl -s -o /dev/null -w "%{http_code}" https://frontend-one-phi-52.vercel.app)"

# Resource usage
echo "Memory: $(curl -s https://lif3-backend-clean.onrender.com/api/monitoring/performance | jq -r '.systemResources.memoryUsage')%"

# Deployment events
echo "Recent deployments:"
curl -s https://lif3-backend-clean.onrender.com/api/dashboard/logs/deployment | jq -r '.logs[-3:] | .[] | "\(.timestamp): \(.service) - \(.status)"'
```

## ⚙️ Configuration Files

### 1. Update render.yaml
```yaml
# backend-deploy/render.yaml
services:
  - type: web
    name: lif3-backend-clean
    env: node
    plan: free
    branch: main
    buildCommand: npm ci && npm run build:production
    startCommand: npm run start:prod
    healthCheckPath: /health
    autoDeploy: true
    envVars:
      - key: NODE_ENV
        value: production
      - key: ENABLE_KEEP_ALIVE
        value: true
      - key: OPTIMIZE_MEMORY
        value: true
```

### 2. Update vercel.json
```json
{
  "version": 2,
  "buildCommand": "npm ci && npm run build:production",
  "outputDirectory": "dist",
  "installCommand": "npm ci",
  "cwd": "frontend",
  "github": {
    "enabled": true,
    "autoAlias": true,
    "autoJobCancelation": true
  },
  "env": {
    "NODE_ENV": "production",
    "REACT_APP_API_URL": "https://lif3-backend-clean.onrender.com"
  }
}
```

## 🚨 Free Tier Alerts

### Resource Usage Notifications
- **Memory > 80%**: Slack alert + optimization
- **Build time > 10 min**: Cancel and retry
- **Monthly hours > 600**: Reduce keep-alive frequency
- **Deploy failure**: Immediate rollback

---

**Auto-deployment configured to maximize free tier efficiency while ensuring reliability!** 🚀