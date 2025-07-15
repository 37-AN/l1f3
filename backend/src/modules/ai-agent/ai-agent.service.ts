import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cron, CronExpression } from "@nestjs/schedule";
import {
  Goal,
  GoalType,
  GoalStatus,
} from "../../database/entities/goal.entity";
import {
  Transaction,
  TransactionType,
} from "../../database/entities/transaction.entity";
import { BusinessMetrics } from "../../database/entities/business-metrics.entity";
import { GoogleDriveService } from "../integrations/google-drive.service";
import Anthropic from "@anthropic-ai/sdk";

export interface DailyBriefing {
  date: string;
  netWorthProgress: {
    current: number;
    target: number;
    progress: number;
    required_monthly_growth: number;
  };
  businessMetrics: {
    daily_revenue: number;
    daily_target: number;
    monthly_progress: number;
  };
  todaysPriorities: string[];
  insights: string[];
  alerts: string[];
}

@Injectable()
export class AIAgentService {
  private readonly logger = new Logger(AIAgentService.name);
  private anthropic: Anthropic;

  constructor(
    @InjectRepository(Goal)
    private goalRepository: Repository<Goal>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(BusinessMetrics)
    private businessMetricsRepository: Repository<BusinessMetrics>,
    private googleDriveService: GoogleDriveService,
  ) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async getFinancialContext(): Promise<string> {
    const goals = await this.goalRepository.find({
      where: { status: GoalStatus.ACTIVE },
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
        type: TransactionType.BUSINESS_REVENUE,
      },
    });

    const todayRevenue = todayTransactions.reduce(
      (sum, tx) => sum + Number(tx.amount),
      0,
    );

    let context = `# LIF3 FINANCIAL SYSTEM CONTEXT\\n\\n`;
    context += `**Generated**: ${new Date().toISOString()}\\n\\n`;

    // Goals section
    context += `## Active Financial Goals\\n`;
    for (const goal of goals) {
      const progress =
        (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100;
      context += `- **${goal.name}** (${goal.type}): R${Number(goal.currentAmount).toLocaleString()} / R${Number(goal.targetAmount).toLocaleString()} (${progress.toFixed(1)}%)\\n`;
      context += `  - Priority: ${goal.priority}\\n`;
      context += `  - Deadline: ${goal.deadline}\\n`;
      context += `  - Days remaining: ${goal.daysRemaining}\\n\\n`;
    }

    // Today's business metrics
    context += `## Today's Business Performance\\n`;
    context += `- **43V3R Revenue Today**: R${todayRevenue.toLocaleString()}\\n`;
    context += `- **Daily Target**: R4,881\\n`;
    context += `- **Progress**: ${((todayRevenue / 4881) * 100).toFixed(1)}%\\n\\n`;

    // Recent transactions
    context += `## Recent Financial Activity (Last 10)\\n`;
    for (const tx of recentTransactions.slice(0, 10)) {
      context += `- ${tx.date}: ${tx.type} - R${Number(tx.amount).toLocaleString()} (${tx.category}) - ${tx.description}\\n`;
    }

    return context;
  }

  async generateDailyBriefing(): Promise<string> {
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

  async analyzeGoalProgress(goalId?: string): Promise<string> {
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

  async generateBusinessStrategy(): Promise<string> {
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

  @Cron("0 8 * * *") // Daily at 8 AM
  async scheduledDailyBriefing() {
    try {
      this.logger.log("Starting scheduled daily briefing generation...");

      const briefing = await this.generateDailyBriefing();
      const filename = `LIF3_Daily_Command_Center_${new Date().toISOString().split("T")[0]}.md`;

      // Save to Google Drive using existing method
      const briefingData = {
        date: new Date().toISOString().split("T")[0],
        netWorth: 239625, // Current status
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

  @Cron("0 */6 * * *") // Every 6 hours
  async monitorGoalProgress() {
    try {
      this.logger.log("Monitoring goal progress...");

      const netWorthGoal = await this.goalRepository.findOne({
        where: { type: GoalType.NET_WORTH, status: GoalStatus.ACTIVE },
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

        // Generate alert if falling behind
        if (progress < 50 - (daysRemaining / 730) * 50) {
          // Rough calculation for being on track
          this.logger.warn(
            `Net worth goal falling behind target. Progress: ${progress.toFixed(1)}%, Required daily growth: R${requiredDailyGrowth.toFixed(0)}`,
          );
        }
      }

      // Monitor business revenue
      const today = new Date();
      const todayTransactions = await this.transactionRepository.find({
        where: {
          date: today,
          type: TransactionType.BUSINESS_REVENUE,
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

  async updateNetWorth(
    newAmount: number,
  ): Promise<{ success: boolean; analysis: string }> {
    try {
      const netWorthGoal = await this.goalRepository.findOne({
        where: { type: GoalType.NET_WORTH, status: GoalStatus.ACTIVE },
      });

      if (!netWorthGoal) {
        throw new Error("Net worth goal not found");
      }

      const previousAmount = Number(netWorthGoal.currentAmount);
      netWorthGoal.currentAmount = newAmount;
      await this.goalRepository.save(netWorthGoal);

      // Generate analysis of the update
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

  async logBusinessRevenue(
    amount: number,
    description: string = "43V3R Revenue",
  ): Promise<boolean> {
    try {
      const transaction = this.transactionRepository.create({
        amount,
        description,
        type: TransactionType.BUSINESS_REVENUE,
        category: "BUSINESS_INCOME" as any,
        date: new Date(),
        userId: "system", // Replace with actual user ID
        accountId: "business-account", // Replace with actual business account ID
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
}
