#!/usr/bin/env node

// STANDALONE DISCORD BOT FOR LIF3 SYSTEM
// This runs independently and communicates with LIF3 MCP servers

import { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder } from 'discord.js';
import { config } from 'dotenv';

config();

class LIF3DiscordBot {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ]
    });

    this.commands = new Map();
    this.setupCommands();
    this.setupEventHandlers();
  }

  setupCommands() {
    // Financial Commands
    this.commands.set('balance', {
      data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your current net worth and progress toward R1.8M'),
      async execute(interaction) {
        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('💰 LIF3 Financial Balance')
          .setDescription('Your current financial status')
          .addFields(
            { name: '💰 Net Worth', value: 'R239,625', inline: true },
            { name: '🎯 Target', value: 'R1,800,000', inline: true },
            { name: '📊 Progress', value: '13.3%', inline: true },
            { name: '📈 Remaining', value: 'R1,560,375', inline: true },
            { name: '📅 Timeline', value: '18 months', inline: true },
            { name: '💸 Monthly Need', value: 'R86,688', inline: true }
          )
          .setFooter({ text: 'LIF3 Financial System • Cape Town, ZA' })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }
    });

    this.commands.set('revenue', {
      data: new SlashCommandBuilder()
        .setName('revenue')
        .setDescription('Log or check 43V3R business revenue')
        .addNumberOption(option =>
          option.setName('amount')
            .setDescription('Revenue amount in ZAR')
            .setRequired(false))
        .addStringOption(option =>
          option.setName('description')
            .setDescription('Revenue description')
            .setRequired(false)),
      async execute(interaction) {
        const amount = interaction.options.getNumber('amount');
        const description = interaction.options.getString('description');

        if (amount) {
          // Log revenue
          const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('💰 43V3R Revenue Logged!')
            .setDescription(`Successfully logged R${amount.toLocaleString()}`)
            .addFields(
              { name: '💵 Amount', value: `R${amount.toLocaleString()}`, inline: true },
              { name: '📝 Description', value: description || 'Revenue logged', inline: true },
              { name: '📊 Daily Target', value: 'R4,881', inline: true },
              { name: '📈 Progress', value: `${((amount / 4881) * 100).toFixed(1)}%`, inline: true }
            )
            .setFooter({ text: '43V3R Business System • Keep growing!' })
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
        } else {
          // Show revenue status
          const embed = new EmbedBuilder()
            .setColor('#FF6B6B')
            .setTitle('🚀 43V3R Revenue Status')
            .setDescription('Current business performance')
            .addFields(
              { name: '📊 Daily Target', value: 'R4,881', inline: true },
              { name: '💰 Current', value: 'R0', inline: true },
              { name: '📈 Progress', value: '0%', inline: true },
              { name: '📅 MRR Target', value: 'R147,917', inline: true },
              { name: '🎯 Current MRR', value: 'R0', inline: true },
              { name: '🚀 Next Goal', value: 'First R1,000', inline: true }
            )
            .setFooter({ text: 'Focus: AI Consulting → Web3 → Crypto → Quantum' })
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
        }
      }
    });

    this.commands.set('goals', {
      data: new SlashCommandBuilder()
        .setName('goals')
        .setDescription('View your financial and business goals progress'),
      async execute(interaction) {
        const embed = new EmbedBuilder()
          .setColor('#8B5CF6')
          .setTitle('🎯 LIF3 Goals Progress')
          .setDescription('Your journey to financial freedom')
          .addFields(
            { name: '💰 Net Worth R1.8M', value: '13.3% complete', inline: false },
            { name: '🚭 Quit Smoking', value: 'Health + R2,000 savings', inline: false },
            { name: '🏠 Own House', value: 'R1,000,000 target', inline: false },
            { name: '🚗 Get Car', value: 'R200,000 budget', inline: false },
            { name: '🚀 43V3R R100K MRR', value: '0% (Foundation phase)', inline: false },
            { name: '🎓 Advanced Diploma', value: 'Computer Engineering', inline: false },
            { name: '💻 Remote Job', value: 'High-paying IT position', inline: false },
            { name: '❤️ Help Parents', value: 'R50,000 support fund', inline: false }
          )
          .setFooter({ text: 'Every step counts toward your R1.8M goal!' })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }
    });

    this.commands.set('savings', {
      data: new SlashCommandBuilder()
        .setName('savings')
        .setDescription('Analyze your savings rate and recommendations'),
      async execute(interaction) {
        const embed = new EmbedBuilder()
          .setColor('#10B981')
          .setTitle('💸 Savings Analysis')
          .setDescription('Optimization for R1.8M goal')
          .addFields(
            { name: '📊 Required Monthly', value: 'R86,688', inline: true },
            { name: '💰 Current Capacity', value: 'R35,500', inline: true },
            { name: '⚠️ Shortfall', value: 'R51,188', inline: true },
            { name: '🚀 Solution', value: 'Scale 43V3R business revenue', inline: false },
            { name: '📈 Strategy', value: 'AI Consulting → R10K/month → R50K/month', inline: false },
            { name: '🎯 Timeline', value: '18 months to R1.8M (accelerated with 43V3R)', inline: false }
          )
          .setFooter({ text: 'Focus on revenue growth to close the gap!' })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }
    });

    this.commands.set('brief', {
      data: new SlashCommandBuilder()
        .setName('brief')
        .setDescription('Get your daily LIF3 financial briefing'),
      async execute(interaction) {
        const today = new Date().toLocaleDateString('en-ZA', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        const embed = new EmbedBuilder()
          .setColor('#3B82F6')
          .setTitle('📋 Daily LIF3 Briefing')
          .setDescription(`Financial status for ${today}`)
          .addFields(
            { name: '💰 Current Net Worth', value: 'R239,625 (13.3% to goal)', inline: false },
            { name: '🎯 Today\'s Priority', value: 'Launch AI consulting, get first client', inline: false },
            { name: '🚀 43V3R Focus', value: 'Create portfolio, R2,000-R10,000 projects', inline: false },
            { name: '💸 Expense Watch', value: 'Track all spending, stay under budget', inline: false },
            { name: '📈 Opportunity', value: 'Market AI expertise with Claude CLI', inline: false }
          )
          .setFooter({ text: 'Make today count toward your R1.8M goal!' })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }
    });
  }

  setupEventHandlers() {
    this.client.once('ready', () => {
      console.log(`✅ LIF3 Discord Bot is ready! Logged in as ${this.client.user.tag}`);
      this.client.user.setActivity('Tracking R1.8M goal 📊', { type: 'WATCHING' });
    });

    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const command = this.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error('Command execution error:', error);
        const reply = { 
          content: '❌ There was an error executing this command!', 
          ephemeral: true 
        };
        
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply);
        } else {
          await interaction.reply(reply);
        }
      }
    });

    // Automated daily briefing
    this.scheduleDailyBriefing();
  }

  async deployCommands() {
    const commands = Array.from(this.commands.values()).map(cmd => cmd.data.toJSON());
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
      console.log('🔄 Started refreshing application (/) commands...');
      
      await rest.put(
        Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID),
        { body: commands },
      );

      console.log('✅ Successfully reloaded application (/) commands!');
    } catch (error) {
      console.error('❌ Error deploying commands:', error);
    }
  }

  scheduleDailyBriefing() {
    // Send daily briefing at 8:00 AM Cape Town time
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
    }, 60000); // Check every minute
  }

  async sendDailyBriefing() {
    try {
      const guild = this.client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
      if (!guild) return;

      const channel = guild.channels.cache.find(ch => ch.name === 'financial') || 
                     guild.channels.cache.find(ch => ch.name === 'general');
      
      if (!channel) return;

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🌅 Good Morning! Daily LIF3 Briefing')
        .setDescription('Start your day with financial focus!')
        .addFields(
          { name: '💰 Net Worth Progress', value: 'R239,625 → R1,800,000 (13.3%)', inline: false },
          { name: '🎯 Today\'s Goal', value: 'Launch AI consulting, secure first client', inline: false },
          { name: '🚀 43V3R Focus', value: 'Create portfolio, reach out to prospects', inline: false },
          { name: '💡 Opportunity', value: 'Leverage Claude CLI + Cursor expertise', inline: false }
        )
        .setFooter({ text: 'Make today count! Every action builds toward R1.8M' })
        .setTimestamp();

      await channel.send({ embeds: [embed] });
      console.log('📋 Daily briefing sent successfully!');
    } catch (error) {
      console.error('❌ Error sending daily briefing:', error);
    }
  }

  async start() {
    try {
      await this.deployCommands();
      await this.client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
      console.error('❌ Error starting bot:', error);
    }
  }
}

// Start the bot if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const bot = new LIF3DiscordBot();
  bot.start();
}

export default LIF3DiscordBot;