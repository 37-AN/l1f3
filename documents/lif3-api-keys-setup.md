# LIF3 API Keys & Configuration Setup Command

## 🔑 COMPREHENSIVE API KEYS COLLECTION PROMPT

```bash
claude --context "LIF3 API Keys Setup - Interactive Configuration Collector" \
"CREATE INTERACTIVE API KEYS COLLECTION SYSTEM for LIF3 Fresh Start:

IMPLEMENTATION: Interactive Node.js script that collects, validates, and configures all required API keys and credentials for the complete LIF3 financial automation system.

## 🔧 INTERACTIVE SETUP SCRIPT

Create `setup-api-keys.js` that prompts for each required credential:

```javascript
#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 LIF3 Financial Dashboard - API Keys Setup');
console.log('='.repeat(50));
console.log('Fresh Start Journey: R0 → R1,800,000');
console.log('43V3R Business: R0 → R4,881 daily revenue');
console.log('='.repeat(50));
console.log('');

const config = {};
const requiredKeys = {
  // Core System
  'JWT_SECRET': {
    description: 'JWT Secret Key for authentication',
    generate: () => crypto.randomBytes(64).toString('hex'),
    required: true,
    example: 'Auto-generated secure random string'
  },
  
  'DATABASE_URL': {
    description: 'PostgreSQL Database Connection URL',
    required: true,
    example: 'postgresql://username:password@localhost:5432/lif3_db',
    validate: (url) => url.includes('postgresql://') || url.includes('postgres://')
  },
  
  'REDIS_URL': {
    description: 'Redis Cache Connection URL', 
    required: true,
    example: 'redis://localhost:6379',
    default: 'redis://localhost:6379'
  },

  // Google Drive Integration
  'GOOGLE_CLIENT_ID': {
    description: 'Google OAuth2 Client ID',
    required: true,
    example: 'xxxxx.apps.googleusercontent.com',
    instructions: 'Get from: https://console.cloud.google.com/ > Credentials'
  },
  
  'GOOGLE_CLIENT_SECRET': {
    description: 'Google OAuth2 Client Secret',
    required: true,
    example: 'GOCSPX-xxxxxxxxxxxxxxxxx',
    instructions: 'Get from: https://console.cloud.google.com/ > Credentials'
  },
  
  'GOOGLE_DRIVE_FOLDER_ID': {
    description: 'Google Drive Folder ID for LIF3 documents',
    required: true,
    example: '1dD8C1e1hkcCPdtlqA3nsxJYWVvilV5Io',
    default: '1dD8C1e1hkcCPdtlqA3nsxJYWVvilV5Io'
  },

  // Discord Bot Integration
  'DISCORD_BOT_TOKEN': {
    description: 'Discord Bot Token',
    required: true,
    example: 'MTxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    instructions: 'Get from: https://discord.com/developers/applications > Bot > Token'
  },
  
  'DISCORD_CLIENT_ID': {
    description: 'Discord Application Client ID',
    required: true,
    example: '1234567890123456789',
    instructions: 'Get from: https://discord.com/developers/applications > General Information'
  },
  
  'DISCORD_GUILD_ID': {
    description: 'Discord Server ID where bot will operate',
    required: false,
    example: '1234567890123456789',
    instructions: 'Right-click your Discord server > Copy Server ID (Developer mode required)'
  },

  // Claude AI Integration
  'CLAUDE_API_KEY': {
    description: 'Claude AI API Key',
    required: true,
    example: 'sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    instructions: 'Get from: https://console.anthropic.com/ > API Keys'
  },

  // Email Service (for notifications)
  'SMTP_HOST': {
    description: 'SMTP Server for email notifications',
    required: false,
    example: 'smtp.gmail.com',
    default: 'smtp.gmail.com'
  },
  
  'SMTP_PORT': {
    description: 'SMTP Port',
    required: false,
    example: '587',
    default: '587'
  },
  
  'SMTP_USER': {
    description: 'Email address for sending notifications',
    required: false,
    example: 'ethan@43v3r.ai'
  },
  
  'SMTP_PASS': {
    description: 'Email password or app-specific password',
    required: false,
    example: 'your-app-password',
    sensitive: true
  },

  // South African Bank APIs (Optional - for real financial data)
  'FNB_API_KEY': {
    description: 'FNB Bank API Key (Optional)',
    required: false,
    example: 'fnb_live_xxxxxxxxxxxxx',
    instructions: 'Get from: FNB Developer Portal (if available)'
  },
  
  'STANDARD_BANK_API_KEY': {
    description: 'Standard Bank API Key (Optional)',
    required: false,
    example: 'sb_live_xxxxxxxxxxxxx',
    instructions: 'Contact Standard Bank for API access'
  },

  // Investment Platform APIs (Optional)
  'EASY_EQUITIES_API_KEY': {
    description: 'Easy Equities API Key (Optional)',
    required: false,
    example: 'ee_live_xxxxxxxxxxxxx'
  },

  // Cryptocurrency APIs (Optional)
  'LUNO_API_KEY': {
    description: 'Luno Exchange API Key (Optional)',
    required: false,
    example: 'luno_api_xxxxxxxxxxxxx',
    instructions: 'Get from: https://www.luno.com/wallet/security/api_keys'
  },
  
  'LUNO_API_SECRET': {
    description: 'Luno Exchange API Secret (Optional)',
    required: false,
    example: 'luno_secret_xxxxxxxxxxxxx',
    sensitive: true
  },

  // Production Deployment
  'RAILWAY_TOKEN': {
    description: 'Railway Deployment Token (Optional)',
    required: false,
    example: 'railway_xxxxxxxxxxxxx',
    instructions: 'Get from: https://railway.app/account/tokens'
  },
  
  'VERCEL_TOKEN': {
    description: 'Vercel Deployment Token (Optional)',
    required: false,
    example: 'vercel_xxxxxxxxxxxxx',
    instructions: 'Get from: https://vercel.com/account/tokens'
  },

  // Monitoring & Analytics
  'SENTRY_DSN': {
    description: 'Sentry Error Tracking DSN (Optional)',
    required: false,
    example: 'https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@sentry.io/xxxxxxx'
  },

  // Application Configuration
  'APP_URL': {
    description: 'Application Base URL',
    required: true,
    example: 'http://localhost:3001',
    default: 'http://localhost:3001'
  },
  
  'FRONTEND_URL': {
    description: 'Frontend Application URL',
    required: true,
    example: 'http://localhost:3000',
    default: 'http://localhost:3000'
  },
  
  'NODE_ENV': {
    description: 'Node Environment',
    required: true,
    example: 'development',
    default: 'development'
  },

  // Security
  'ENCRYPTION_KEY': {
    description: 'Data Encryption Key',
    generate: () => crypto.randomBytes(32).toString('hex'),
    required: true,
    example: 'Auto-generated 256-bit encryption key'
  },

  // Timezone
  'TZ': {
    description: 'Application Timezone',
    required: true,
    example: 'Africa/Johannesburg',
    default: 'Africa/Johannesburg'
  }
};

