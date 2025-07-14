# Deployment Cleanup Commands

## 🗑️ Clean Up Old Render Deployments

### Via Render Dashboard
1. **Login**: https://dashboard.render.com
2. **Find Services**: Look for unused or old services
3. **Delete Process**:
   - Click service → Settings → Delete Service
   - Type service name to confirm

### Via Render CLI
```bash
# Install Render CLI
npm install -g @render-com/cli

# Login
render login

# List all services
render services list

# Delete specific service
render service delete [service-id]

# Example: Delete by name pattern
render services list | grep "old" | awk '{print $1}' | xargs -I {} render service delete {}
```

## 🗑️ Clean Up Old Vercel Deployments

### Via Vercel Dashboard
1. **Login**: https://vercel.com/dashboard
2. **Projects**: Review all projects
3. **Delete Process**:
   - Project Settings → Advanced → Delete Project
   - Type project name to confirm

### Via Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# List all deployments
vercel list

# Remove specific deployment
vercel remove [deployment-url]

# Remove all deployments for a project
vercel list --scope [team-name] | grep [project-name] | awk '{print $1}' | xargs -I {} vercel remove {}

# Delete entire project
vercel projects rm [project-name]
```

## 📋 Current Active Deployments

### Render.com
- **Backend**: https://dashboard.render.com/web/srv-cqh5p5q3esus739ekkf0
- **Service Name**: lif3-backend-clean
- **Status**: Keep this one ✅

### Vercel.com
- **Frontend**: [Check your Vercel dashboard]
- **Project**: l1f3 or lif3
- **Domain**: [Your custom domain]

## 🔍 How to Identify Old Deployments

### Render Cleanup Criteria
- Services not accessed in 30+ days
- Test/development services
- Duplicate services
- Services with "old", "test", "backup" in name

### Vercel Cleanup Criteria  
- Projects not deployed in 30+ days
- Preview deployments older than 7 days
- Unused custom domains
- Test projects

## 🚨 IMPORTANT: Before Deleting

### ✅ Checklist
- [ ] Confirm service is not in use
- [ ] Check if domains point to the service
- [ ] Verify no production traffic
- [ ] Backup any important data/logs
- [ ] Update DNS records if needed

### 🔄 Safe Cleanup Process
1. **Identify** unused services
2. **Test** current functionality without them
3. **Backup** any configurations
4. **Delete** one at a time
5. **Verify** nothing breaks

## 📊 Monitor After Cleanup

After cleanup, verify:
- [ ] Main site works: [Your frontend URL]
- [ ] API works: https://lif3-backend-clean.onrender.com/health
- [ ] No broken links or 404s
- [ ] Custom domains resolve correctly

## 🛠️ Automation Script

Save this as `cleanup.sh`:

```bash
#!/bin/bash

echo "🧹 LIF3 Deployment Cleanup Script"

# Render cleanup
echo "📋 Listing Render services..."
render services list

echo "❓ Enter service ID to delete (or 'skip'):"
read service_id
if [ "$service_id" != "skip" ]; then
    render service delete $service_id
fi

# Vercel cleanup  
echo "📋 Listing Vercel deployments..."
vercel list

echo "❓ Enter deployment URL to delete (or 'skip'):"
read deployment_url
if [ "$deployment_url" != "skip" ]; then
    vercel remove $deployment_url
fi

echo "✅ Cleanup complete!"
```

Make executable: `chmod +x cleanup.sh`

---

*Remember: Only delete what you're sure you don't need! Keep backups of important configurations.*