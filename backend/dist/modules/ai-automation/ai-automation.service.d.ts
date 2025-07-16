import { ConfigService } from '@nestjs/config';
import { AdvancedLoggerService } from '../../common/logger/advanced-logger.service';
import { MCPFrameworkService } from '../mcp-framework/mcp-framework.service';
import { AIRulesEngineService } from './ai-rules-engine.service';
import { FinancialGoalTrackerService } from './financial-goal-tracker.service';
import { PredictiveAnalyticsService } from './predictive-analytics.service';
import { AutomationContext, ExecutionResult, AIRecommendation } from './interfaces/ai-automation.interface';
export interface AutomationDashboard {
    activeRules: number;
    executedToday: number;
    successRate: number;
    goalProgress: {
        netWorth: number;
        dailyRevenue: number;
        mrr: number;
    };
    predictions: {
        netWorthCompletion: Date;
        revenueTarget: number;
        riskLevel: 'low' | 'medium' | 'high';
    };
    recommendations: AIRecommendation[];
    alerts: string[];
}
export interface AutomationMetrics {
    rulesExecuted: number;
    averageExecutionTime: number;
    successfulAutomations: number;
    failedAutomations: number;
    goalMilestonesAchieved: number;
    expenseOptimizationSavings: number;
    revenueIncrease: number;
    predictionAccuracy: number;
}
export declare class AIAutomationService {
    private readonly configService;
    private readonly advancedLogger;
    private readonly mcpFramework;
    private readonly rulesEngine;
    private readonly goalTracker;
    private readonly predictiveAnalytics;
    private readonly logger;
    private automationMetrics;
    constructor(configService: ConfigService, advancedLogger: AdvancedLoggerService, mcpFramework: MCPFrameworkService, rulesEngine: AIRulesEngineService, goalTracker: FinancialGoalTrackerService, predictiveAnalytics: PredictiveAnalyticsService);
    private initializeAutomationSystem;
    private initializeFinancialTargets;
    private fetchCurrentGoalAmount;
    private calculateNetWorth;
    private calculateDailyRevenue;
    private calculateMRR;
    private setupAutomationMonitoring;
    private initializePredictiveModels;
    executeAutomationWorkflow(workflowType: 'financial_sync' | 'goal_tracking' | 'expense_analysis' | 'revenue_optimization', context: AutomationContext): Promise<ExecutionResult>;
    private executeFinancialSyncWorkflow;
    private executeGoalTrackingWorkflow;
    private executeExpenseAnalysisWorkflow;
    private executeRevenueOptimizationWorkflow;
    private fetchExpenseData;
    private createExpenseOptimizationTasks;
    private createRevenueBoostTasks;
    private generateRevenueRecommendations;
    private updateAutomationMetrics;
    getAutomationDashboard(): Promise<AutomationDashboard>;
    private assessRiskLevel;
    private calculateSuccessRate;
    private generateSystemAlerts;
    executeScheduledAutomation(): Promise<void>;
    getAutomationMetrics(): AutomationMetrics;
    triggerManualAutomation(workflowType: string, userId: string): Promise<ExecutionResult>;
    getSystemStatus(): Promise<{
        status: 'healthy' | 'warning' | 'error';
        components: {
            [key: string]: 'healthy' | 'warning' | 'error';
        };
        metrics: AutomationMetrics;
        uptime: number;
    }>;
}
