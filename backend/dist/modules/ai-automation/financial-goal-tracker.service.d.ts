import { ConfigService } from '@nestjs/config';
import { AdvancedLoggerService } from '../../common/logger/advanced-logger.service';
import { MCPFrameworkService } from '../mcp-framework/mcp-framework.service';
import { FinancialGoal, ProgressPoint, AIRecommendation } from './interfaces/ai-automation.interface';
export declare class FinancialGoalTrackerService {
    private readonly configService;
    private readonly advancedLogger;
    private readonly mcpFramework;
    private readonly logger;
    private goals;
    private progressHistory;
    constructor(configService: ConfigService, advancedLogger: AdvancedLoggerService, mcpFramework: MCPFrameworkService);
    private initializeDefaultGoals;
    createGoal(goal: FinancialGoal): void;
    updateGoalProgress(goalId: string, newAmount: number, source?: 'manual' | 'automated' | 'calculated', factors?: string[]): Promise<void>;
    private checkMilestones;
    private addProgressPoint;
    calculateGoalAnalytics(goalId: string): {
        velocity: number;
        timeToCompletion: number;
        trendDirection: 'up' | 'down' | 'stable';
        confidence: number;
        recommendations: AIRecommendation[];
    };
    private generateProgressRecommendations;
    private triggerAutomationRule;
    private triggerProgressAutomation;
    private syncGoalToNotion;
    private syncGoalToAsana;
    private createMilestoneTask;
    monitorGoalProgress(): Promise<void>;
    private createProgressAlert;
    getGoals(): FinancialGoal[];
    getGoal(goalId: string): FinancialGoal | undefined;
    getGoalProgress(goalId: string): ProgressPoint[];
    getGoalAnalytics(goalId: string): {
        velocity: number;
        timeToCompletion: number;
        trendDirection: "up" | "down" | "stable";
        confidence: number;
        recommendations: AIRecommendation[];
    };
    manualProgressUpdate(goalId: string, amount: number, source?: string): Promise<void>;
}
