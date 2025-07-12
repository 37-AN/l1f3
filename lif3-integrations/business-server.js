#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';

const DAILY_REVENUE_TARGET = parseInt(process.env.DAILY_REVENUE_TARGET) || 4881;
const MRR_TARGET = parseInt(process.env.MRR_TARGET) || 147917;
const STRATEGY_FILE = './business_strategy.json';

class FourThreeV3RBusinessServer {
  constructor() {
    this.businessStrategy = null;
    this.server = new Server(
      {
        name: '43v3r-business',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    this.server.onerror = (error) => console.error('[43V3R Business MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });

    // Load strategy from file if exists
    if (fs.existsSync(STRATEGY_FILE)) {
      try {
        this.businessStrategy = JSON.parse(fs.readFileSync(STRATEGY_FILE, 'utf-8'));
      } catch (e) {
        this.businessStrategy = null;
      }
    }
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'business_dashboard',
          description: 'Get 43V3R business metrics and progress dashboard',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'log_revenue',
          description: 'Log daily business revenue in ZAR',
          inputSchema: {
            type: 'object',
            properties: {
              amount: { type: 'number', description: 'Revenue amount in ZAR' },
              source: { type: 'string', description: 'Revenue source' },
              description: { type: 'string', description: 'Revenue description' }
            },
            required: ['amount', 'source'],
          },
        },
        {
          name: 'track_mrr',
          description: 'Track Monthly Recurring Revenue progress',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'business_strategy',
          description: 'Get AI+Web3+Crypto+Quantum business strategy insights',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'update_business_strategy',
          description: 'Update the 43V3R business strategy (admin only)',
          inputSchema: {
            type: 'object',
            properties: {
              strategy: { type: 'object', description: 'Full business strategy object' }
            },
            required: ['strategy']
          }
        }
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'business_dashboard':
          return await this.getBusinessDashboard();
        case 'log_revenue':
          return await this.logRevenue(request.params.arguments);
        case 'track_mrr':
          return await this.trackMRR();
        case 'business_strategy':
          return await this.getBusinessStrategy();
        case 'update_business_strategy':
          return await this.updateBusinessStrategy(request.params.arguments);
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    });
  }

  async getBusinessDashboard() {
    return {
      content: [
        {
          type: 'text',
          text: `🚀 43V3R BUSINESS DASHBOARD

💰 REVENUE TARGETS:
• Daily Revenue Target: R${DAILY_REVENUE_TARGET.toLocaleString()}
• Current Daily Revenue: R0 (Foundation phase)
• Monthly Recurring Revenue Target: R${MRR_TARGET.toLocaleString()}
• Current MRR: R0 (Building pipeline)

🎯 BUSINESS SECTORS:
• 🤖 AI Development (40% focus): Consulting, automation, ML
• 🌐 Web3 Integration (25% focus): Blockchain, smart contracts
• 💎 Crypto Solutions (25% focus): DeFi, portfolio management
• ⚛️ Quantum Research (10% focus): Future-tech partnerships

📊 CURRENT STAGE: Foundation Building
• Market Research: In progress
• Service Offerings: Developing
• Client Pipeline: R0 (targeting first R1,000)
• Team Size: 1 (founder-led)

🔥 IMMEDIATE PRIORITIES:
1. Launch AI consulting service (R2,000-R10,000/project)
2. Establish Web3 integration partnerships
3. Build crypto advisory offerings
4. Research quantum computing opportunities

📈 GROWTH STRATEGY:
• Month 1-3: Establish AI consulting foundation
• Month 4-6: Add Web3 services, scale to R10,000/month
• Month 7-12: Launch crypto solutions, reach R50,000/month
• Year 2: Quantum partnerships, achieve R${MRR_TARGET.toLocaleString()} MRR

🎯 SUCCESS METRICS:
• Break-even: R1,000 daily revenue
• Growth phase: R2,500 daily revenue
• Scale phase: R${DAILY_REVENUE_TARGET.toLocaleString()} daily revenue (target)
• Sustainability: R${MRR_TARGET.toLocaleString()} MRR (ultimate goal)`
        }
      ]
    };
  }

