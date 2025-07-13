#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const CURRENT_NET_WORTH = parseInt(process.env.CURRENT_NET_WORTH) || 239625;
const TARGET_NET_WORTH = parseInt(process.env.TARGET_NET_WORTH) || 1800000;

class LIF3FinancialServer {
  constructor() {
    this.server = new Server(
      {
        name: 'lif3-financial',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[LIF3 Financial MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'net_worth_progress',
          description: 'Get current net worth progress toward R1,800,000 goal',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'log_transaction',
          description: 'Log a financial transaction in ZAR',
          inputSchema: {
            type: 'object',
            properties: {
              amount: { type: 'number', description: 'Transaction amount in ZAR' },
              description: { type: 'string', description: 'Transaction description' },
              category: { type: 'string', description: 'Transaction category' },
              type: { type: 'string', enum: ['income', 'expense'], description: 'Transaction type' }
            },
            required: ['amount', 'description', 'type'],
          },
        },
        {
          name: 'calculate_savings_rate',
          description: 'Calculate required monthly savings rate for R1.8M goal',
          inputSchema: {
            type: 'object',
            properties: {
              timeline_months: { type: 'number', description: 'Timeline in months' }
            },
          },
        },
        {
          name: 'milestone_progress',
          description: 'Track progress toward specific financial milestones',
          inputSchema: {
            type: 'object',
            properties: {
              milestone: { type: 'number', description: 'Milestone amount in ZAR' }
            },
          },
        }
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'net_worth_progress':
          return await this.getNetWorthProgress();
        case 'log_transaction':
          return await this.logTransaction(request.params.arguments);
        case 'calculate_savings_rate':
          return await this.calculateSavingsRate(request.params.arguments);
        case 'milestone_progress':
          return await this.getMilestoneProgress(request.params.arguments);
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    });
  }

  async getNetWorthProgress() {
    const progress = ((CURRENT_NET_WORTH / TARGET_NET_WORTH) * 100).toFixed(1);
    const remaining = TARGET_NET_WORTH - CURRENT_NET_WORTH;
    const monthlyRequired = Math.round(remaining / 18);
    
    return {
      content: [
        {
          type: 'text',
          text: `💰 LIF3 NET WORTH PROGRESS

📊 Current Status:
• Current Net Worth: R${CURRENT_NET_WORTH.toLocaleString()}
• Target Net Worth: R${TARGET_NET_WORTH.toLocaleString()}
• Progress: ${progress}% (${CURRENT_NET_WORTH >= TARGET_NET_WORTH ? '🎉 GOAL ACHIEVED!' : `R${remaining.toLocaleString()} remaining`})

🎯 Timeline Analysis:
• Target Timeline: 18 months
• Required Monthly Increase: R${monthlyRequired.toLocaleString()}
• Current Monthly Capacity: R35,500 (based on savings rate)

📈 Milestone Breakdown:
• Emergency Fund (R300K): ${CURRENT_NET_WORTH >= 300000 ? '✅' : `${((CURRENT_NET_WORTH/300000)*100).toFixed(1)}%`}
• Investment Base (R500K): ${CURRENT_NET_WORTH >= 500000 ? '✅' : `${((CURRENT_NET_WORTH/500000)*100).toFixed(1)}%`}
• First Million (R1M): ${CURRENT_NET_WORTH >= 1000000 ? '✅' : `${((CURRENT_NET_WORTH/1000000)*100).toFixed(1)}%`}
• Ultimate Goal (R1.8M): ${progress}%

🚀 Strategy: 43V3R business growth + IT career advancement + smart investments

💡 Next Actions:
1. Scale 43V3R to R4,881 daily revenue
2. Increase IT salary by R20,000 annually
3. Optimize investment portfolio returns
4. Maintain R35,500 monthly savings rate`
        }
      ]
    };
  }

