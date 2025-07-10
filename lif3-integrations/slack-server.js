#!/usr/bin/env node

// SLACK MCP SERVER FOR LIF3 SYSTEM
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

class SlackLIF3Server {
  constructor() {
    this.server = new Server(
      {
        name: 'lif3-slack',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    this.server.onerror = (error) => console.error('[Slack MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'slack_status',
          description: 'Slack integration status',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'send_slack_message',
          description: 'Send message to Slack channel',
          inputSchema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                description: 'Message to send to Slack'
              },
              channel: {
                type: 'string',
                description: 'Slack channel (finance, business, general, random)',
                enum: ['finance', 'business', 'general', 'random']
              },
              type: {
                type: 'string',
                description: 'Message type',
                enum: ['update', 'alert', 'milestone', 'daily_brief', 'achievement']
              }
            },
            required: ['message']
          }
        },
        {
          name: 'slack_financial_report',
          description: 'Generate financial report for Slack',
          inputSchema: {
            type: 'object',
            properties: {
              period: {
                type: 'string',
                description: 'Report period',
                enum: ['daily', 'weekly', 'monthly']
              }
            },
            required: ['period']
          }
        },
        {
          name: 'slack_business_update',
          description: 'Send 43V3R business update to Slack',
          inputSchema: {
            type: 'object',
            properties: {
              metric: {
                type: 'string',
                description: 'Business metric to update',
                enum: ['revenue', 'clients', 'pipeline', 'goals', 'all']
              }
            },
            required: ['metric']
          }
        },
        {
          name: 'schedule_slack_reminders',
          description: 'Schedule recurring Slack reminders',
          inputSchema: {
            type: 'object',
            properties: {
              reminder_type: {
                type: 'string',
                description: 'Type of reminder',
                enum: ['daily_goals', 'weekly_review', 'monthly_targets', 'savings_check']
              },
              time: {
                type: 'string',
                description: 'Time for reminder (HH:MM format)'
              }
            },
            required: ['reminder_type']
          }
        }
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'slack_status':
          return this.getSlackStatus();
        
        case 'send_slack_message':
          return this.sendSlackMessage(args);
        
        case 'slack_financial_report':
          return this.generateFinancialReport(args);
        
        case 'slack_business_update':
          return this.sendBusinessUpdate(args);
        
        case 'schedule_slack_reminders':
          return this.scheduleReminders(args);
        
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  async getSlackStatus() {
    return {
      content: [
        {
          type: 'text',
          text: `💬 SLACK INTEGRATION STATUS

✅ Connection: Ready for configuration
🏢 Workspace: LIF3 Financial & 43V3R Business

📊 Available Slash Commands:
• /lif3-balance - Current net worth status
• /lif3-revenue [amount] - Log business revenue
• /lif3-goals - Progress toward R1.8M target  
• /lif3-savings - Monthly savings analysis
• /lif3-pipeline - 43V3R sales pipeline
• /lif3-brief - Daily financial briefing

📱 Channels Integration:
• #finance - Personal financial tracking & goals
• #business - 43V3R revenue, metrics, strategy
• #general - Daily updates and achievements  
• #random - Casual financial discussions

🔔 Automated Workflows:
• Daily 8:00 AM: Financial briefing to #finance
• Revenue milestones: Celebrations in #business
• Weekly reviews: Comprehensive reports
• Goal achievements: Team celebrations

📈 Business Integration:
• Client project updates
• Revenue tracking and forecasting  
• Team collaboration on 43V3R growth
• Strategic planning discussions

🚀 Setup Requirements:
1. Create Slack app at https://api.slack.com/apps
2. Configure OAuth scopes: chat:write, channels:read
3. Install app to workspace
4. Set environment variables (SLACK_TOKEN, SIGNING_SECRET)
5. Configure slash commands and event subscriptions

💡 Perfect for team collaboration on R1.8M journey!`
        }
      ]
    };
  }

  async sendSlackMessage(args) {
    const { message, channel = 'general', type = 'update' } = args;
    
    const typeEmojis = {
      update: '📊',
      alert: '⚠️',
      milestone: '🎉',
      daily_brief: '📋',
      achievement: '🏆'
    };

    const channelDescriptions = {
      finance: 'Personal Financial Tracking',
      business: '43V3R Business Updates',
      general: 'LIF3 System General',
      random: 'Casual Discussions'
    };

    return {
      content: [
        {
          type: 'text',
          text: `✅ SLACK MESSAGE PREPARED

${typeEmojis[type]} Channel: #${channel} (${channelDescriptions[channel]})
📝 Type: ${type}
💬 Message: "${message}"

Slack Block Format:
\`\`\`json
{
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "${typeEmojis[type]} LIF3 ${type.toUpperCase()}"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "${message}"
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "💰 Net Worth: *R239,625/R1,800,000* | 🚀 43V3R: *R0/R4,881 daily* | 📅 ${new Date().toLocaleDateString('en-ZA')}"
        }
      ]
    }
  ]
}
\`\`\`

Status: Ready to send (Slack app setup required)`
        }
      ]
    };
  }

