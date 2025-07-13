#!/usr/bin/env node

// COMPLETE SLACK APP FOR LIF3 SYSTEM WITH ALL MANIFEST COMMANDS
import { App } from '@slack/bolt';
import { config } from 'dotenv';

config();

class LIF3SlackAppComplete {
  constructor() {
    this.app = new App({
      token: process.env.SLACK_BOT_TOKEN,
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      socketMode: true,
      appToken: process.env.SLACK_APP_TOKEN,
      port: process.env.PORT || 3000
    });

    this.setupCommands();
    this.setupEvents();
    this.setupInteractions();
    this.scheduleAutomation();
  }

  setupCommands() {
    // Financial balance command
    this.app.command('/lif3-balance', async ({ command, ack, respond }) => {
      await ack();

      const blocks = [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '💰 LIF3 Financial Balance'
          }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: '*Current Net Worth:*\nR239,625' },
            { type: 'mrkdwn', text: '*Target Goal:*\nR1,800,000' },
            { type: 'mrkdwn', text: '*Progress:*\n13.3% complete' },
            { type: 'mrkdwn', text: '*Remaining:*\nR1,560,375' }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '📈 *Monthly Target:* R86,688 increase needed\n🎯 *Timeline:* 18 months to goal\n💡 *Strategy:* Scale 43V3R business + smart investments'
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'View Goals' },
              action_id: 'view_goals',
              style: 'primary'
            },
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Log Revenue' },
              action_id: 'log_revenue'
            }
          ]
        }
      ];

      await respond({ blocks });
    });

    // Revenue logging command
    this.app.command('/lif3-revenue', async ({ command, ack, respond }) => {
      await ack();

      const args = command.text.trim().split(' ');
      const amount = parseFloat(args[0]) || 0;
      const description = args.slice(1).join(' ') || 'Business revenue';
      
      if (amount > 0) {
        const progressPercent = ((amount / 4881) * 100).toFixed(1);
        
        const blocks = [
          {
            type: 'header',
            text: { type: 'plain_text', text: '💰 43V3R Revenue Logged!' }
          },
          {
            type: 'section',
            fields: [
              { type: 'mrkdwn', text: `*Amount:*\nR${amount.toLocaleString()}` },
              { type: 'mrkdwn', text: `*Description:*\n${description}` },
              { type: 'mrkdwn', text: '*Daily Target:*\nR4,881' },
              { type: 'mrkdwn', text: `*Today's Progress:*\n${progressPercent}%` }
            ]
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: amount >= 1000 ? 
                '🎉 Excellent! You\'re building momentum toward R147,917 MRR!' :
                '🚀 Great start! Keep building toward your first R1,000 milestone!'
            }
          }
        ];

        await respond({ blocks });
      } else {
        await respond({
          text: '💡 Usage: `/lif3-revenue [amount] [description]`\nExample: `/lif3-revenue 2000 AI consulting project`'
        });
      }
    });

    // Goals progress command
    this.app.command('/lif3-goals', async ({ command, ack, respond }) => {
      await ack();

      const blocks = [
        {
          type: 'header',
          text: { type: 'plain_text', text: '🎯 LIF3 Goals Progress' }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Financial Goals:*\n💰 Net Worth R1.8M - 13.3% complete\n🚭 Quit Smoking - Health + R2,000 savings\n🏠 Own House - R1,000,000 target\n🚗 Get Car - R200,000 budget'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Business Goals:*\n🚀 43V3R R100K MRR - 0% (Foundation phase)\n🎓 Advanced Diploma - Computer Engineering\n💻 Remote Job - High-paying IT position\n❤️ Help Parents - R50,000 support fund'
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Milestone Progress' },
              action_id: 'milestone_progress'
            },
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Business Dashboard' },
              action_id: 'business_dashboard'
            }
          ]
        }
      ];

      await respond({ blocks });
    });

    // Savings analysis command
    this.app.command('/lif3-savings', async ({ command, ack, respond }) => {
      await ack();

      const blocks = [
        {
          type: 'header',
          text: { type: 'plain_text', text: '💸 LIF3 Savings Analysis' }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: '*Required Monthly:*\nR86,688' },
            { type: 'mrkdwn', text: '*Current Capacity:*\nR35,500' },
            { type: 'mrkdwn', text: '*Monthly Shortfall:*\nR51,188' },
            { type: 'mrkdwn', text: '*Solution:*\nScale 43V3R' }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '📈 *Revenue Strategy:* AI Consulting → R10K → R50K → R100K monthly\n🎯 *Timeline:* Business success = faster R1.8M achievement\n💡 *Focus:* 80% energy on revenue generation'
          }
        }
      ];

      await respond({ blocks });
    });

    // Daily briefing command
    this.app.command('/lif3-brief', async ({ command, ack, respond }) => {
      await ack();

      const today = new Date().toLocaleDateString('en-ZA', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });

      const blocks = [
        {
          type: 'header',
          text: { type: 'plain_text', text: '📋 Daily LIF3 Briefing' }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${today}*\n\n💰 *Financial Status:* R239,625 → R1,800,000 (13.3%)\n🎯 *Today's Priority:* Launch AI consulting → First R2,000 project\n🚀 *43V3R Focus:* Portfolio creation • Prospect outreach • Competitive pricing`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '💡 *Key Advantage:* Claude CLI + Cursor expertise\n📊 *Success Metric:* Progress toward first R1,000 revenue\n💸 *Expense Watch:* Track all spending • Budget discipline'
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Log Today\'s Progress' },
              action_id: 'log_progress',
              style: 'primary'
            }
          ]
        }
      ];

      await respond({ blocks });
    });

    // Business dashboard command
    this.app.command('/lif3-business', async ({ command, ack, respond }) => {
      await ack();

      const blocks = [
        {
          type: 'header',
          text: { type: 'plain_text', text: '🚀 43V3R Business Dashboard' }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*AI + Web3 + Crypto + Quantum Technology Company*'
          }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: '*Daily Revenue:*\nR0 / R4,881 target' },
            { type: 'mrkdwn', text: '*Monthly Recurring:*\nR0 / R147,917 target' },
            { type: 'mrkdwn', text: '*Current Stage:*\nFoundation Building' },
            { type: 'mrkdwn', text: '*Focus Distribution:*\n40% AI • 25% Web3 • 25% Crypto • 10% Quantum' }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '🎯 *Immediate Goals:*\n• Create AI consulting portfolio\n• Land first 3 clients at R2K-R10K\n• Establish Web3 partnerships\n• Build crypto advisory services'
          }
        }
      ];

      await respond({ blocks });
    });

    // Expense logging command
    this.app.command('/lif3-expense', async ({ command, ack, respond }) => {
      await ack();

      const args = command.text.trim().split(' ');
      const amount = parseFloat(args[0]) || 0;
      const category = args[1] || 'general';
      const description = args.slice(2).join(' ') || 'Expense logged';

      if (amount > 0) {
        const blocks = [
          {
            type: 'header',
            text: { type: 'plain_text', text: '💸 Expense Logged' }
          },
          {
            type: 'section',
            fields: [
              { type: 'mrkdwn', text: `*Amount:*\n-R${amount.toLocaleString()}` },
              { type: 'mrkdwn', text: `*Category:*\n${category}` },
              { type: 'mrkdwn', text: `*Description:*\n${description}` },
              { type: 'mrkdwn', text: '*Status:*\n✅ Tracked' }
            ]
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: amount > 5000 ? 
                '⚠️ Large expense detected! Review budget impact.' :
                '📊 Expense tracked. Stay disciplined on your R1.8M journey!'
            }
          }
        ];

        await respond({ blocks });
      } else {
        await respond({
          text: '💡 Usage: `/lif3-expense [amount] [category] [description]`\nExample: `/lif3-expense 500 food groceries for the week`'
        });
      }
    });

    // Milestone progress command
    this.app.command('/lif3-milestone', async ({ command, ack, respond }) => {
      await ack();

      const milestones = [
        { target: 500000, name: 'Emergency Fund', progress: 47.9 },
        { target: 1000000, name: 'First Million', progress: 24.0 },
        { target: 1800000, name: 'Ultimate Goal', progress: 13.3 }
      ];

      const blocks = [
        {
          type: 'header',
          text: { type: 'plain_text', text: '🏆 Milestone Progress' }
        },
        ...milestones.map(milestone => ({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${milestone.name}* (R${(milestone.target / 1000).toFixed(0)}K)\n${'█'.repeat(Math.floor(milestone.progress / 5))}${'░'.repeat(20 - Math.floor(milestone.progress / 5))} ${milestone.progress}%`
          }
        })),
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '🎯 *Next Milestone:* R500,000 Emergency Fund\n📈 *Strategy:* Focus on 43V3R revenue growth'
          }
        }
      ];

      await respond({ blocks });
    });
  }

  setupEvents() {
    // Handle button interactions
    this.app.action('view_goals', async ({ ack, client, body }) => {
      await ack();
      // Trigger goals command
      await this.app.command('/lif3-goals').callback({
        command: { text: '' }, 
        ack: async () => {}, 
        respond: async (msg) => {
          await client.chat.postMessage({
            channel: body.channel.id,
            ...msg
          });
        }
      });
    });

    this.app.action('log_revenue', async ({ ack, body, client }) => {
      await ack();
      
      await client.views.open({
        trigger_id: body.trigger_id,
        view: {
          type: 'modal',
          callback_id: 'revenue_modal',
          title: { type: 'plain_text', text: '💰 Log 43V3R Revenue' },
          submit: { type: 'plain_text', text: 'Log Revenue' },
          blocks: [
            {
              type: 'input',
              block_id: 'amount_block',
              element: {
                type: 'number_input',
                action_id: 'amount_input',
                placeholder: { type: 'plain_text', text: '2000' }
              },
              label: { type: 'plain_text', text: 'Revenue Amount (ZAR)' }
            },
            {
              type: 'input',
              block_id: 'description_block',
              element: {
                type: 'plain_text_input',
                action_id: 'description_input',
                placeholder: { type: 'plain_text', text: 'AI consulting project' }
              },
              label: { type: 'plain_text', text: 'Revenue Description' },
              optional: true
            }
          ]
        }
      });
    });

    // Handle modal submissions
    this.app.view('revenue_modal', async ({ ack, body, view, client }) => {
      await ack();

      const amount = view.state.values.amount_block.amount_input.value;
      const description = view.state.values.description_block.description_input.value || 'Business revenue';

      await client.chat.postMessage({
        channel: body.user.id,
        text: `✅ Revenue logged: R${amount} - ${description}\n🚀 Great progress toward your R4,881 daily target!`
      });
    });

    // Welcome new team members
    this.app.event('team_join', async ({ event, client }) => {
      await client.chat.postMessage({
        channel: event.user.id,
        blocks: [
          {
            type: 'header',
            text: { type: 'plain_text', text: '🎉 Welcome to LIF3!' }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'Your financial journey to R1.8M starts here!\n\n💡 Try `/lif3-brief` to get started\n📊 Use `/lif3-balance` to see your progress\n🚀 Log revenue with `/lif3-revenue`'
            }
          }
        ]
      });
    });
  }

  setupInteractions() {
    // Handle app mentions
    this.app.event('app_mention', async ({ event, client }) => {
      await client.chat.postMessage({
        channel: event.channel,
        text: `Hi <@${event.user}>! 👋\n\nI'm your LIF3 Financial Assistant. Here's what I can help you with:\n\n💰 \`/lif3-balance\` - Check your progress to R1.8M\n🚀 \`/lif3-revenue\` - Log 43V3R business revenue\n🎯 \`/lif3-goals\` - View all your goals\n📋 \`/lif3-brief\` - Get your daily briefing\n\nLet's build your wealth together! 🎯`
      });
    });
  }

  scheduleAutomation() {
    // Daily morning briefing at 8:00 AM Cape Town time
    setInterval(() => {
      const now = new Date();
      const capeTownTime = new Intl.DateTimeFormat('en-ZA', {
        timeZone: 'Africa/Johannesburg',
        hour: '2-digit',
        minute: '2-digit'
      }).format(now);

      if (capeTownTime === '08:00') {
        this.sendDailyBriefing();
      }
    }, 60000);

    // Weekly review on Sundays at 6:00 PM
    setInterval(() => {
      const now = new Date();
      const capeTownTime = new Intl.DateTimeFormat('en-ZA', {
        timeZone: 'Africa/Johannesburg',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit'
      }).format(now);

      if (capeTownTime.includes('Sunday') && capeTownTime.includes('18:00')) {
        this.sendWeeklyReview();
      }
    }, 60000);
  }

  async sendDailyBriefing() {
    try {
      const result = await this.app.client.conversations.list({ types: 'public_channel' });
      const channel = result.channels.find(ch => 
        ch.name === 'finance' || ch.name === 'financial' || ch.name === 'general'
      );

      if (channel) {
        await this.app.client.chat.postMessage({
          channel: channel.id,
          blocks: [
            {
              type: 'header',
              text: { type: 'plain_text', text: '🌅 Good Morning! Daily LIF3 Briefing' }
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '💰 *Net Worth Journey:* R239,625 → R1,800,000 (13.3%)\n🎯 *Today\'s Mission:* Launch AI consulting • Secure first client\n🚀 *43V3R Focus:* Portfolio • Prospects • R2K-R10K projects\n💡 *Advantage:* Claude CLI + Cursor expertise'
              }
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: { type: 'plain_text', text: 'View Goals' },
                  action_id: 'view_goals'
                },
                {
                  type: 'button',
                  text: { type: 'plain_text', text: 'Log Revenue' },
                  action_id: 'log_revenue',
                  style: 'primary'
                }
              ]
            }
          ]
        });
        console.log('📋 Daily briefing sent to Slack!');
      }
    } catch (error) {
      console.error('❌ Error sending daily briefing:', error);
    }
  }

  async sendWeeklyReview() {
    try {
      const result = await this.app.client.conversations.list({ types: 'public_channel' });
      const channel = result.channels.find(ch => 
        ch.name === 'finance' || ch.name === 'financial' || ch.name === 'general'
      );

      if (channel) {
        await this.app.client.chat.postMessage({
          channel: channel.id,
          blocks: [
            {
              type: 'header',
              text: { type: 'plain_text', text: '📊 Weekly LIF3 Review' }
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '*This Week\'s Focus:*\n💰 Net Worth progress tracking\n🚀 43V3R revenue generation\n📈 Goal milestone reviews\n💸 Expense optimization'
              }
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '*Next Week Priorities:*\n🎯 Scale to first R10,000\n💡 Expand client pipeline\n🏗️ Build emergency fund\n📊 Optimize all systems'
              }
            }
          ]
        });
        console.log('📊 Weekly review sent to Slack!');
      }
    } catch (error) {
      console.error('❌ Error sending weekly review:', error);
    }
  }

  async start() {
    try {
      await this.app.start();
      console.log('✅ LIF3 Slack app is running!');
      console.log('🎯 Tracking your R239,625 → R1,800,000 journey!');
      console.log('💡 All slash commands are ready to use!');
    } catch (error) {
      console.error('❌ Error starting Slack app:', error);
    }
  }
}

// Start the app if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = new LIF3SlackAppComplete();
  app.start();
}

export default LIF3SlackAppComplete;