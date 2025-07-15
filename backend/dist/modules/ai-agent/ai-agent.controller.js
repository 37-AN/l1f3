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
var AIAgentController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAgentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ai_agent_service_1 = require("./ai-agent.service");
class LogRevenueDto {}
class UpdateNetWorthDto {}
let AIAgentController = (AIAgentController_1 = class AIAgentController {
  constructor(aiAgentService) {
    this.aiAgentService = aiAgentService;
    this.logger = new common_1.Logger(AIAgentController_1.name);
  }
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
  async analyzeGoalProgress(goalId) {
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
  async logRevenue(logRevenueDto) {
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
  async updateNetWorth(updateNetWorthDto) {
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
});
exports.AIAgentController = AIAgentController;
__decorate(
  [
    (0, common_1.Get)("briefing/daily"),
    (0, swagger_1.ApiOperation)({
      summary: "Generate daily LIF3 command center briefing",
    }),
    (0, swagger_1.ApiResponse)({
      status: 200,
      description: "Daily briefing generated successfully",
      schema: {
        type: "object",
        properties: {
          briefing: { type: "string" },
          generated_at: { type: "string" },
        },
      },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise),
  ],
  AIAgentController.prototype,
  "getDailyBriefing",
  null,
);
__decorate(
  [
    (0, common_1.Get)("analysis/goal-progress"),
    (0, swagger_1.ApiOperation)({
      summary: "Analyze progress toward financial goals",
    }),
    (0, swagger_1.ApiParam)({
      name: "goalId",
      required: false,
      description: "Specific goal ID to analyze",
    }),
    __param(0, (0, common_1.Query)("goalId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise),
  ],
  AIAgentController.prototype,
  "analyzeGoalProgress",
  null,
);
__decorate(
  [
    (0, common_1.Get)("strategy/business"),
    (0, swagger_1.ApiOperation)({
      summary: "Generate 43V3R business strategy insights",
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise),
  ],
  AIAgentController.prototype,
  "getBusinessStrategy",
  null,
);
__decorate(
  [
    (0, common_1.Post)("revenue/log"),
    (0, swagger_1.ApiOperation)({ summary: "Log 43V3R business revenue" }),
    (0, swagger_1.ApiBody)({ type: LogRevenueDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LogRevenueDto]),
    __metadata("design:returntype", Promise),
  ],
  AIAgentController.prototype,
  "logRevenue",
  null,
);
__decorate(
  [
    (0, common_1.Post)("networth/update"),
    (0, swagger_1.ApiOperation)({
      summary: "Update net worth and get analysis",
    }),
    (0, swagger_1.ApiBody)({ type: UpdateNetWorthDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UpdateNetWorthDto]),
    __metadata("design:returntype", Promise),
  ],
  AIAgentController.prototype,
  "updateNetWorth",
  null,
);
__decorate(
  [
    (0, common_1.Get)("context/financial"),
    (0, swagger_1.ApiOperation)({
      summary: "Get current financial context for AI analysis",
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise),
  ],
  AIAgentController.prototype,
  "getFinancialContext",
  null,
);
__decorate(
  [
    (0, common_1.Get)("status"),
    (0, swagger_1.ApiOperation)({ summary: "Get AI agent system status" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise),
  ],
  AIAgentController.prototype,
  "getAgentStatus",
  null,
);
exports.AIAgentController =
  AIAgentController =
  AIAgentController_1 =
    __decorate(
      [
        (0, swagger_1.ApiTags)("AI Agent"),
        (0, common_1.Controller)("api/ai-agent"),
        __metadata("design:paramtypes", [ai_agent_service_1.AIAgentService]),
      ],
      AIAgentController,
    );
//# sourceMappingURL=ai-agent.controller.js.map