  async logTransaction(args) {
    const amount = args.amount || 0;
    const description = args.description || '';
    const category = args.category || 'General';
    const type = args.type || 'expense';
    
    const impact = (Math.abs(amount) / (TARGET_NET_WORTH - CURRENT_NET_WORTH)) * 100;
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ TRANSACTION LOGGED

💰 Amount: R${Math.abs(amount).toLocaleString()}
📝 Description: ${description}
📊 Type: ${type.toUpperCase()}
🏷️ Category: ${category}
📅 Date: ${new Date().toLocaleDateString('en-ZA')}

🎯 Impact Analysis:
• Impact on R1.8M goal: ${type === 'income' ? '+' : '-'}${impact.toFixed(3)}%
• Remaining to goal: R${(TARGET_NET_WORTH - CURRENT_NET_WORTH).toLocaleString()}
• Monthly target: R${Math.round((TARGET_NET_WORTH - CURRENT_NET_WORTH) / 18).toLocaleString()}

${type === 'income' ? '📈 Income boost toward goal!' : '📉 Expense tracked - optimize spending!'}`
        }
      ]
    };
  }

  async calculateSavingsRate(args) {
    const months = args.timeline_months || 18;
    const monthlyNeeded = Math.round((TARGET_NET_WORTH - CURRENT_NET_WORTH) / months);
    const currentIncome = 96250; // R1.155M salary / 12
    const requiredRate = ((monthlyNeeded / currentIncome) * 100).toFixed(1);
    
    return {
      content: [
        {
          type: 'text',
          text: `📊 SAVINGS RATE ANALYSIS

🎯 Goal: R${TARGET_NET_WORTH.toLocaleString()} in ${months} months
💰 Current: R${CURRENT_NET_WORTH.toLocaleString()}
📈 Required Monthly Savings: R${monthlyNeeded.toLocaleString()}
📊 Required Savings Rate: ${requiredRate}%

💡 INCOME STRATEGY BREAKDOWN:
1. 43V3R Business Revenue (40%): R${Math.round(monthlyNeeded * 0.4).toLocaleString()}/month
2. IT Career Growth (30%): R${Math.round(monthlyNeeded * 0.3).toLocaleString()}/month
3. Investment Returns (20%): R${Math.round(monthlyNeeded * 0.2).toLocaleString()}/month
4. Expense Optimization (10%): R${Math.round(monthlyNeeded * 0.1).toLocaleString()}/month

🚀 ACTIONABLE STEPS:
1. Scale 43V3R to R${Math.round(monthlyNeeded * 0.4).toLocaleString()}/month through AI consulting
2. Negotiate IT salary increase of R${Math.round(monthlyNeeded * 0.3 * 12).toLocaleString()}/year
3. Optimize investment portfolio for 8-12% returns
4. Reduce monthly expenses by R${Math.round(monthlyNeeded * 0.1).toLocaleString()}

${requiredRate > 50 ? '⚠️ Aggressive rate - consider income acceleration' : '✅ Achievable with focused execution'}

🎯 MILESTONE TRACKING:
• Month 6: R${(CURRENT_NET_WORTH + (monthlyNeeded * 6)).toLocaleString()}
• Month 12: R${(CURRENT_NET_WORTH + (monthlyNeeded * 12)).toLocaleString()}
• Month 18: R${TARGET_NET_WORTH.toLocaleString()} (GOAL ACHIEVED!)`
        }
      ]
    };
  }

  async getMilestoneProgress(args) {
    const milestone = args.milestone || 300000;
    const progress = ((CURRENT_NET_WORTH / milestone) * 100).toFixed(1);
    const remaining = milestone - CURRENT_NET_WORTH;
    
    return {
      content: [
        {
          type: 'text',
          text: `🎯 MILESTONE: R${milestone.toLocaleString()}

📊 Progress: ${progress}%
💰 Current: R${CURRENT_NET_WORTH.toLocaleString()}
📈 Remaining: R${remaining.toLocaleString()}

${CURRENT_NET_WORTH >= milestone ? 
  '🎉 MILESTONE ACHIEVED! 🎉\nTime to set the next target!' :
  `📅 Estimated timeline: ${Math.ceil(remaining / 86667)} months\n💪 Monthly target: R${Math.ceil(remaining / Math.ceil(remaining / 86667)).toLocaleString()}`
}

🏆 Next milestone: R${milestone >= TARGET_NET_WORTH ? 'Goal achieved!' : Math.min(milestone * 1.5, TARGET_NET_WORTH).toLocaleString()}`
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('LIF3 Financial MCP server running on stdio');
  }
}

const server = new LIF3FinancialServer();
server.run().catch(console.error);
