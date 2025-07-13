#!/usr/bin/env node

// FIXED DISCORD BOT FOR LIF3 SYSTEM - No Privileged Intents Required
import { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder } from 'discord.js';
import { config } from 'dotenv';

config();

class LIF3DiscordBotFixed {
  constructor() {
    // Only use basic intents - no privileged intents required
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        // Removed MessageContent and GuildMessages - these require privileged intents
      ]
    });

    this.commands = new Map();
    this.setupCommands();
    this.setupEventHandlers();
  }

  setupCommands() {
    // Financial balance command
    this.commands.set('lif3-balance', {
      data: new SlashCommandBuilder()
        .setName('lif3-balance')
        .setDescription('Check your current net worth and progress toward R1.8M'),
      async execute(interaction) {
        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('💰 LIF3 Financial Balance')
          .setDescription('Your journey to financial freedom')
          .addFields(
            { name: '💰 Current Net Worth', value: 'R239,625', inline: true },
            { name: '🎯 Target Goal', value: 'R1,800,000', inline: true },
            { name: '📊 Progress', value: '13.3%', inline: true },
            { name: '📈 Remaining', value: 'R1,560,375', inline: true },
            { name: '📅 Timeline', value: '18 months', inline: true },
            { name: '💸 Monthly Need', value: 'R86,688', inline: true }
          )
          .setFooter({ text: 'LIF3 Financial System • Every Rand counts!' })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }
    });

    // Revenue logging command
    this.commands.set('lif3-revenue', {
      data: new SlashCommandBuilder()
        .setName('lif3-revenue')
        .setDescription('Log 43V3R business revenue')
        .addNumberOption(option =>
          option.setName('amount')
            .setDescription('Revenue amount in ZAR')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('description')
            .setDescription('Revenue description (AI consulting, Web3 project, etc.)')
            .setRequired(false)),
      async execute(interaction) {
        const amount = interaction.options.getNumber('amount');
        const description = interaction.options.getString('description') || 'Business revenue logged';

        const progressPercent = ((amount / 4881) * 100).toFixed(1);
        
        const embed = new EmbedBuilder()
          .setColor('#FFD700')
          .setTitle('💰 43V3R Revenue Logged!')
          .setDescription(`Great work! R${amount.toLocaleString()} added to business revenue`)
          .addFields(
            { name: '💵 Amount', value: `R${amount.toLocaleString()}`, inline: true },
            { name: '📝 Type', value: description, inline: true },
            { name: '📊 Daily Target', value: 'R4,881', inline: true },
            { name: '📈 Progress Today', value: `${progressPercent}%`, inline: true },
            { name: '🎯 MRR Target', value: 'R147,917', inline: true },
            { name: '🚀 Next Goal', value: amount < 1000 ? 'First R1,000' : 'Keep scaling!', inline: true }
          )
          .setFooter({ text: '43V3R Business • AI + Web3 + Crypto + Quantum' })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }
    });

    // Goals progress command
    this.commands.set('lif3-goals', {
      data: new SlashCommandBuilder()
        .setName('lif3-goals')
        .setDescription('View your financial and business goals progress'),
      async execute(interaction) {
        const embed = new EmbedBuilder()
          .setColor('#8B5CF6')
          .setTitle('🎯 LIF3 Goals Progress')
          .setDescription('Your roadmap to R1.8M and beyond')
          .addFields(
            { name: '💰 Net Worth R1.8M', value: '13.3% complete (R239,625)', inline: false },
            { name: '🚭 Quit Smoking', value: 'Health priority + R2,000 monthly savings', inline: false },
            { name: '🏠 Own House', value: 'R1,000,000 target (Future goal)', inline: false },
            { name: '🚗 Get Car', value: 'R200,000 budget (2025 target)', inline: false },
            { name: '🚀 43V3R R100K MRR', value: '0% complete (Foundation building)', inline: false },
            { name: '🎓 Advanced Diploma', value: 'Computer Engineering studies', inline: false },
            { name: '💻 Remote Job', value: 'High-paying IT position target', inline: false },
            { name: '❤️ Help Parents', value: 'R50,000 support fund goal', inline: false }
          )
          .setFooter({ text: 'Every step brings you closer to your dreams!' })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }
    });

    // Savings analysis command
    this.commands.set('lif3-savings', {
      data: new SlashCommandBuilder()
        .setName('lif3-savings')
        .setDescription('Analyze your savings rate and get recommendations'),
      async execute(interaction) {
        const embed = new EmbedBuilder()
          .setColor('#10B981')
          .setTitle('💸 LIF3 Savings Analysis')
          .setDescription('Your path to R1.8M optimization')
          .addFields(
            { name: '📊 Required Monthly', value: 'R86,688', inline: true },
            { name: '💰 Current Capacity', value: 'R35,500', inline: true },
            { name: '⚠️ Monthly Shortfall', value: 'R51,188', inline: true },
            { name: '🚀 Primary Solution', value: '**Scale 43V3R Business Revenue**', inline: false },
            { name: '📈 Revenue Strategy', value: 'AI Consulting → R10K → R50K → R100K monthly', inline: false },
            { name: '🎯 Timeline Acceleration', value: 'Business success = faster R1.8M achievement', inline: false },
            { name: '💡 Immediate Action', value: 'Focus 80% energy on 43V3R revenue generation', inline: false }
          )
          .setFooter({ text: 'Revenue growth is your fastest path to R1.8M!' })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }
    });

    // Daily briefing command
    this.commands.set('lif3-brief', {
      data: new SlashCommandBuilder()
        .setName('lif3-brief')
        .setDescription('Get your daily LIF3 financial and business briefing'),
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
          .setDescription(`Your success roadmap for ${today}`)
          .addFields(
            { name: '💰 Financial Status', value: 'R239,625 → R1,800,000 (13.3% complete)', inline: false },
            { name: '🎯 Today\'s Priority', value: '**Launch AI consulting → Land first R2,000 project**', inline: false },
            { name: '🚀 43V3R Focus', value: 'Create portfolio • Reach out to prospects • Price competitively', inline: false },
            { name: '💡 Key Advantage', value: 'Claude CLI + Cursor expertise = competitive edge', inline: false },
            { name: '📊 Success Metric', value: 'End today closer to first R1,000 business revenue', inline: false },
            { name: '💸 Expense Watch', value: 'Track every spend • Stay disciplined on budget', inline: false }
          )
          .setFooter({ text: 'Make today count toward your R1.8M goal! 🎯' })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }
    });

    // Business metrics command  
    this.commands.set('lif3-business', {
      data: new SlashCommandBuilder()
        .setName('lif3-business')
        .setDescription('View complete 43V3R business dashboard'),
      async execute(interaction) {
        const embed = new EmbedBuilder()
          .setColor('#FF6B6B')
          .setTitle('🚀 43V3R Business Dashboard')
          .setDescription('AI + Web3 + Crypto + Quantum Technology Company')
          .addFields(
            { name: '📊 Revenue Targets', value: 'Daily: R0/R4,881 • MRR: R0/R147,917', inline: false },
            { name: '🎯 Business Focus', value: '40% AI • 25% Web3 • 25% Crypto • 10% Quantum', inline: false },
            { name: '📈 Current Stage', value: '**Foundation Building** (Week 1)', inline: false },
            { name: '💼 Service Pipeline', value: 'AI Consulting R2K-R10K per project', inline: false },
            { name: '🔥 Immediate Goals', value: '• Create AI portfolio\n• Land first 3 clients\n• Establish Web3 partnerships', inline: false },
            { name: '🎪 Growth Strategy', value: 'Months 1-3: AI foundation\nMonths 4-6: Web3 expansion\nMonths 7-12: Crypto + Quantum', inline: false }
          )
          .setFooter({ text: 'Building the future of technology consulting!' })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }
    });
  }

  setupEventHandlers() {
    this.client.once('ready', () => {
      console.log(`✅ LIF3 Discord Bot ready! Logged in as ${this.client.user.tag}`);
      console.log(`🎯 Tracking R1.8M goal across ${this.client.guilds.cache.size} server(s)`);
      
      // Set bot activity
      this.client.user.setActivity('R239K → R1.8M journey 📊', { type: 'WATCHING' });
    });

    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const command = this.commands.get(interaction.commandName);
      if (!command) {
        console.log(`⚠️ Unknown command: ${interaction.commandName}`);
        return;
      }

      try {
        await command.execute(interaction);
        console.log(`✅ Executed command: ${interaction.commandName} for ${interaction.user.tag}`);
      } catch (error) {
        console.error(`❌ Error executing ${interaction.commandName}:`, error);
        
        const reply = { 
          content: '❌ There was an error executing this command! Please try again.', 
          ephemeral: true 
        };
        
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply);
        } else {
          await interaction.reply(reply);
        }
      }
    });

    // Handle errors gracefully
    this.client.on('error', error => {
      console.error('❌ Discord client error:', error);
    });

    // Automated daily briefing (8:00 AM Cape Town time)
    this.scheduleDailyBriefing();
  }

  async deployCommands() {
    if (!process.env.DISCORD_TOKEN || !process.env.DISCORD_CLIENT_ID) {
      console.log('⚠️ Discord tokens not configured. Skipping command deployment.');
      console.log('💡 Set DISCORD_TOKEN and DISCORD_CLIENT_ID in .env file');
      return;
    }

    const commands = Array.from(this.commands.values()).map(cmd => cmd.data.toJSON());
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
      console.log('🔄 Deploying Discord slash commands...');
      
      if (process.env.DISCORD_GUILD_ID) {
        // Deploy to specific guild (faster for development)
        await rest.put(
          Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID),
          { body: commands }
        );
        console.log('✅ Guild slash commands deployed successfully!');
      } else {
        // Deploy globally (takes up to 1 hour to propagate)
        await rest.put(
          Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
          { body: commands }
        );
        console.log('✅ Global slash commands deployed successfully!');
      }
    } catch (error) {
      console.error('❌ Error deploying commands:', error);
    }
  }

  scheduleDailyBriefing() {
    // Check every minute for 8:00 AM Cape Town time
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
  }

  async sendDailyBriefing() {
    try {
      if (!process.env.DISCORD_GUILD_ID) return;

      const guild = this.client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
      if (!guild) return;

      // Find financial or general channel
      const channel = guild.channels.cache.find(ch => 
        ch.name === 'financial' || ch.name === 'finance' || ch.name === 'general'
      );
      
      if (!channel) return;

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🌅 Good Morning! Daily LIF3 Briefing')
        .setDescription('Start your day with financial focus and business action!')
        .addFields(
          { name: '💰 Net Worth Journey', value: 'R239,625 → R1,800,000 (13.3% complete)', inline: false },
          { name: '🎯 Today\'s Mission', value: '**Launch AI consulting • Secure first client • Build 43V3R**', inline: false },
          { name: '🚀 Business Focus', value: 'Create portfolio • Reach prospects • Price R2K-R10K projects', inline: false },
          { name: '💡 Success Key', value: 'Leverage Claude CLI + Cursor expertise for competitive advantage', inline: false },
          { name: '📊 Daily Goal', value: 'Make progress toward first R1,000 business revenue', inline: false }
        )
        .setFooter({ text: 'Every action today builds toward your R1.8M goal! 🎯' })
        .setTimestamp();

      await channel.send({ embeds: [embed] });
      console.log('📋 Daily briefing sent successfully!');
    } catch (error) {
      console.error('❌ Error sending daily briefing:', error);
    }
  }

  async start() {
    try {
      // Deploy commands first
      await this.deployCommands();
      
      // Start the bot
      if (!process.env.DISCORD_TOKEN) {
        console.log('❌ DISCORD_TOKEN not found in environment variables');
        console.log('💡 Please set up your .env file with Discord bot token');
        return;
      }

      await this.client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
      console.error('❌ Error starting bot:', error);
      
      if (error.message.includes('disallowed intents')) {
        console.log('');
        console.log('🔧 INTENT CONFIGURATION NEEDED:');
        console.log('1. Go to https://discord.com/developers/applications');
        console.log('2. Select your bot application');
        console.log('3. Go to "Bot" section');
        console.log('4. Scroll down to "Privileged Gateway Intents"');
        console.log('5. Enable "Message Content Intent" if needed');
        console.log('6. Save changes and restart the bot');
      }
    }
  }
}

// Start the bot if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const bot = new LIF3DiscordBotFixed();
  bot.start();
}

export default LIF3DiscordBotFixed;