async function promptForKey(keyName, keyConfig) {
  return new Promise((resolve) => {
    console.log(`\\n📋 ${keyConfig.description}`);
    
    if (keyConfig.instructions) {
      console.log(`ℹ️  Instructions: ${keyConfig.instructions}`);
    }
    
    if (keyConfig.example) {
      console.log(`💡 Example: ${keyConfig.sensitive ? '[HIDDEN]' : keyConfig.example}`);
    }
    
    if (keyConfig.default) {
      console.log(`⚡ Default: ${keyConfig.default}`);
    }
    
    if (keyConfig.generate) {
      console.log(`🔄 Can be auto-generated if left empty`);
    }
    
    const requiredText = keyConfig.required ? ' (REQUIRED)' : ' (Optional)';
    const prompt = `Enter ${keyName}${requiredText}: `;
    
    rl.question(prompt, (answer) => {
      // Handle defaults and auto-generation
      if (!answer && keyConfig.default) {
        answer = keyConfig.default;
      }
      
      if (!answer && keyConfig.generate) {
        answer = keyConfig.generate();
        console.log(`✅ Auto-generated secure value`);
      }
      
      // Validation
      if (keyConfig.required && !answer) {
        console.log(`❌ ${keyName} is required. Please provide a value.`);
        return promptForKey(keyName, keyConfig).then(resolve);
      }
      
      if (answer && keyConfig.validate && !keyConfig.validate(answer)) {
        console.log(`❌ Invalid format for ${keyName}. Please check the example.`);
        return promptForKey(keyName, keyConfig).then(resolve);
      }
      
      if (answer) {
        console.log(`✅ ${keyName} configured`);
      } else {
        console.log(`⏭️  Skipped ${keyName} (optional)`);
      }
      
      resolve(answer);
    });
  });
}

