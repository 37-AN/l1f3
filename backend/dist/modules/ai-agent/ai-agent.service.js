"use strict";
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return (c > 3 && r && Object.defineProperty(target, key, r), r);
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
var AIAgentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAgentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_1 = require("@nestjs/schedule");
const goal_entity_1 = require("../../database/entities/goal.entity");
const transaction_entity_1 = require("../../database/entities/transaction.entity");
const business_metrics_entity_1 = require("../../database/entities/business-metrics.entity");
const google_drive_service_1 = require("../integrations/google-drive.service");
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
let AIAgentService = (AIAgentService_1 = class AIAgentService {
  constructor(
    goalRepository,
    transactionRepository,
    businessMetricsRepository,
    googleDriveService,
  ) {
    this.goalRepository = goalRepository;
    this.transactionRepository = transactionRepository;
    this.businessMetricsRepository = businessMetricsRepository;
    this.googleDriveService = googleDriveService;
    this.logger = new common_1.Logger(AIAgentService_1.name);
    this.anthropic = new sdk_1.default({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  async getFinancialContext() {
    const goals = await this.goalRepository.find({
      where: { status: goal_entity_1.GoalStatus.ACTIVE },
      order: { priority: "DESC" },
    });
    const recentTransactions = await this.transactionRepository.find({
      order: { date: "DESC" },
      take: 50,
    });
    const today = new Date();
    const todayTransactions = await this.transactionRepository.find({
      where: {
        date: today,
        type: transaction_entity_1.TransactionType.BUSINESS_REVENUE,
      },
    });
    const todayRevenue = todayTransactions.reduce(
      (sum, tx) => sum + Number(tx.amount),
      0,
    );
    let context = `# LIF3 FINANCIAL SYSTEM CONTEXT\\n\\n`;
    context += `**Generated**: ${new Date().toISOString()}\\n\\n`;
    context += `## Active Financial Goals\\n`;
    for (const goal of goals) {
      const progress =
        (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100;
      context += `- **${goal.name}** (${goal.type}): R${Number(goal.currentAmount).toLocaleString()} / R${Number(goal.targetAmount).toLocaleString()} (${progress.toFixed(1)}%)\\n`;
      context += `  - Priority: ${goal.priority}\\n`;
      context += `  - Deadline: ${goal.deadline}\\n`;
      context += `  - Days remaining: ${goal.daysRemaining}\\n\\n`;
    }
    context += `## Today's Business Performance\\n`;
    context += `- **43V3R Revenue Today**: R${todayRevenue.toLocaleString()}\\n`;
    context += `- **Daily Target**: R4,881\\n`;
    context += `- **Progress**: ${((todayRevenue / 4881) * 100).toFixed(1)}%\\n\\n`;
    context += `## Recent Financial Activity (Last 10)\\n`;
    for (const tx of recentTransactions.slice(0, 10)) {
      context += `- ${tx.date}: ${tx.type} - R${Number(tx.amount).toLocaleString()} (${tx.category}) - ${tx.description}\\n`;
    }
    return context;
  }
  async generateDailyBriefing() {
    try {
      const financialContext = await this.getFinancialContext();
      const systemPrompt = `You are the LIF3 AI Agent, responsible for daily financial monitoring and business strategy insights. 

Your primary objectives:
1. Track progress toward R1,800,000 net worth goal
2. Monitor 43V3R business revenue (target: R4,881 daily)
3. Provide actionable financial insights
4. Identify optimization opportunities
5. Generate clear, executive-level briefings

Generate a comprehensive daily briefing that includes current status, progress analysis, and specific action items.`;
      const userPrompt = `${financialContext}

Based on the above financial data, generate today's LIF3 Daily Command Center briefing. Include:

1. Executive summary with key metrics
2. Progress toward R1,800,000 net worth goal
3. 43V3R business performance analysis
4. Today's priority actions
5. Strategic insights and recommendations
6. Any alerts or concerns that need attention

Format as a professional executive briefing with clear sections and actionable insights.`;
      const response = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });
      return response.content[0].text;
    } catch (error) {
      this.logger.error("Failed to generate daily briefing", error);
      throw new Error("Failed to generate daily briefing");
    }
  }
  async analyzeGoalProgress(goalId) {
    try {
      const financialContext = await this.getFinancialContext();
      let specificGoal = "";
      if (goalId) {
        const goal = await this.goalRepository.findOne({
          where: { id: goalId },
        });
        if (goal) {
          specificGoal = `\\n\\nFOCUS GOAL: Analyze specifically the progress on "${goal.name}" (${goal.type}) - Current: R${Number(goal.currentAmount).toLocaleString()}, Target: R${Number(goal.targetAmount).toLocaleString()}`;
        }
      }
      const response = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 3000,
        system:
          "You are a financial analysis AI focused on goal achievement and strategic planning.",
        messages: [
          {
            role: "user",
            content: `${financialContext}${specificGoal}

Analyze the goal progress and provide:
1. Current trajectory analysis
2. Required monthly/weekly/daily targets to stay on track
3. Specific recommendations for acceleration
4. Risk factors and mitigation strategies
5. Optimistic and realistic scenarios for achievement`,
          },
        ],
      });
      return response.content[0].text;
    } catch (error) {
      this.logger.error("Failed to analyze goal progress", error);
      throw new Error("Failed to analyze goal progress");
    }
  }
  async generateBusinessStrategy() {
    try {
      const financialContext = await this.getFinancialContext();
      const response = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 3000,
        system:
          "You are a business strategy AI advisor specializing in startup growth and revenue optimization.",
        messages: [
          {
            role: "user",
            content: `${financialContext}

Based on current 43V3R business performance and financial goals, provide strategic insights for:

1. Achieving consistent R4,881 daily revenue
2. Scaling to R147,917 monthly recurring revenue (MRR)
3. Revenue diversification strategies
4. Customer acquisition and retention
5. Pricing optimization opportunities
6. Market expansion possibilities
7. Operational efficiency improvements

Focus on actionable strategies that align with the R1,800,000 net worth goal timeline.`,
          },
        ],
      });
      return response.content[0].text;
    } catch (error) {
      this.logger.error("Failed to generate business strategy", error);
      throw new Error("Failed to generate business strategy");
    }
  }
  async scheduledDailyBriefing() {
    try {
      this.logger.log("Starting scheduled daily briefing generation...");
      const briefing = await this.generateDailyBriefing();
      const filename = `LIF3_Daily_Command_Center_${new Date().toISOString().split("T")[0]}.md`;
      const briefingData = {
        date: new Date().toISOString().split("T")[0],
        netWorth: 239625,
        dailyRevenue: 0,
        goalProgress: 13.3,
        transactions: [],
        businessMetrics: {
          dailyRevenue: 0,
          mrr: 0,
          weeklyTarget: 34167,
          monthlyTarget: 147917,
        },
      };
      await this.googleDriveService.createDailyBriefing(briefingData);
      this.logger.log(`Daily briefing generated and saved: ${filename}`);
    } catch (error) {
      this.logger.error("Failed to generate scheduled daily briefing", error);
    }
  }
  async monitorGoalProgress() {
    try {
      this.logger.log("Monitoring goal progress...");
      const netWorthGoal = await this.goalRepository.findOne({
        where: {
          type: goal_entity_1.GoalType.NET_WORTH,
          status: goal_entity_1.GoalStatus.ACTIVE,
        },
      });
      if (netWorthGoal) {
        const progress =
          (Number(netWorthGoal.currentAmount) /
            Number(netWorthGoal.targetAmount)) *
          100;
        const daysRemaining = netWorthGoal.daysRemaining;
        const requiredDailyGrowth =
          (Number(netWorthGoal.targetAmount) -
            Number(netWorthGoal.currentAmount)) /
          daysRemaining;
        if (progress < 50 - (daysRemaining / 730) * 50) {
          this.logger.warn(
            `Net worth goal falling behind target. Progress: ${progress.toFixed(1)}%, Required daily growth: R${requiredDailyGrowth.toFixed(0)}`,
          );
        }
      }
      const today = new Date();
      const todayTransactions = await this.transactionRepository.find({
        where: {
          date: today,
          type: transaction_entity_1.TransactionType.BUSINESS_REVENUE,
        },
      });
      const todayRevenue = todayTransactions.reduce(
        (sum, tx) => sum + Number(tx.amount),
        0,
      );
      if (todayRevenue < 4881 && new Date().getHours() > 18) {
        this.logger.warn(
          `Daily revenue target not met. Current: R${todayRevenue}, Target: R4,881`,
        );
      }
    } catch (error) {
      this.logger.error("Failed to monitor goal progress", error);
    }
  }
  async updateNetWorth(newAmount) {
    try {
      const netWorthGoal = await this.goalRepository.findOne({
        where: {
          type: goal_entity_1.GoalType.NET_WORTH,
          status: goal_entity_1.GoalStatus.ACTIVE,
        },
      });
      if (!netWorthGoal) {
        throw new Error("Net worth goal not found");
      }
      const previousAmount = Number(netWorthGoal.currentAmount);
      netWorthGoal.currentAmount = newAmount;
      await this.goalRepository.save(netWorthGoal);
      const analysis = await this.analyzeGoalProgress(netWorthGoal.id);
      this.logger.log(
        `Net worth updated: R${previousAmount.toLocaleString()} → R${newAmount.toLocaleString()}`,
      );
      return { success: true, analysis };
    } catch (error) {
      this.logger.error("Failed to update net worth", error);
      return { success: false, analysis: error.message };
    }
  }
  async logBusinessRevenue(amount, description = "43V3R Revenue") {
    try {
      const transaction = this.transactionRepository.create({
        amount,
        description,
        type: transaction_entity_1.TransactionType.BUSINESS_REVENUE,
        category: "BUSINESS_INCOME",
        date: new Date(),
        userId: "system",
        accountId: "business-account",
      });
      await this.transactionRepository.save(transaction);
      this.logger.log(
        `Business revenue logged: R${amount.toLocaleString()} - ${description}`,
      );
      return true;
    } catch (error) {
      this.logger.error("Failed to log business revenue", error);
      return false;
    }
  }
});
exports.AIAgentService = AIAgentService;
__decorate(
  [
    (0, schedule_1.Cron)("0 8 * * *"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise),
  ],
  AIAgentService.prototype,
  "scheduledDailyBriefing",
  null,
);
__decorate(
  [
    (0, schedule_1.Cron)("0 */6 * * *"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise),
  ],
  AIAgentService.prototype,
  "monitorGoalProgress",
  null,
);
exports.AIAgentService =
  AIAgentService =
  AIAgentService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __param(0, (0, typeorm_1.InjectRepository)(goal_entity_1.Goal)),
        __param(
          1,
          (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction),
        ),
        __param(
          2,
          (0, typeorm_1.InjectRepository)(
            business_metrics_entity_1.BusinessMetrics,
          ),
        ),
        __metadata("design:paramtypes", [
          typeorm_2.Repository,
          typeorm_2.Repository,
          typeorm_2.Repository,
          google_drive_service_1.GoogleDriveService,
        ]),
      ],
      AIAgentService,
    );
//# sourceMappingURL=ai-agent.service.js.map
