#!/usr/bin/env node

// SETUP SCRIPT FOR DISCORD AND SLACK INTEGRATIONS
// This script helps configure Discord and Slack bots for LIF3

import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

class LIF3IntegrationsSetup {
  constructor() {
    this.envPath = join(__dirname, '.env');
    this.configPath = join(__dirname, 'integration-config.json');
  }

  async setup() {
    console.log('🚀 LIF3 DISCORD & SLACK INTEGRATION SETUP');
    console.log('=========================================');
    console.log('');

    // Check if .env exists
    if (!existsSync(this.envPath)) {
      this.createEnvFile();
    } else {
      console.log('✅ .env file exists');
    }

    // Create configuration template
    this.createConfigFile();

    // Display setup instructions
    this.showSetupInstructions();
  }

  createEnvFile() {
    const envContent = `# LIF3 DISCORD & SLACK INTEGRATION ENVIRONMENT VARIABLES
# Copy this file and fill in your actual tokens

# ===========================================
# DISCORD CONFIGURATION
# ===========================================
# Get these from https://discord.com/developers/applications
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_discord_application_id_here
DISCORD_GUILD_ID=your_discord_server_id_here

# ===========================================
# SLACK CONFIGURATION  
# ===========================================
# Get these from https://api.slack.com/apps
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token-here
SLACK_SIGNING_SECRET=your_slack_signing_secret_here
SLACK_APP_TOKEN=xapp-your-slack-app-token-here

# ===========================================
# LIF3 CONFIGURATION
# ===========================================
# Your financial targets
LIF3_NET_WORTH_TARGET=1800000
LIF3_CURRENT_NET_WORTH=239625
LIF3_MONTHLY_TARGET=86688
LIF3_DAILY_REVENUE_TARGET=4881

# Business configuration
BUSINESS_NAME=43V3R
BUSINESS_MRR_TARGET=147917
BUSINESS_CURRENT_MRR=0

# ===========================================
# OPTIONAL CONFIGURATION
# ===========================================
# Timezone for automated messages
TIMEZONE=Africa/Johannesburg

# Notification channels (Discord)
DISCORD_FINANCIAL_CHANNEL=financial
DISCORD_BUSINESS_CHANNEL=business
DISCORD_GENERAL_CHANNEL=general

# Notification channels (Slack)
SLACK_FINANCIAL_CHANNEL=finance
SLACK_BUSINESS_CHANNEL=business
SLACK_GENERAL_CHANNEL=general

# Server port (if needed)
PORT=3000
`;

    writeFileSync(this.envPath, envContent);
    console.log('✅ Created .env template file');
  }

  createConfigFile() {
    const config = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      discord: {
        enabled: false,
        botConfigured: false,
        commandsDeployed: false,
        channels: {
          financial: 'financial',
          business: 'business', 
          general: 'general'
        },
        automatedMessages: {
          dailyBriefing: {
            enabled: true,
            time: '08:00',
            timezone: 'Africa/Johannesburg'
          },
          milestoneAlerts: {
            enabled: true,
            thresholds: [1000, 5000, 10000, 50000]
          }
        }
      },
      slack: {
        enabled: false,
        appConfigured: false,
        commandsConfigured: false,
        channels: {
          finance: 'finance',
          business: 'business',
          general: 'general'
        },
        automatedMessages: {
          dailyBriefing: {
            enabled: true,
            time: '08:00',
            timezone: 'Africa/Johannesburg'
          },
          weeklyReview: {
            enabled: true,
            day: 'sunday',
            time: '18:00'
          }
        }
      },
      financial: {
        currentNetWorth: 239625,
        targetNetWorth: 1800000,
        monthlyTarget: 86688,
        currency: 'ZAR'
      },
      business: {
        name: '43V3R',
        currentRevenue: 0,
        dailyTarget: 4881,
        mrrTarget: 147917,
        sectors: ['AI', 'Web3', 'Crypto', 'Quantum']
      }
    };

