#!/usr/bin/env node

// STANDALONE SLACK APP FOR LIF3 SYSTEM
// This runs independently and communicates with LIF3 MCP servers

import { App } from '@slack/bolt';
import { config } from 'dotenv';

config();

class LIF3SlackApp {
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
    this.scheduleReminders();
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
            {
              type: 'mrkdwn',
              text: '*Net Worth:*\nR239,625'
            },
            {
              type: 'mrkdwn', 
              text: '*Target:*\nR1,800,000'
            },
            {
              type: 'mrkdwn',
              text: '*Progress:*\n13.3%'
            },
            {
              type: 'mrkdwn',
              text: '*Remaining:*\nR1,560,375'
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '📈 *Monthly target:* R86,688 increase needed\n🎯 *Timeline:* 18 months to goal\n💡 *Strategy:* Scale 43V3R business revenue'
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Updated: ${new Date().toLocaleDateString('en-ZA')} | LIF3 Financial System`
            }
          ]
        }
      ];

      await respond({ blocks });
    });

    // Revenue logging command
    this.app.command('/lif3-revenue', async ({ command, ack, respond }) => {
      await ack();

      const amount = parseFloat(command.text) || 0;
      
      if (amount > 0) {
        // Log revenue
        const blocks = [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '💰 43V3R Revenue Logged!'
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Amount:*\nR${amount.toLocaleString()}`
              },
              {
                type: 'mrkdwn',
                text: '*Daily Target:*\nR4,881'
              },
              {
                type: 'mrkdwn',
                text: `*Progress:*\n${((amount / 4881) * 100).toFixed(1)}%`
              },
              {
                type: 'mrkdwn',
                text: '*Status:*\n✅ Logged'
              }
            ]
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '🚀 Great work! Every Rand counts toward your R147,917 MRR goal.'
            }
          }
        ];

        await respond({ blocks });
      } else {
        // Show revenue status
        const blocks = [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '🚀 43V3R Revenue Status'
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: '*Daily Target:*\nR4,881'
              },
              {
                type: 'mrkdwn',
                text: '*Current:*\nR0'
              },
              {
                type: 'mrkdwn',
                text: '*MRR Target:*\nR147,917'
              },
              {
                type: 'mrkdwn',
                text: '*Current MRR:*\nR0'
              }
            ]
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '🎯 *Next Goal:* Land first R1,000 from AI consulting\n💡 *Strategy:* AI → Web3 → Crypto → Quantum'
            }
          }
        ];

        await respond({ blocks });
      }
    });

    // Goals command
    this.app.command('/lif3-goals', async ({ command, ack, respond }) => {
      await ack();

      const blocks = [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🎯 LIF3 Goals Progress'
          }
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
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: 'Every step counts toward your R1.8M goal! 🎯'
            }
          ]
        }
      ];

      await respond({ blocks });
    });

    // Daily briefing command
    this.app.command('/lif3-brief', async ({ command, ack, respond }) => {
      await ack();

      const today = new Date().toLocaleDateString('en-ZA', {
        weekday: 'long',
        year: 'numeric', 
        month: 'long',
        day: 'numeric'
      });

      const blocks = [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📋 Daily LIF3 Briefing'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${today}*\n\n💰 *Current Net Worth:* R239,625 (13.3% to goal)\n🎯 *Today's Priority:* Launch AI consulting, get first client\n🚀 *43V3R Focus:* Create portfolio, R2,000-R10,000 projects`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '💸 *Expense Watch:* Track all spending, stay under budget\n📈 *Opportunity:* Market AI expertise with Claude CLI\n💡 *Reminder:* Every action builds toward R1.8M'
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Log Revenue'
              },
              action_id: 'log_revenue',
              style: 'primary'
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Check Goals'
              },
              action_id: 'check_goals'
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
          text: {
            type: 'plain_text',
            text: '💸 Savings Analysis'
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: '*Required Monthly:*\nR86,688'
            },
            {
              type: 'mrkdwn',
              text: '*Current Capacity:*\nR35,500'
            },
            {
              type: 'mrkdwn',
              text: '*Shortfall:*\nR51,188'
            },
            {
              type: 'mrkdwn',
              text: '*Solution:*\nScale 43V3R'
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '📈 *Strategy:* AI Consulting → R10K/month → R50K/month\n🎯 *Timeline:* 18 months to R1.8M (accelerated with 43V3R)\n💡 *Focus:* Revenue growth to close the gap!'
          }
        }
      ];

      await respond({ blocks });
    });
  }

  setupEvents() {
    // Handle button interactions
    this.app.action('log_revenue', async ({ ack, body, client }) => {
      await ack();

      // Open modal for revenue logging
      await client.views.open({
        trigger_id: body.trigger_id,
        view: {
          type: 'modal',
          callback_id: 'revenue_modal',
          title: {
            type: 'plain_text',
            text: '💰 Log Revenue'
          },
          submit: {
            type: 'plain_text',
            text: 'Log'
          },
          blocks: [
            {
              type: 'input',
              block_id: 'amount_block',
              element: {
                type: 'number_input',
                action_id: 'amount_input',
                placeholder: {
                  type: 'plain_text',
                  text: 'Enter amount in ZAR'
                }
              },
              label: {
                type: 'plain_text',
                text: 'Revenue Amount'
              }
            },
            {
              type: 'input',
              block_id: 'description_block',
              element: {
                type: 'plain_text_input',
                action_id: 'description_input',
                placeholder: {
                  type: 'plain_text',
                  text: 'AI consulting project, client payment, etc.'
                }
              },
              label: {
                type: 'plain_text',
                text: 'Description'
              },
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
      const description = view.state.values.description_block.description_input.value || 'Revenue logged';

      // Post confirmation message
      await client.chat.postMessage({
        channel: body.user.id,
        text: `✅ Revenue logged: R${amount} - ${description}`
      });
    });

    // Welcome new members
    this.app.event('team_join', async ({ event, client }) => {
      await client.chat.postMessage({
        channel: event.user.id,
        text: `Welcome to LIF3! 🎉\n\nYour journey to R1.8M starts here. Use /lif3-brief to get started!`
      });
    });
  }

  scheduleReminders() {
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
      const result = await this.app.client.conversations.list({
        types: 'public_channel'
      });

      const channel = result.channels.find(ch => ch.name === 'finance') || 
                     result.channels.find(ch => ch.name === 'general');

      if (channel) {
        await this.app.client.chat.postMessage({
          channel: channel.id,
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: '🌅 Good Morning! Daily LIF3 Briefing'
              }
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '💰 *Net Worth Progress:* R239,625 → R1,800,000 (13.3%)\n🎯 *Today\'s Goal:* Launch AI consulting, secure first client\n🚀 *43V3R Focus:* Create portfolio, reach out to prospects\n💡 *Opportunity:* Leverage Claude CLI + Cursor expertise'
              }
            },
            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: 'Make today count! Every action builds toward R1.8M 🎯'
                }
              ]
            }
          ]
        });

        console.log('📋 Daily briefing sent to Slack successfully!');
      }
    } catch (error) {
      console.error('❌ Error sending daily briefing:', error);
    }
  }

  async sendWeeklyReview() {
    try {
      const result = await this.app.client.conversations.list({
        types: 'public_channel'
      });

      const channel = result.channels.find(ch => ch.name === 'finance') || 
                     result.channels.find(ch => ch.name === 'general');

      if (channel) {
        await this.app.client.chat.postMessage({
          channel: channel.id,
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: '📊 Weekly LIF3 Review'
              }
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '*This Week\'s Progress:*\n💰 Net Worth: Track changes\n🚀 43V3R Revenue: Log all income\n📈 Goals: Review milestones\n💸 Expenses: Analyze patterns'
              }
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '*Next Week Focus:*\n🎯 Scale to first R10,000\n💡 Optimize monthly expenses\n🏗️ Build emergency fund\n📊 Track everything in LIF3'
              }
            }
          ]
        });

        console.log('📊 Weekly review sent to Slack successfully!');
      }
    } catch (error) {
      console.error('❌ Error sending weekly review:', error);
    }
  }

  async start() {
    try {
      await this.app.start();
      console.log('✅ LIF3 Slack app is running!');
    } catch (error) {
      console.error('❌ Error starting Slack app:', error);
    }
  }
}

// Start the app if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = new LIF3SlackApp();
  app.start();
}

export default LIF3SlackApp;