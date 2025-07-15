import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Logger,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from "@nestjs/swagger";
import { AIAgentService } from "./ai-agent.service";

class LogRevenueDto {
  amount: number;
  description?: string;
}

class UpdateNetWorthDto {
  newAmount: number;
}

@ApiTags("AI Agent")
@Controller("api/ai-agent")
export class AIAgentController {
  private readonly logger = new Logger(AIAgentController.name);

  constructor(private readonly aiAgentService: AIAgentService) {}

  @Get("briefing/daily")
  @ApiOperation({ summary: "Generate daily LIF3 command center briefing" })
  @ApiResponse({
    status: 200,
    description: "Daily briefing generated successfully",
    schema: {
      type: "object",
      properties: {
        briefing: { type: "string" },
        generated_at: { type: "string" },
      },
    },
  })
  async getDailyBriefing() {
    try {
      this.logger.log("Generating daily briefing...");
      const briefing = await this.aiAgentService.generateDailyBriefing();

      return {
        briefing,
        generated_at: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error("Failed to generate daily briefing", error);
      throw error;
    }
  }

  @Get("analysis/goal-progress")
  @ApiOperation({ summary: "Analyze progress toward financial goals" })
  @ApiParam({
    name: "goalId",
    required: false,
    description: "Specific goal ID to analyze",
  })
  async analyzeGoalProgress(@Query("goalId") goalId?: string) {
    try {
      this.logger.log(
        `Analyzing goal progress${goalId ? ` for goal ${goalId}` : ""}...`,
      );
      const analysis = await this.aiAgentService.analyzeGoalProgress(goalId);

      return {
        analysis,
        goal_id: goalId,
        generated_at: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error("Failed to analyze goal progress", error);
      throw error;
    }
  }

  @Get("strategy/business")
  @ApiOperation({ summary: "Generate 43V3R business strategy insights" })
  async getBusinessStrategy() {
    try {
      this.logger.log("Generating business strategy insights...");
      const strategy = await this.aiAgentService.generateBusinessStrategy();

      return {
        strategy,
        generated_at: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error("Failed to generate business strategy", error);
      throw error;
    }
  }

  @Post("revenue/log")
  @ApiOperation({ summary: "Log 43V3R business revenue" })
  @ApiBody({ type: LogRevenueDto })
  async logRevenue(@Body() logRevenueDto: LogRevenueDto) {
    try {
      this.logger.log(`Logging revenue: R${logRevenueDto.amount}`);
      const success = await this.aiAgentService.logBusinessRevenue(
        logRevenueDto.amount,
        logRevenueDto.description || "43V3R Revenue",
      );

      return {
        success,
        amount: logRevenueDto.amount,
        description: logRevenueDto.description,
        logged_at: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error("Failed to log revenue", error);
      throw error;
    }
  }

  @Post("networth/update")
  @ApiOperation({ summary: "Update net worth and get analysis" })
  @ApiBody({ type: UpdateNetWorthDto })
  async updateNetWorth(@Body() updateNetWorthDto: UpdateNetWorthDto) {
    try {
      this.logger.log(`Updating net worth to: R${updateNetWorthDto.newAmount}`);
      const result = await this.aiAgentService.updateNetWorth(
        updateNetWorthDto.newAmount,
      );

      return {
        ...result,
        new_amount: updateNetWorthDto.newAmount,
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error("Failed to update net worth", error);
      throw error;
    }
  }

  @Get("context/financial")
  @ApiOperation({ summary: "Get current financial context for AI analysis" })
  async getFinancialContext() {
    try {
      const context = await this.aiAgentService.getFinancialContext();

      return {
        context,
        generated_at: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error("Failed to get financial context", error);
      throw error;
    }
  }

  @Get("status")
  @ApiOperation({ summary: "Get AI agent system status" })
  async getAgentStatus() {
    return {
      status: "active",
      version: "1.0.0",
      last_briefing: "scheduled_daily_8am",
      monitoring: {
        goal_progress: "every_6_hours",
        revenue_tracking: "real_time",
        financial_analysis: "on_demand",
      },
      integrations: {
        claude_ai: "connected",
        google_drive: "connected",
        lif3_backend: "connected",
      },
      timestamp: new Date().toISOString(),
    };
  }
}