async function collectAllKeys() {
  console.log('🔑 Starting API Keys Collection...');
  console.log('This will set up all integrations for your LIF3 system.\\n');
  
  // Collect all keys
  for (const [keyName, keyConfig] of Object.entries(requiredKeys)) {
    config[keyName] = await promptForKey(keyName, keyConfig);
  }
  
  return config;
}

function generateEnvFiles(config) {
  // Backend .env
  const backendEnv = Object.entries(config)
    .filter(([key, value]) => value)
    .map(([key, value]) => `${key}=${value}`)
    .join('\\n');
  
  // Frontend .env
  const frontendEnv = `
VITE_API_URL=${config.APP_URL}
VITE_WEBSOCKET_URL=${config.APP_URL}
VITE_GOOGLE_CLIENT_ID=${config.GOOGLE_CLIENT_ID}
VITE_APP_NAME=LIF3 Financial Dashboard
VITE_APP_VERSION=1.0.0
`.trim();

  // Write files
  fs.writeFileSync(path.join(process.cwd(), 'backend', '.env'), backendEnv);
  fs.writeFileSync(path.join(process.cwd(), 'frontend', '.env.local'), frontendEnv);
  
  // Create example files
  fs.writeFileSync(path.join(process.cwd(), 'backend', '.env.example'), 
    Object.keys(requiredKeys).map(key => `${key}=`).join('\\n'));
  
  console.log('\\n✅ Environment files created:');
  console.log('   - backend/.env');
  console.log('   - frontend/.env.local');
  console.log('   - backend/.env.example');
}

function validateConfiguration(config) {
  console.log('\\n🔍 Validating Configuration...');
  
  const issues = [];
  
  // Check required keys
  for (const [keyName, keyConfig] of Object.entries(requiredKeys)) {
    if (keyConfig.required && !config[keyName]) {
      issues.push(`❌ Missing required key: ${keyName}`);
    }
  }
  
  // Check Google Drive setup
  if (config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET) {
    console.log('✅ Google Drive integration ready');
  } else {
    issues.push('⚠️  Google Drive integration incomplete');
  }
  
  // Check Discord setup
  if (config.DISCORD_BOT_TOKEN && config.DISCORD_CLIENT_ID) {
    console.log('✅ Discord bot integration ready');
  } else {
    issues.push('⚠️  Discord bot integration incomplete');
  }
  
  // Check Claude AI setup
  if (config.CLAUDE_API_KEY) {
    console.log('✅ Claude AI integration ready');
  } else {
    issues.push('⚠️  Claude AI integration incomplete');
  }
  
  return issues;
}

