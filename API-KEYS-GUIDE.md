# 🔑 LIF3 API Keys Acquisition Guide

Complete step-by-step instructions for obtaining all required API keys for the LIF3 Financial Dashboard.

## 🚀 Quick Setup

Run the interactive setup script:
```bash
npm run setup
```

This will guide you through collecting all required API keys and generate environment files automatically.

---

## 📋 Required API Keys

### ✅ Core System Keys (Required)

#### 1. Google Drive API
**Purpose**: Daily briefings, automated reports, financial document storage

**Steps**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Drive API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"
4. Create OAuth2 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Select "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3001/auth/google/callback`
     - `https://your-domain.com/auth/google/callback` (for production)
5. Copy the Client ID and Client Secret

**Required Keys**:
- `GOOGLE_CLIENT_ID`: Client ID from credentials
- `GOOGLE_CLIENT_SECRET`: Client Secret from credentials
- `GOOGLE_DRIVE_FOLDER_ID`: Default folder ID already provided

#### 2. Discord Bot API
**Purpose**: Financial commands, automated notifications, real-time alerts

**Steps**:
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give your application a name (e.g., "LIF3 Financial Bot")
4. Go to the "Bot" section:
   - Click "Add Bot"
   - Copy the Bot Token
   - Enable "Message Content Intent" under "Privileged Gateway Intents"
5. Get the Application ID from "General Information"
6. Invite bot to your server:
   - Go to "OAuth2" > "URL Generator"
   - Select "bot" scope
   - Select required permissions:
     - Send Messages
     - Use Slash Commands
     - Embed Links
     - Read Message History
   - Copy and visit the generated URL

**Required Keys**:
- `DISCORD_BOT_TOKEN`: Bot token from Bot section
- `DISCORD_CLIENT_ID`: Application ID from General Information
- `DISCORD_GUILD_ID`: Your Discord server ID (right-click server > Copy ID)

#### 3. Claude AI API
**Purpose**: Financial coaching, investment insights, automated analysis

**Steps**:
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an account or sign in
3. Navigate to "API Keys"
4. Click "Create Key"
5. Give it a name (e.g., "LIF3 Financial Dashboard")
6. Copy the generated API key

**Required Keys**:
- `CLAUDE_API_KEY`: API key from Anthropic Console

#### 4. Database Configuration
**Purpose**: Store financial data, transactions, goals, business metrics

**Local Development** (using Docker):
```bash
# Start PostgreSQL and Redis containers
npm run docker:up
```

**Production Database**:
- **Railway**: Create PostgreSQL database
- **Supabase**: Create new project
- **AWS RDS**: Create PostgreSQL instance

**Required Keys**:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string (default: `redis://localhost:6379`)

---

## 🔧 Optional API Keys (Enhanced Features)

### South African Banking APIs

#### FNB Bank API
**Status**: Limited availability
- Contact FNB Business Banking for API access
- Requires business account and approval process
- Alternative: Manual CSV import

#### Standard Bank API
**Status**: Enterprise only
- Contact Standard Bank for developer access
- Requires significant business relationship
- Alternative: Manual transaction logging

#### ABSA Bank API
**Status**: Limited open banking
- Check ABSA developer portal for updates
- Alternative: Manual integration

### Investment Platform APIs

#### Easy Equities API
**Purpose**: Portfolio tracking, investment performance
- Contact Easy Equities support for API access
- May require minimum investment amounts
- Alternative: Manual portfolio updates

#### Allan Gray API
**Purpose**: Unit trust tracking
- Enterprise access only
- Contact Allan Gray directly

### Cryptocurrency APIs

#### Luno Exchange API
**Purpose**: ZAR crypto tracking, trading data

**Steps**:
1. Go to [Luno API Keys](https://www.luno.com/wallet/security/api_keys)
2. Log in to your Luno account
3. Navigate to "API Keys" in settings
4. Create new API key with read permissions
5. Copy API Key and Secret

**Required Keys**:
- `LUNO_API_KEY`: API key from Luno
- `LUNO_API_SECRET`: API secret from Luno

#### VALR API
**Purpose**: DeFi tracking, advanced crypto features
- Create account at [VALR](https://www.valr.com/)
- Generate API credentials in account settings

---

## 📧 Email Notifications (Optional)

### Gmail SMTP Setup
**Purpose**: Email alerts, daily summaries, milestone notifications

**Steps**:
1. Enable 2-Factor Authentication on Gmail
2. Generate App-Specific Password:
   - Go to Google Account settings
   - Security > 2-Step Verification
   - App passwords > Generate
3. Use your Gmail and the app password

**Required Keys**:
- `SMTP_HOST`: `smtp.gmail.com`
- `SMTP_PORT`: `587`
- `SMTP_USER`: Your Gmail address
- `SMTP_PASS`: App-specific password

---

## 🚀 Deployment Platforms (Optional)

### Railway Deployment
**Purpose**: Production backend hosting

**Steps**:
1. Go to [Railway](https://railway.app/)
2. Connect GitHub account
3. Create new project
4. Get API token from account settings

### Vercel Deployment
**Purpose**: Production frontend hosting

**Steps**:
1. Go to [Vercel](https://vercel.com/)
2. Connect GitHub account
3. Import your frontend project
4. Get API token from account settings

---

## 🔍 Monitoring & Analytics (Optional)

### Sentry Error Tracking
**Purpose**: Error monitoring, performance tracking

**Steps**:
1. Go to [Sentry](https://sentry.io/)
2. Create new project
3. Select Node.js platform
4. Copy the DSN

**Required Keys**:
- `SENTRY_DSN`: Project DSN from Sentry

---

## 🔐 Security Best Practices

### Environment File Security
- Never commit `.env` files to version control
- Use different keys for development and production
- Rotate API keys regularly
- Use least privilege access for all APIs

### Key Storage
- Development: Local `.env` files
- Production: Platform environment variables
- Backup: Secure password manager

---

## 🧪 Testing Your Setup

After running the setup script, test your configuration:

```bash
# Test all connections
npm run test:connection

# Start development servers
npm run dev

# Check health endpoints
curl http://localhost:3001/health
```

---

## 📞 Support

### API Key Issues
- **Google APIs**: [Google Cloud Support](https://cloud.google.com/support)
- **Discord**: [Discord Developer Support](https://discord.com/developers/docs)
- **Anthropic**: [Claude API Support](https://support.anthropic.com/)

### South African Banking
- **FNB**: Business Banking Support
- **Standard Bank**: Corporate API Team
- **ABSA**: Digital Banking Solutions

### Alternative Solutions
If you can't obtain certain API keys:
- Use manual CSV import for banking data
- Enable mock data mode for development
- Use webhooks for custom integrations

---

## 🎯 Next Steps

1. Run the interactive setup: `npm run setup`
2. Start with core integrations (Google, Discord, Claude)
3. Add banking APIs as they become available
4. Deploy to production platforms
5. Enable monitoring and analytics

Your LIF3 Fresh Start journey from R0 → R1,800,000 begins with proper API configuration!