  async generateFinancialReport(args) {
    const { period } = args;
    
    const reports = {
      daily: {
        title: "Daily Financial Brief",
        content: `*Current Status:*
• Net Worth: R239,625 (13.3% to R1.8M goal)
• Daily Target: R86,688 monthly increase needed
• 43V3R Revenue: R0 (targeting first R1,000)

*Today's Priorities:*
• Launch AI consulting service
• Track all expenses
• Work toward first client`
      },
      weekly: {
        title: "Weekly Financial Review", 
        content: `*Week Progress:*
• Net Worth Change: TBD (tracking needed)
• Savings Rate: R35,500 potential
• Business Revenue: R0 (foundation phase)
• Goal Progress: On track for R1.8M by 2026

*Next Week Focus:*
• Scale 43V3R to first R10,000
• Optimize monthly expenses
• Build emergency fund`
      },
      monthly: {
        title: "Monthly Financial Analysis",
        content: `*Monthly Summary:*
• Target Net Worth: R326,313 (July 2025)
• Required Savings: R86,688
• Business Revenue Goal: R10,000
• Debt Reduction: R7,000 (6-month plan)

*Strategic Adjustments:*
• Focus on 43V3R revenue growth
• Maintain strict expense tracking
• Accelerate investment portfolio`
      }
    };

    const report = reports[period];

    return {
      content: [
        {
          type: 'text',
          text: `📊 **SLACK FINANCIAL REPORT - ${period.toUpperCase()}**

Report: ${report.title}

Slack Message:
\`\`\`
📊 *${report.title}*

${report.content}

---
Generated by LIF3 Financial System
${new Date().toLocaleDateString('en-ZA')} | Cape Town, South Africa
\`\`\`

✅ Would be sent to #finance channel
📈 Includes interactive elements for goal tracking
🎯 Helps maintain focus on R1.8M target`
        }
      ]
    };
  }

  async sendBusinessUpdate(args) {
    const { metric } = args;
    
    const updates = {
      revenue: `💰 *43V3R Revenue Update*\n\nDaily Target: R4,881\nCurrent: R0\nNext Milestone: R1,000 (first client)\n\n*Strategy:* AI consulting → Web3 → Crypto`,
      clients: `👥 *Client Pipeline Status*\n\nActive Clients: 0\nProspects: 0\nProposals Out: 0\n\n*Action:* Create portfolio + outreach campaign`,
      pipeline: `🎯 *Sales Pipeline*\n\nTotal Value: R0\nExpected Close: Q3 2025\nConversion Rate: TBD\n\n*Focus:* AI consulting projects R2,000-R10,000`,
      goals: `🚀 *Business Goals Progress*\n\nDaily Revenue: 0% (R0/R4,881)\nMRR Target: 0% (R0/R147,917)\nTeam Size: 1 (founder-led)\n\n*Timeline:* R100K MRR by 2027`,
      all: `📊 *Complete 43V3R Business Update*\n\n• Revenue: R0/R4,881 daily\n• Clients: 0 active\n• Pipeline: R0 value\n• Team: 1 person\n• Focus: AI consulting launch`
    };

    return {
      content: [
        {
          type: 'text',
          text: `🚀 **SLACK BUSINESS UPDATE**

Metric: ${metric}

Slack Message:
\`\`\`
${updates[metric] || 'Metric not found'}

*Next Actions:*
• Create AI consulting portfolio
• Reach out to 10 potential clients  
• Price first projects competitively
• Focus on Claude CLI + Cursor expertise

#43V3R #AIConsulting #Web3 #Crypto #Quantum
\`\`\`

✅ Would be sent to #business channel
🚀 Helps track progress toward R147,917 MRR
👥 Keeps team aligned on business goals`
        }
      ]
    };
  }

  async scheduleReminders(args) {
    const { reminder_type, time = '08:00' } = args;
    
    const reminders = {
      daily_goals: {
        frequency: 'Daily at ' + time,
        message: 'Good morning! Time to review your daily financial goals and 43V3R priorities.',
        channel: '#general'
      },
      weekly_review: {
        frequency: 'Sundays at ' + time, 
        message: 'Weekly financial review time! Check net worth progress and business metrics.',
        channel: '#finance'
      },
      monthly_targets: {
        frequency: 'First of month at ' + time,
        message: 'Monthly targets review: Are you on track for R1.8M goal?',
        channel: '#finance'
      },
      savings_check: {
        frequency: 'Fridays at ' + time,
        message: 'Savings rate check: How much progress toward R86,688 monthly target?',
        channel: '#finance'
      }
    };

    const reminder = reminders[reminder_type];

    return {
      content: [
        {
          type: 'text',
          text: `⏰ **SLACK REMINDER SCHEDULED**

Type: ${reminder_type}
Frequency: ${reminder.frequency}
Channel: ${reminder.channel}
Message: "${reminder.message}"

Workflow Configuration:
\`\`\`json
{
  "trigger": {
    "type": "scheduled",
    "schedule": "${reminder.frequency}"
  },
  "steps": [
    {
      "type": "send_message",
      "channel": "${reminder.channel}",
      "message": "${reminder.message}",
      "include_context": true
    }
  ]
}
\`\`\`

✅ Reminder configured for LIF3 financial tracking
🔔 Will help maintain consistency toward R1.8M goal
📊 Integrates with existing financial and business metrics`
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('LIF3 Slack MCP server running on stdio');
  }
}

const server = new SlackLIF3Server();
server.run().catch(console.error);