function displaySummary(config, issues) {
  console.log('\\n' + '='.repeat(60));
  console.log('🎯 LIF3 CONFIGURATION SUMMARY');
  console.log('='.repeat(60));
  
  console.log('\\n🔧 CORE INTEGRATIONS:');
  console.log(`   Database: ${config.DATABASE_URL ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   Redis: ${config.REDIS_URL ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   Google Drive: ${config.GOOGLE_CLIENT_ID ? '✅ Ready' : '❌ Missing'}`);
  console.log(`   Discord Bot: ${config.DISCORD_BOT_TOKEN ? '✅ Ready' : '❌ Missing'}`);
  console.log(`   Claude AI: ${config.CLAUDE_API_KEY ? '✅ Ready' : '❌ Missing'}`);
  
  console.log('\\n💰 FINANCIAL INTEGRATIONS:');
  console.log(`   FNB Bank: ${config.FNB_API_KEY ? '✅ Ready' : '⏭️  Optional'}`);
  console.log(`   Luno Crypto: ${config.LUNO_API_KEY ? '✅ Ready' : '⏭️  Optional'}`);
  console.log(`   Easy Equities: ${config.EASY_EQUITIES_API_KEY ? '✅ Ready' : '⏭️  Optional'}`);
  
  console.log('\\n🚀 DEPLOYMENT:');
  console.log(`   Railway: ${config.RAILWAY_TOKEN ? '✅ Ready' : '⏭️  Optional'}`);
  console.log(`   Vercel: ${config.VERCEL_TOKEN ? '✅ Ready' : '⏭️  Optional'}`);
  
  if (issues.length > 0) {
    console.log('\\n⚠️  ISSUES TO RESOLVE:');
    issues.forEach(issue => console.log(`   ${issue}`));
  } else {
    console.log('\\n🎉 ALL CONFIGURATIONS VALID!');
  }
  
  console.log('\\n📋 NEXT STEPS:');
  console.log('   1. Run: npm install (in both backend and frontend)');
  console.log('   2. Run: npm run db:setup (to initialize database)');
  console.log('   3. Run: npm run dev (to start development servers)');
  console.log('   4. Open: http://localhost:3000 (frontend dashboard)');
  console.log('   5. Check: http://localhost:3001/health (backend health)');
  
  console.log('\\n🎯 FRESH START JOURNEY:');
  console.log('   Net Worth: R0 → R1,800,000 (18 months)');
  console.log('   43V3R Business: R0 → R4,881 daily revenue');
  console.log('   Emergency Fund: R0 → R50,000 (90 days)');
  
  console.log('\\n='.repeat(60));
}

async function main() {
  try {
    // Create directories if they don't exist
    ['backend', 'frontend'].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    // Collect all configuration
    const config = await collectAllKeys();
    
    // Generate environment files
    generateEnvFiles(config);
    
    // Validate configuration
    const issues = validateConfiguration(config);
    
    // Display summary
    displaySummary(config, issues);
    
    // Save configuration summary
    fs.writeFileSync('lif3-config-summary.json', JSON.stringify({
      timestamp: new Date().toISOString(),
      config: Object.keys(config).reduce((acc, key) => {
        acc[key] = config[key] ? (requiredKeys[key]?.sensitive ? '[CONFIGURED]' : '✅') : '❌';
        return acc;
      }, {}),
      issues
    }, null, 2));
    
    console.log('\\n💾 Configuration saved to: lif3-config-summary.json');
    
  } catch (error) {
    console.error('\\n❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the setup
main();
```

## 🚀 INTEGRATION WITH MAIN SETUP

Add to package.json scripts:
```json
{
  \"scripts\": {
    \"setup\": \"node setup-api-keys.js\",
    \"setup:keys\": \"node setup-api-keys.js\",
    \"postsetup\": \"npm run db:setup && npm run test:connection\"
  }
}
```

## 🔧 USAGE INSTRUCTIONS

1. **Run the setup script**:
   ```bash
   cd ~/Development/LIF3/lif3-dashboard
   node setup-api-keys.js
   ```

2. **Follow prompts for each API key**
3. **Validate all connections**
4. **Start the application**

## 📋 API KEY ACQUISITION GUIDE

Create detailed instructions for obtaining each required API key:

### Google Drive API:
1. Go to https://console.cloud.google.com/
2. Create new project or select existing
3. Enable Google Drive API
4. Create OAuth2 credentials
5. Download client configuration

### Discord Bot:
1. Go to https://discord.com/developers/applications
2. Create new application
3. Go to Bot section
4. Create bot and copy token
5. Set appropriate permissions

### Claude AI:
1. Go to https://console.anthropic.com/
2. Create account or sign in
3. Generate API key
4. Copy key for configuration

### Banking APIs:
- Contact each bank for developer access
- Most South African banks require business accounts
- Alternative: Use CSV import for manual data

This interactive setup ensures all required credentials are collected before system activation, preventing runtime failures and ensuring complete functionality."
```