  async logRevenue(args) {
    const amount = args.amount || 0;
    const source = args.source || 'Unknown';
    const description = args.description || '';
    
    const dailyProgress = ((amount / DAILY_REVENUE_TARGET) * 100).toFixed(1);
    
    return {
      content: [
        {
          type: 'text',
          text: `💰 43V3R REVENUE LOGGED!

✅ TRANSACTION DETAILS:
• Amount: R${amount.toLocaleString()}
• Source: ${source}
• Description: ${description}
• Date: ${new Date().toLocaleDateString('en-ZA')}

📊 DAILY PROGRESS:
• Today's Target: R${DAILY_REVENUE_TARGET.toLocaleString()}
• Progress: ${dailyProgress}%
• Remaining: R${Math.max(0, DAILY_REVENUE_TARGET - amount).toLocaleString()}

${amount >= DAILY_REVENUE_TARGET ? 
  '🎉 DAILY TARGET ACHIEVED! 🎉\n🚀 Building momentum toward MRR goal!' :
  `💪 Keep going! R${(DAILY_REVENUE_TARGET - amount).toLocaleString()} to daily target`
}

🎯 MRR IMPACT:
• Monthly projection: R${(amount * 30).toLocaleString()}
• MRR progress: ${((amount * 30) / MRR_TARGET * 100).toFixed(1)}%`
        }
      ]
    };
  }

  async trackMRR() {
    return {
      content: [
        {
          type: 'text',
          text: `📈 43V3R MRR TRACKING

🎯 MRR GOAL: R${MRR_TARGET.toLocaleString()}
📊 Current MRR: R0 (Foundation stage)
📅 Target Timeline: 12 months

💡 MRR BUILDING STRATEGY:

🔄 RECURRING REVENUE STREAMS:
1. 🤖 AI Consulting Retainers
   • Target: R15,000/month per client
   • Goal: 10 clients = R150,000 MRR

2. 🌐 Web3 Service Subscriptions  
   • Target: R5,000/month per client
   • Goal: 5 clients = R25,000 MRR

3. 💎 Crypto Portfolio Management
   • Target: R2,000/month per client
   • Goal: 15 clients = R30,000 MRR

4. ⚛️ Quantum Research Licensing
   • Target: R10,000/month ongoing
   • Goal: 2 partnerships = R20,000 MRR

📊 MILESTONES:
• Month 3: R10,000 MRR (First retainer clients)
• Month 6: R50,000 MRR (Service scaling)
• Month 9: R100,000 MRR (Portfolio expansion)
• Month 12: R${MRR_TARGET.toLocaleString()} MRR (Target achieved!)

🚀 NEXT ACTIONS:
1. Convert first consulting project to retainer
2. Develop subscription service offering
3. Build recurring client pipeline
4. Establish long-term partnerships`
        }
      ]
    };
  }

  async getBusinessStrategy() {
    if (this.businessStrategy) {
      return {
        content: [
          {
            type: 'text',
            text: `🧠 43V3R STRATEGIC ANALYSIS (Current Strategy)

${JSON.stringify(this.businessStrategy, null, 2)}`
          }
        ]
      };
    } else {
      return {
        content: [
          {
            type: 'text',
            text: `🧠 43V3R STRATEGIC ANALYSIS (No Strategy Loaded)

Please update the business strategy using the 'update_business_strategy' tool.`
          }
        ]
      };
    }
  }

  async updateBusinessStrategy(args) {
    try {
      if (!args.strategy) throw new Error('Missing strategy');
      this.businessStrategy = args.strategy;
      fs.writeFileSync(STRATEGY_FILE, JSON.stringify(args.strategy, null, 2));
      return { content: [{ type: 'text', text: 'Business strategy updated successfully.' }] };
    } catch (e) {
      return { content: [{ type: 'text', text: `Failed to update business strategy: ${e.message}` }] };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('43V3R Business MCP server running on stdio');
  }
}

const server = new FourThreeV3RBusinessServer();
server.run().catch(console.error);
