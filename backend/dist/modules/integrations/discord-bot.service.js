"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordBotService = void 0;
const common_1 = require("@nestjs/common");
const discord_js_1 = require("discord.js");
const logger_service_1 = require("../../common/logger/logger.service");
const schedule_1 = require("@nestjs/schedule");
let DiscordBotService = class DiscordBotService {
    constructor(logger) {
        this.logger = logger;
        this.isConnected = false;
        this.commandExecutionCount = 0;
        this.dailyCommandLimits = new Map();
        this.initializeBot();
    }
    async initializeBot() {
        const startTime = Date.now();
        try {
            this.client = new discord_js_1.Client({
                intents: [
                    discord_js_1.GatewayIntentBits.Guilds,
                    discord_js_1.GatewayIntentBits.GuildMessages,
                    discord_js_1.GatewayIntentBits.MessageContent,
                    discord_js_1.GatewayIntentBits.DirectMessages
                ]
            });
            this.setupEventHandlers();
            await this.registerSlashCommands();
            if (process.env.DISCORD_BOT_TOKEN && process.env.DISCORD_BOT_TOKEN !== 'your_discord_bot_token_here') {
                await this.client.login(process.env.DISCORD_BOT_TOKEN);
                this.isConnected = true;
            }
            else {
                this.logger.log('Discord bot token not configured, skipping connection', 'DiscordBotService');
                return;
            }
            const duration = Date.now() - startTime;
            this.logger.logIntegration({
                service: 'DISCORD',
                action: 'CONNECT',
                status: 'SUCCESS',
                duration,
                timestamp: new Date(),
                metadata: {
                    guildId: process.env.DISCORD_GUILD_ID,
                    channelId: process.env.DISCORD_CHANNEL_ID,
                    commandCount: this.getRegisteredCommandCount()
                }
            });
            this.logger.log('Discord bot initialized successfully', 'DiscordBotService');
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error(`Failed to initialize Discord bot: ${error.message}`, error.stack, 'DiscordBotService');
            this.logger.logIntegration({
                service: 'DISCORD',
                action: 'CONNECT',
                status: 'FAILED',
                duration,
                errorMessage: error.message,
                timestamp: new Date(),
                metadata: {
                    guildId: process.env.DISCORD_GUILD_ID,
                    channelId: process.env.DISCORD_CHANNEL_ID
                }
            });
        }
    }
    setupEventHandlers() {
        this.client.on('ready', () => {
            this.logger.log(`Discord bot logged in as ${this.client.user?.tag}`, 'DiscordBotService');
            this.isConnected = true;
        });
        this.client.on('interactionCreate', async (interaction) => {
            if (!interaction.isChatInputCommand())
                return;
            const startTime = Date.now();
            const userId = interaction.user.id;
            const commandName = interaction.commandName;
            if (!this.checkRateLimit(userId)) {
                await interaction.reply({
                    content: '⚠️ Rate limit exceeded. You can use 10 commands per minute.',
                    ephemeral: true
                });
                return;
            }
            try {
                this.commandExecutionCount++;
                this.logger.logIntegration({
                    service: 'DISCORD',
                    action: 'COMMAND_RECEIVED',
                    status: 'PROCESSING',
                    timestamp: new Date(),
                    metadata: {
                        command: commandName,
                        userId,
                        guildId: interaction.guildId,
                        channelId: interaction.channelId
                    }
                });
                await this.handleCommand(interaction);
                const duration = Date.now() - startTime;
                this.logger.logIntegration({
                    service: 'DISCORD',
                    action: 'COMMAND_COMPLETED',
                    status: 'SUCCESS',
                    duration,
                    timestamp: new Date(),
                    metadata: {
                        command: commandName,
                        userId,
                        executionCount: this.commandExecutionCount
                    }
                });
            }
            catch (error) {
                const duration = Date.now() - startTime;
                this.logger.error(`Discord command failed: ${error.message}`, error.stack, 'DiscordBotService');
                this.logger.logIntegration({
                    service: 'DISCORD',
                    action: 'COMMAND_FAILED',
                    status: 'FAILED',
                    duration,
                    errorMessage: error.message,
                    timestamp: new Date(),
                    metadata: {
                        command: commandName,
                        userId
                    }
                });
                await interaction.reply({
                    content: '❌ An error occurred while processing your command. Please try again later.',
                    ephemeral: true
                });
            }
        });
        this.client.on('error', (error) => {
            this.logger.error(`Discord client error: ${error.message}`, error.stack, 'DiscordBotService');
            this.isConnected = false;
        });
        this.client.on('disconnect', () => {
            this.logger.log('Discord bot disconnected', 'DiscordBotService');
            this.isConnected = false;
        });
    }
    async registerSlashCommands() {
        try {
            const commands = [
                new discord_js_1.SlashCommandBuilder()
                    .setName('balance')
                    .setDescription('Show current net worth and account balances')
                    .toJSON(),
                new discord_js_1.SlashCommandBuilder()
                    .setName('transaction')
                    .setDescription('Log a new financial transaction')
                    .addNumberOption(option => option.setName('amount')
                    .setDescription('Transaction amount in ZAR')
                    .setRequired(true))
                    .addStringOption(option => option.setName('description')
                    .setDescription('Transaction description')
                    .setRequired(true))
                    .addStringOption(option => option.setName('type')
                    .setDescription('Transaction type')
                    .setRequired(true)
                    .addChoices({ name: 'Income', value: 'CREDIT' }, { name: 'Expense', value: 'DEBIT' }, { name: 'Investment', value: 'INVESTMENT' }, { name: 'Transfer', value: 'TRANSFER' }))
                    .toJSON(),
                new discord_js_1.SlashCommandBuilder()
                    .setName('goal-progress')
                    .setDescription('Show progress toward R1,800,000 net worth goal')
                    .toJSON(),
                new discord_js_1.SlashCommandBuilder()
                    .setName('savings-rate')
                    .setDescription('Calculate current monthly savings rate')
                    .toJSON(),
                new discord_js_1.SlashCommandBuilder()
                    .setName('net-worth')
                    .setDescription('Detailed breakdown of net worth by account')
                    .toJSON(),
                new discord_js_1.SlashCommandBuilder()
                    .setName('revenue')
                    .setDescription('Log daily business revenue for 43V3R')
                    .addNumberOption(option => option.setName('amount')
                    .setDescription('Revenue amount in ZAR')
                    .setRequired(true))
                    .addStringOption(option => option.setName('source')
                    .setDescription('Revenue source')
                    .setRequired(false)
                    .addChoices({ name: 'Consulting', value: 'CONSULTING' }, { name: 'AI Development', value: 'AI_DEV' }, { name: 'Web3 Services', value: 'WEB3' }, { name: 'Crypto Trading', value: 'CRYPTO' }, { name: 'Other', value: 'OTHER' }))
                    .toJSON(),
                new discord_js_1.SlashCommandBuilder()
                    .setName('mrr-status')
                    .setDescription('Show Monthly Recurring Revenue progress')
                    .toJSON(),
                new discord_js_1.SlashCommandBuilder()
                    .setName('business-metrics')
                    .setDescription('Complete 43V3R business dashboard')
                    .toJSON(),
                new discord_js_1.SlashCommandBuilder()
                    .setName('weekly-report')
                    .setDescription('Generate weekly business summary')
                    .toJSON(),
                new discord_js_1.SlashCommandBuilder()
                    .setName('pipeline-value')
                    .setDescription('Show current deals and prospects value')
                    .toJSON(),
                new discord_js_1.SlashCommandBuilder()
                    .setName('daily-briefing')
                    .setDescription('Get today\'s financial briefing')
                    .toJSON(),
                new discord_js_1.SlashCommandBuilder()
                    .setName('help')
                    .setDescription('Show all available LIF3 commands')
                    .toJSON()
            ];
            const rest = new discord_js_1.REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN || '');
            this.logger.log('Started refreshing Discord application (/) commands.', 'DiscordBotService');
            if (process.env.DISCORD_GUILD_ID && process.env.DISCORD_GUILD_ID !== 'your_discord_guild_id_here') {
                await rest.put(discord_js_1.Routes.applicationGuildCommands(this.client.user?.id || 'temp', process.env.DISCORD_GUILD_ID), { body: commands });
            }
            this.logger.log('Successfully reloaded Discord application (/) commands.', 'DiscordBotService');
        }
        catch (error) {
            this.logger.error(`Failed to register slash commands: ${error.message}`, error.stack, 'DiscordBotService');
        }
    }
    async handleCommand(interaction) {
        const commandName = interaction.commandName;
        switch (commandName) {
            case 'balance':
                await this.handleBalanceCommand(interaction);
                break;
            case 'transaction':
                await this.handleTransactionCommand(interaction);
                break;
            case 'goal-progress':
                await this.handleGoalProgressCommand(interaction);
                break;
            case 'savings-rate':
                await this.handleSavingsRateCommand(interaction);
                break;
            case 'net-worth':
                await this.handleNetWorthCommand(interaction);
                break;
            case 'revenue':
                await this.handleRevenueCommand(interaction);
                break;
            case 'mrr-status':
                await this.handleMRRStatusCommand(interaction);
                break;
            case 'business-metrics':
                await this.handleBusinessMetricsCommand(interaction);
                break;
            case 'weekly-report':
                await this.handleWeeklyReportCommand(interaction);
                break;
            case 'pipeline-value':
                await this.handlePipelineValueCommand(interaction);
                break;
            case 'daily-briefing':
                await this.handleDailyBriefingCommand(interaction);
                break;
            case 'help':
                await this.handleHelpCommand(interaction);
                break;
            default:
                await interaction.reply({
                    content: '❓ Unknown command. Use `/help` to see available commands.',
                    ephemeral: true
                });
        }
    }
    async handleBalanceCommand(interaction) {
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(0x1976d2)
            .setTitle('💰 LIF3 Financial Balance')
            .setDescription('Current net worth and account balances')
            .addFields({ name: '📊 **Total Net Worth**', value: '**R239,625**', inline: false }, { name: '💵 Liquid Cash', value: 'R88,750', inline: true }, { name: '📈 Investments', value: 'R142,000', inline: true }, { name: '🏢 43V3R Equity', value: 'R8,875', inline: true }, { name: '🎯 **Goal Progress**', value: '**13.3%** toward R1,800,000', inline: false }, { name: '💸 Remaining', value: 'R1,560,375', inline: true }, { name: '📅 Monthly Target', value: 'R130,031', inline: true })
            .setFooter({
            text: 'LIF3 Financial Dashboard | Cape Town, SA',
            iconURL: 'https://cdn.discordapp.com/emojis/emoji_id.png'
        })
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async handleTransactionCommand(interaction) {
        const amount = interaction.options.getNumber('amount');
        const description = interaction.options.getString('description');
        const type = interaction.options.getString('type');
        const transactionData = {
            amount,
            description,
            type,
            currency: 'ZAR',
            timestamp: new Date(),
            userId: interaction.user.id
        };
        this.logger.logFinancialAudit({
            userId: 'ethan_barnes',
            action: 'CREATE',
            entity: 'TRANSACTION',
            amount,
            currency: 'ZAR',
            timestamp: new Date(),
            metadata: {
                description,
                type,
                source: 'DISCORD_BOT'
            }
        });
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(type === 'CREDIT' ? 0x4caf50 : 0xf44336)
            .setTitle(`${type === 'CREDIT' ? '💚' : '💸'} Transaction Logged`)
            .addFields({ name: 'Amount', value: `R${Math.abs(amount).toLocaleString()}`, inline: true }, { name: 'Type', value: type, inline: true }, { name: 'Description', value: description, inline: false })
            .setFooter({ text: `Logged by ${interaction.user.username}` })
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async handleGoalProgressCommand(interaction) {
        const currentNetWorth = 239625;
        const targetNetWorth = 1800000;
        const progress = (currentNetWorth / targetNetWorth) * 100;
        const remaining = targetNetWorth - currentNetWorth;
        const monthsToGoal = Math.ceil(remaining / 130031);
        const progressBar = this.createProgressBar(progress, 20);
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(0xffa726)
            .setTitle('🎯 Goal Progress to R1,800,000')
            .setDescription(`**${progress.toFixed(1)}%** Complete\n\n${progressBar}`)
            .addFields({ name: '💰 Current Net Worth', value: `R${currentNetWorth.toLocaleString()}`, inline: true }, { name: '🎯 Target Net Worth', value: `R${targetNetWorth.toLocaleString()}`, inline: true }, { name: '💸 Remaining', value: `R${remaining.toLocaleString()}`, inline: true }, { name: '📅 Estimated Completion', value: `${monthsToGoal} months`, inline: true }, { name: '🚀 43V3R Daily Target', value: 'R4,881', inline: true }, { name: '📈 Monthly Growth Needed', value: 'R130,031', inline: true })
            .setFooter({ text: 'Keep pushing toward your financial freedom!' })
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async handleSavingsRateCommand(interaction) {
        const monthlyIncome = 85000;
        const monthlyExpenses = 45000;
        const monthlySavings = monthlyIncome - monthlyExpenses;
        const savingsRate = (monthlySavings / monthlyIncome) * 100;
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(0x388e3c)
            .setTitle('💰 Monthly Savings Rate')
            .addFields({ name: '💵 Monthly Income', value: `R${monthlyIncome.toLocaleString()}`, inline: true }, { name: '💸 Monthly Expenses', value: `R${monthlyExpenses.toLocaleString()}`, inline: true }, { name: '💾 Monthly Savings', value: `R${monthlySavings.toLocaleString()}`, inline: true }, { name: '📊 **Savings Rate**', value: `**${savingsRate.toFixed(1)}%**`, inline: false }, { name: '🎯 Recommended Rate', value: '20-30% for aggressive growth', inline: true }, { name: '📈 Annual Savings', value: `R${(monthlySavings * 12).toLocaleString()}`, inline: true })
            .setFooter({ text: 'Excellent savings rate! Keep it up!' })
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async handleNetWorthCommand(interaction) {
        const accounts = [
            { name: '💵 Liquid Cash', balance: 88750, percentage: 37.0 },
            { name: '📈 Stock Investments', balance: 95000, percentage: 39.6 },
            { name: '🏠 Crypto Holdings', balance: 47000, percentage: 19.6 },
            { name: '🏢 43V3R Business Equity', balance: 8875, percentage: 3.7 }
        ];
        const totalNetWorth = accounts.reduce((sum, acc) => sum + acc.balance, 0);
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(0x1976d2)
            .setTitle('📊 Net Worth Breakdown')
            .setDescription(`**Total: R${totalNetWorth.toLocaleString()}**`)
            .setFooter({ text: 'Diversified portfolio across multiple asset classes' })
            .setTimestamp();
        accounts.forEach(account => {
            embed.addFields({
                name: account.name,
                value: `R${account.balance.toLocaleString()} (${account.percentage}%)`,
                inline: true
            });
        });
        await interaction.reply({ embeds: [embed] });
    }
    async handleRevenueCommand(interaction) {
        const amount = interaction.options.getNumber('amount');
        const source = interaction.options.getString('source') || 'OTHER';
        this.logger.logFinancialAudit({
            userId: 'ethan_barnes',
            action: 'CREATE',
            entity: 'BUSINESS_METRIC',
            amount,
            currency: 'ZAR',
            timestamp: new Date(),
            metadata: {
                type: 'DAILY_REVENUE',
                source,
                business: '43V3R'
            }
        });
        const dailyTarget = 4881;
        const progressPercent = (amount / dailyTarget) * 100;
        const progressBar = this.createProgressBar(Math.min(progressPercent, 100), 15);
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(amount >= dailyTarget ? 0x4caf50 : 0xffa726)
            .setTitle('🚀 43V3R Revenue Logged')
            .setDescription(`${amount >= dailyTarget ? '🎉 Daily target achieved!' : '📈 Progress toward daily target'}`)
            .addFields({ name: '💰 Revenue Amount', value: `R${amount.toLocaleString()}`, inline: true }, { name: '🎯 Daily Target', value: `R${dailyTarget.toLocaleString()}`, inline: true }, { name: '📊 Progress', value: `${Math.min(progressPercent, 100).toFixed(1)}%`, inline: true }, { name: '🏷️ Source', value: source.replace('_', ' '), inline: true }, { name: '💸 Remaining Today', value: `R${Math.max(0, dailyTarget - amount).toLocaleString()}`, inline: true }, { name: '📈 Progress Bar', value: progressBar, inline: false })
            .setFooter({ text: '43V3R AI + Web3 + Crypto | Cape Town, SA' })
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async handleMRRStatusCommand(interaction) {
        const currentMRR = 12500;
        const targetMRR = 147917;
        const progress = (currentMRR / targetMRR) * 100;
        const progressBar = this.createProgressBar(progress, 20);
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(0x9c27b0)
            .setTitle('📈 Monthly Recurring Revenue (MRR)')
            .setDescription(`**${progress.toFixed(1)}%** of target\n\n${progressBar}`)
            .addFields({ name: '💰 Current MRR', value: `R${currentMRR.toLocaleString()}`, inline: true }, { name: '🎯 Target MRR', value: `R${targetMRR.toLocaleString()}`, inline: true }, { name: '💸 Gap to Target', value: `R${(targetMRR - currentMRR).toLocaleString()}`, inline: true }, { name: '📅 Growth Rate', value: '+18.5% MoM', inline: true }, { name: '🚀 Projected ARR', value: `R${(currentMRR * 12).toLocaleString()}`, inline: true }, { name: '📊 Customer Count', value: '8 active clients', inline: true })
            .setFooter({ text: '43V3R Subscription Services' })
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async handleBusinessMetricsCommand(interaction) {
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(0xe91e63)
            .setTitle('🏢 43V3R Business Dashboard')
            .setDescription('Complete business metrics for AI + Web3 + Crypto startup')
            .addFields({ name: '💰 **Revenue Metrics**', value: '━━━━━━━━━━━━━━━━━━━━', inline: false }, { name: 'Daily Revenue', value: 'R0 / R4,881 (0%)', inline: true }, { name: 'Monthly Revenue', value: 'R12,500', inline: true }, { name: 'Annual Run Rate', value: 'R150,000', inline: true }, { name: '📊 **Growth Metrics**', value: '━━━━━━━━━━━━━━━━━━━━', inline: false }, { name: 'MRR Growth', value: '+18.5% MoM', inline: true }, { name: 'Customer Growth', value: '+2 new clients', inline: true }, { name: 'Pipeline Value', value: 'R75,000', inline: true }, { name: '🎯 **Targets & KPIs**', value: '━━━━━━━━━━━━━━━━━━━━', inline: false }, { name: 'Daily Target', value: 'R4,881', inline: true }, { name: 'MRR Target', value: 'R147,917', inline: true }, { name: 'Annual Target', value: 'R1,775,000', inline: true })
            .setFooter({ text: '43V3R | AI + Web3 + Crypto | Cape Town, SA' })
            .setTimestamp();
        const button = new discord_js_1.ButtonBuilder()
            .setCustomId('view_detailed_metrics')
            .setLabel('📊 View Detailed Metrics')
            .setStyle(discord_js_1.ButtonStyle.Primary);
        const row = new discord_js_1.ActionRowBuilder().addComponents(button);
        await interaction.reply({ embeds: [embed], components: [row] });
    }
    async handleWeeklyReportCommand(interaction) {
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(0x607d8b)
            .setTitle('📅 Weekly Business Report')
            .setDescription('43V3R Performance Summary - Week Ending')
            .addFields({ name: '💰 Weekly Revenue', value: 'R8,500', inline: true }, { name: '🎯 Weekly Target', value: 'R34,167', inline: true }, { name: '📊 Achievement', value: '24.9%', inline: true }, { name: '📈 New Clients', value: '2 signed', inline: true }, { name: '💼 Proposals Sent', value: '5 proposals', inline: true }, { name: '🤝 Meetings Held', value: '8 calls', inline: true }, { name: '🔥 **Key Wins**', value: '• Signed new AI consulting contract\n• Web3 audit project completed\n• Crypto trading algorithm deployed', inline: false }, { name: '🎯 **Next Week Focus**', value: '• Close R25k consulting deal\n• Launch new service offering\n• Attend Cape Town Tech meetup', inline: false })
            .setFooter({ text: 'Generated automatically by LIF3 Bot' })
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async handlePipelineValueCommand(interaction) {
        const deals = [
            { company: 'TechCorp AI', value: 25000, stage: 'Proposal Sent', probability: 70 },
            { company: 'Crypto Exchange SA', value: 18000, stage: 'Negotiation', probability: 85 },
            { company: 'Web3 Startup', value: 12000, stage: 'Initial Contact', probability: 30 },
            { company: 'AI Research Lab', value: 20000, stage: 'Discovery Call', probability: 50 }
        ];
        const totalPipeline = deals.reduce((sum, deal) => sum + deal.value, 0);
        const weightedValue = deals.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0);
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(0x3f51b5)
            .setTitle('💼 Sales Pipeline - 43V3R')
            .setDescription(`**Total Pipeline Value:** R${totalPipeline.toLocaleString()}\n**Weighted Value:** R${weightedValue.toLocaleString()}`)
            .setFooter({ text: '4 active opportunities in pipeline' })
            .setTimestamp();
        deals.forEach(deal => {
            embed.addFields({
                name: `🏢 ${deal.company}`,
                value: `R${deal.value.toLocaleString()} • ${deal.stage} • ${deal.probability}% probability`,
                inline: false
            });
        });
        await interaction.reply({ embeds: [embed] });
    }
    async handleDailyBriefingCommand(interaction) {
        const today = new Date().toLocaleDateString('en-ZA', {
            timeZone: 'Africa/Johannesburg',
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(0xff9800)
            .setTitle(`📊 LIF3 Daily Briefing - ${today}`)
            .setDescription('Your complete financial and business overview')
            .addFields({ name: '💰 **Financial Status**', value: '━━━━━━━━━━━━━━━━━━━━', inline: false }, { name: 'Net Worth', value: 'R239,625 (13.3%)', inline: true }, { name: 'Daily P&L', value: '+R2,150', inline: true }, { name: 'Goal Progress', value: '13.3% → R1.8M', inline: true }, { name: '🚀 **43V3R Business**', value: '━━━━━━━━━━━━━━━━━━━━', inline: false }, { name: 'Daily Revenue', value: 'R0 / R4,881', inline: true }, { name: 'Pipeline Value', value: 'R75,000', inline: true }, { name: 'Active Clients', value: '8 clients', inline: true }, { name: '🎯 **Today\'s Focus**', value: '• Close TechCorp AI deal (R25k)\n• Complete Web3 audit project\n• Review investment portfolio\n• Update financial projections', inline: false })
            .setFooter({ text: 'Generated at 8:00 AM CAT | LIF3 Bot' })
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async handleHelpCommand(interaction) {
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(0x00bcd4)
            .setTitle('🤖 LIF3 Discord Bot Commands')
            .setDescription('Complete financial management at your fingertips')
            .addFields({ name: '💰 **Financial Commands**', value: '━━━━━━━━━━━━━━━━━━━━', inline: false }, { name: '`/balance`', value: 'Show current net worth and balances', inline: true }, { name: '`/transaction`', value: 'Log a new financial transaction', inline: true }, { name: '`/goal-progress`', value: 'Progress toward R1.8M goal', inline: true }, { name: '`/savings-rate`', value: 'Calculate monthly savings rate', inline: true }, { name: '`/net-worth`', value: 'Detailed net worth breakdown', inline: true }, { name: '`/daily-briefing`', value: 'Get today\'s financial briefing', inline: true }, { name: '🚀 **43V3R Business Commands**', value: '━━━━━━━━━━━━━━━━━━━━', inline: false }, { name: '`/revenue`', value: 'Log daily business revenue', inline: true }, { name: '`/mrr-status`', value: 'Monthly Recurring Revenue status', inline: true }, { name: '`/business-metrics`', value: 'Complete business dashboard', inline: true }, { name: '`/weekly-report`', value: 'Generate weekly summary', inline: true }, { name: '`/pipeline-value`', value: 'Show sales pipeline value', inline: true })
            .setFooter({ text: 'LIF3 Bot | Financial Freedom Journey to R1.8M' })
            .setTimestamp();
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
    async sendDailyBriefing() {
        if (!this.isConnected || !process.env.DISCORD_CHANNEL_ID)
            return;
        try {
            const channel = await this.client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
            if (!channel || !('send' in channel))
                return;
            const today = new Date().toLocaleDateString('en-ZA', {
                timeZone: 'Africa/Johannesburg',
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const embed = new discord_js_1.EmbedBuilder()
                .setColor(0xff9800)
                .setTitle(`🌅 Good Morning! Daily Briefing - ${today}`)
                .setDescription('Your automated LIF3 financial and business update')
                .addFields({ name: '💰 Net Worth Status', value: 'R239,625 → R1,800,000 (13.3%)', inline: false }, { name: '🎯 Today\'s Goals', value: '• Target R4,881 43V3R revenue\n• Review investment portfolio\n• Close pending deals', inline: false }, { name: '📊 Key Metrics', value: 'MRR: R12,500 | Pipeline: R75,000', inline: false })
                .setFooter({ text: 'Automated Daily Briefing | 8:00 AM CAT' })
                .setTimestamp();
            await channel.send({ embeds: [embed] });
            this.logger.log('Daily briefing sent successfully', 'DiscordBotService');
        }
        catch (error) {
            this.logger.error(`Failed to send daily briefing: ${error.message}`, error.stack, 'DiscordBotService');
        }
    }
    async sendEndOfDaySummary() {
        if (!this.isConnected || !process.env.DISCORD_CHANNEL_ID)
            return;
        try {
            const channel = await this.client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
            if (!channel || !('send' in channel))
                return;
            const embed = new discord_js_1.EmbedBuilder()
                .setColor(0x9c27b0)
                .setTitle('🌆 End of Day Summary')
                .setDescription('Today\'s performance recap')
                .addFields({ name: '💰 Daily P&L', value: '+R2,150', inline: true }, { name: '🚀 43V3R Revenue', value: 'R0 / R4,881', inline: true }, { name: '📊 Transactions', value: '5 logged', inline: true }, { name: '🎯 Tomorrow\'s Focus', value: 'Continue working toward R1.8M goal', inline: false })
                .setFooter({ text: 'End of Day Summary | 6:00 PM CAT' })
                .setTimestamp();
            await channel.send({ embeds: [embed] });
            this.logger.log('End-of-day summary sent successfully', 'DiscordBotService');
        }
        catch (error) {
            this.logger.error(`Failed to send end-of-day summary: ${error.message}`, error.stack, 'DiscordBotService');
        }
    }
    async sendWeeklyReport() {
        if (!this.isConnected || !process.env.DISCORD_CHANNEL_ID)
            return;
        try {
            const channel = await this.client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
            if (!channel || !('send' in channel))
                return;
            const embed = new discord_js_1.EmbedBuilder()
                .setColor(0x4caf50)
                .setTitle('📈 Weekly Progress Report')
                .setDescription('Your week in review - LIF3 Journey')
                .addFields({ name: '💰 Net Worth Change', value: '+R8,250 this week', inline: true }, { name: '🚀 43V3R Revenue', value: 'R8,500 / R34,167 (24.9%)', inline: true }, { name: '📊 Goal Progress', value: '13.3% → R1,800,000', inline: true }, { name: '🎯 Key Achievements', value: '• 2 new clients signed\n• Web3 project completed\n• Investment portfolio grew', inline: false }, { name: '📅 Next Week Focus', value: '• Close R25k consulting deal\n• Launch new service\n• Optimize expenses', inline: false })
                .setFooter({ text: 'Weekly Report | Every Sunday 8:00 PM CAT' })
                .setTimestamp();
            await channel.send({ embeds: [embed] });
            this.logger.log('Weekly report sent successfully', 'DiscordBotService');
        }
        catch (error) {
            this.logger.error(`Failed to send weekly report: ${error.message}`, error.stack, 'DiscordBotService');
        }
    }
    createProgressBar(percentage, length = 20) {
        const filledLength = Math.round((percentage / 100) * length);
        const emptyLength = length - filledLength;
        const filledBar = '█'.repeat(filledLength);
        const emptyBar = '░'.repeat(emptyLength);
        return `${filledBar}${emptyBar} ${percentage.toFixed(1)}%`;
    }
    checkRateLimit(userId) {
        const now = Date.now();
        const key = `${userId}_${Math.floor(now / 60000)}`;
        const currentCount = this.dailyCommandLimits.get(key) || 0;
        if (currentCount >= 10) {
            return false;
        }
        this.dailyCommandLimits.set(key, currentCount + 1);
        setTimeout(() => {
            this.dailyCommandLimits.delete(key);
        }, 60000);
        return true;
    }
    getRegisteredCommandCount() {
        return 12;
    }
    async sendLargeTransactionAlert(amount, description) {
        if (!this.isConnected || !process.env.DISCORD_CHANNEL_ID || amount < 5000)
            return;
        try {
            const channel = await this.client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
            if (!channel || !('send' in channel))
                return;
            const embed = new discord_js_1.EmbedBuilder()
                .setColor(amount > 0 ? 0x4caf50 : 0xf44336)
                .setTitle(`🚨 Large Transaction Alert`)
                .setDescription(`Transaction over R5,000 detected`)
                .addFields({ name: 'Amount', value: `R${Math.abs(amount).toLocaleString()}`, inline: true }, { name: 'Type', value: amount > 0 ? '💚 Income' : '💸 Expense', inline: true }, { name: 'Description', value: description, inline: false })
                .setFooter({ text: 'Real-time Transaction Alert' })
                .setTimestamp();
            await channel.send({ embeds: [embed] });
            this.logger.log(`Large transaction alert sent: R${amount}`, 'DiscordBotService');
        }
        catch (error) {
            this.logger.error(`Failed to send transaction alert: ${error.message}`, error.stack, 'DiscordBotService');
        }
    }
    async sendMilestoneNotification(milestone, value) {
        if (!this.isConnected || !process.env.DISCORD_CHANNEL_ID)
            return;
        try {
            const channel = await this.client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
            if (!channel || !('send' in channel))
                return;
            const embed = new discord_js_1.EmbedBuilder()
                .setColor(0xffd700)
                .setTitle('🏆 Milestone Achieved!')
                .setDescription(`Congratulations on reaching a new milestone!`)
                .addFields({ name: '🎯 Achievement', value: milestone, inline: false }, { name: '💰 Value', value: `R${value.toLocaleString()}`, inline: true }, { name: '📈 Progress', value: `${((value / 1800000) * 100).toFixed(1)}% to goal`, inline: true })
                .setFooter({ text: 'LIF3 Journey to Financial Freedom' })
                .setTimestamp();
            await channel.send({ embeds: [embed] });
            this.logger.log(`Milestone notification sent: ${milestone}`, 'DiscordBotService');
        }
        catch (error) {
            this.logger.error(`Failed to send milestone notification: ${error.message}`, error.stack, 'DiscordBotService');
        }
    }
    getConnectionStatus() {
        return this.isConnected;
    }
    getCommandExecutionCount() {
        return this.commandExecutionCount;
    }
};
exports.DiscordBotService = DiscordBotService;
__decorate([
    (0, schedule_1.Cron)('0 6 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DiscordBotService.prototype, "sendDailyBriefing", null);
__decorate([
    (0, schedule_1.Cron)('0 16 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DiscordBotService.prototype, "sendEndOfDaySummary", null);
__decorate([
    (0, schedule_1.Cron)('0 18 * * 0'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DiscordBotService.prototype, "sendWeeklyReport", null);
exports.DiscordBotService = DiscordBotService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [logger_service_1.LoggerService])
], DiscordBotService);
//# sourceMappingURL=discord-bot.service.js.map