    writeFileSync(this.configPath, JSON.stringify(config, null, 2));
    console.log('✅ Created integration configuration file');
  }

  showSetupInstructions() {
    console.log('');
    console.log('📋 SETUP INSTRUCTIONS');
    console.log('=====================');
    console.log('');
    
    console.log('🤖 DISCORD BOT SETUP:');
    console.log('1. Go to https://discord.com/developers/applications');
    console.log('2. Click "New Application" and name it "LIF3 Financial Bot"');
    console.log('3. Go to "Bot" tab and click "Add Bot"');
    console.log('4. Copy the Bot Token to DISCORD_TOKEN in .env');
    console.log('5. Go to "OAuth2" > "General" and copy Application ID to DISCORD_CLIENT_ID');
    console.log('6. In Discord, enable Developer Mode and copy your server ID to DISCORD_GUILD_ID');
    console.log('7. Invite bot with Admin permissions using OAuth2 URL Generator');
    console.log('');

    console.log('💬 SLACK APP SETUP:');
    console.log('1. Go to https://api.slack.com/apps');
    console.log('2. Click "Create New App" > "From scratch"');
    console.log('3. Name it "LIF3 Financial Assistant"');
    console.log('4. Go to "OAuth & Permissions" and add these scopes:');
    console.log('   - chat:write');
    console.log('   - channels:read');
    console.log('   - commands');
    console.log('   - users:read');
    console.log('5. Install app to workspace and copy Bot User OAuth Token to SLACK_BOT_TOKEN');
    console.log('6. Go to "Basic Information" and copy Signing Secret to SLACK_SIGNING_SECRET');
    console.log('7. Enable Socket Mode and copy App-Level Token to SLACK_APP_TOKEN');
    console.log('');

    console.log('🔧 CONFIGURATION:');
    console.log('1. Edit .env file with your actual tokens');
    console.log('2. Update financial targets if needed');
    console.log('3. Run: npm install (to install dependencies)');
    console.log('4. Test Discord: npm run discord');
    console.log('5. Test Slack: npm run slack');
    console.log('');

    console.log('📱 CHANNELS TO CREATE:');
    console.log('Discord: #financial, #business, #general');
    console.log('Slack: #finance, #business, #general');
    console.log('');

    console.log('🎯 AVAILABLE COMMANDS AFTER SETUP:');
    console.log('');
    console.log('Discord Commands:');
    console.log('• /balance - Check net worth (R239,625/R1,800,000)');
    console.log('• /revenue [amount] - Log 43V3R business revenue');
    console.log('• /goals - View progress toward R1.8M target');
    console.log('• /savings - Calculate monthly savings rate');
    console.log('• /brief - Daily financial briefing');
    console.log('');
    
    console.log('Slack Commands:');
    console.log('• /lif3-balance - Current financial status');
    console.log('• /lif3-revenue [amount] - Log business revenue');
    console.log('• /lif3-goals - Goal progress overview');
    console.log('• /lif3-savings - Savings analysis');
    console.log('• /lif3-brief - Daily briefing');
    console.log('');

    console.log('🔔 AUTOMATED FEATURES:');
    console.log('• Daily 8AM briefings (Cape Town time)');
    console.log('• Revenue milestone celebrations');
    console.log('• Goal achievement notifications');
    console.log('• Weekly financial reviews (Slack)');
    console.log('• Real-time expense tracking alerts');
    console.log('');

    console.log('🚀 START SERVICES:');
    console.log('• Discord Bot: npm run discord');
    console.log('• Slack App: npm run slack'); 
    console.log('• MCP Servers: Already running in Claude Desktop');
    console.log('');

    console.log('✅ Ready to track your R1.8M journey via Discord & Slack!');
    console.log('');
    
    console.log('💡 NEXT STEPS:');
    console.log('1. Configure bot tokens in .env');
    console.log('2. Install dependencies: npm install');
    console.log('3. Test integrations');
    console.log('4. Start using commands to track your progress!');
  }
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new LIF3IntegrationsSetup();
  setup.setup().catch(console.error);
}

export default LIF3IntegrationsSetup;