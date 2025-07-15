import { AIAgentService } from "./ai-agent.service";
declare class LogRevenueDto {
  amount: number;
  description?: string;
}
declare class UpdateNetWorthDto {
  newAmount: number;
}
export declare class AIAgentController {
  private readonly aiAgentService;
  private readonly logger;
  constructor(aiAgentService: AIAgentService);
  getDailyBriefing(): Promise<{
    briefing: string;
    generated_at: string;
  }>;
  analyzeGoalProgress(goalId?: string): Promise<{
    analysis: string;
    goal_id: string;
    generated_at: string;
  }>;
  getBusinessStrategy(): Promise<{
    strategy: string;
    generated_at: string;
  }>;
  logRevenue(logRevenueDto: LogRevenueDto): Promise<{
    success: boolean;
    amount: number;
    description: string;
    logged_at: string;
  }>;
  updateNetWorth(updateNetWorthDto: UpdateNetWorthDto): Promise<{
    new_amount: number;
    updated_at: string;
    success: boolean;
    analysis: string;
  }>;
  getFinancialContext(): Promise<{
    context: string;
    generated_at: string;
  }>;
  getAgentStatus(): Promise<{
    status: string;
    version: string;
    last_briefing: string;
    monitoring: {
      goal_progress: string;
      revenue_tracking: string;
      financial_analysis: string;
    };
    integrations: {
      claude_ai: string;
      google_drive: string;
      lif3_backend: string;
    };
    timestamp: string;
  }>;
}
export {};
