import { AIAutomationService } from './ai-automation.service';
import { AIRulesEngineService } from './ai-rules-engine.service';
import { FinancialGoalTrackerService } from './financial-goal-tracker.service';
import { PredictiveAnalyticsService } from './predictive-analytics.service';
import { AdvancedLoggerService } from '../../common/logger/advanced-logger.service';
import { FinancialGoal, AIRule, ExecutionResult, PredictionResult } from './interfaces/ai-automation.interface';
export declare class CreateGoalDto {
    name: string;
    type: 'net_worth' | 'revenue' | 'mrr' | 'savings' | 'investment' | 'expense_reduction';
    targetAmount: number;
    currency: string;
    targetDate: string;
    strategy: 'linear' | 'exponential' | 'milestone_based' | 'ai_optimized';
}
export declare class UpdateGoalProgressDto {
    amount: number;
    source?: 'manual' | 'automated' | 'calculated';
    factors?: string[];
}
export declare class CreateRuleDto {
    name: string;
    description: string;
    type: 'financial' | 'business' | 'goal_tracking' | 'expense_optimization' | 'revenue_tracking';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    schedule?: string;
    conditions: any[];
    actions: any[];
}
export declare class ExecuteWorkflowDto {
    workflowType: 'financial_sync' | 'goal_tracking' | 'expense_analysis' | 'revenue_optimization';
    context?: any;
}
export declare class AIAutomationController {
    private readonly aiAutomation;
    private readonly rulesEngine;
    private readonly goalTracker;
    private readonly predictiveAnalytics;
    private readonly advancedLogger;
    private readonly logger;
    constructor(aiAutomation: AIAutomationService, rulesEngine: AIRulesEngineService, goalTracker: FinancialGoalTrackerService, predictiveAnalytics: PredictiveAnalyticsService, advancedLogger: AdvancedLoggerService);
    getDashboard(): Promise<{
        success: boolean;
        data: import("./ai-automation.service").AutomationDashboard;
        timestamp: string;
    }>;
    getSystemStatus(): Promise<{
        success: boolean;
        data: {
            status: "healthy" | "warning" | "error";
            components: {
                [key: string]: "healthy" | "warning" | "error";
            };
            metrics: import("./ai-automation.service").AutomationMetrics;
            uptime: number;
        };
        timestamp: string;
    }>;
    getMetrics(): Promise<{
        success: boolean;
        data: import("./ai-automation.service").AutomationMetrics;
        timestamp: string;
    }>;
    executeWorkflow(dto: ExecuteWorkflowDto): Promise<{
        success: boolean;
        data: ExecutionResult;
        timestamp: string;
    }>;
    triggerWorkflow(workflowType: string): Promise<{
        success: boolean;
        data: ExecutionResult;
        timestamp: string;
    }>;
    getGoals(): Promise<{
        success: boolean;
        data: FinancialGoal[];
        count: number;
        timestamp: string;
    }>;
    getGoal(goalId: string): Promise<{
        success: boolean;
        data: {
            goal: FinancialGoal;
            analytics: {
                velocity: number;
                timeToCompletion: number;
                trendDirection: "up" | "down" | "stable";
                confidence: number;
                recommendations: import("./interfaces/ai-automation.interface").AIRecommendation[];
            };
            progressHistory: import("./interfaces/ai-automation.interface").ProgressPoint[];
            prediction: PredictionResult;
        };
        timestamp: string;
    }>;
    createGoal(dto: CreateGoalDto): Promise<{
        success: boolean;
        data: FinancialGoal;
        message: string;
        timestamp: string;
    }>;
    updateGoalProgress(goalId: string, dto: UpdateGoalProgressDto): Promise<{
        success: boolean;
        data: {
            goal: FinancialGoal;
            analytics: {
                velocity: number;
                timeToCompletion: number;
                trendDirection: "up" | "down" | "stable";
                confidence: number;
                recommendations: import("./interfaces/ai-automation.interface").AIRecommendation[];
            };
        };
        message: string;
        timestamp: string;
    }>;
    getGoalAnalytics(goalId: string): Promise<{
        success: boolean;
        data: {
            velocity: number;
            timeToCompletion: number;
            trendDirection: "up" | "down" | "stable";
            confidence: number;
            recommendations: import("./interfaces/ai-automation.interface").AIRecommendation[];
        };
        timestamp: string;
    }>;
    getGoalPrediction(goalId: string): Promise<{
        success: boolean;
        data: PredictionResult;
        generated: boolean;
        timestamp: string;
    }>;
    getRules(): Promise<{
        success: boolean;
        data: AIRule[];
        count: number;
        active: number;
        timestamp: string;
    }>;
    getRule(ruleId: string): Promise<{
        success: boolean;
        data: {
            rule: AIRule;
            executionHistory: ExecutionResult[];
        };
        timestamp: string;
    }>;
    createRule(dto: CreateRuleDto): Promise<{
        success: boolean;
        data: AIRule;
        message: string;
        timestamp: string;
    }>;
    enableRule(ruleId: string): Promise<{
        success: boolean;
        message: string;
        timestamp: string;
    }>;
    disableRule(ruleId: string): Promise<{
        success: boolean;
        message: string;
        timestamp: string;
    }>;
    executeRule(ruleId: string): Promise<{
        success: boolean;
        data: ExecutionResult;
        message: string;
        timestamp: string;
    }>;
    getPredictions(): Promise<{
        success: boolean;
        data: {
            goalId: string;
            goalName: string;
            prediction: PredictionResult;
        }[];
        count: number;
        timestamp: string;
    }>;
    getModels(): Promise<{
        success: boolean;
        data: import("./predictive-analytics.service").PredictionModel[];
        count: number;
        timestamp: string;
    }>;
    getMarketData(): Promise<{
        success: boolean;
        data: import("./predictive-analytics.service").MarketData[];
        timestamp: string;
    }>;
    generateCustomPrediction(goalId: string, scenario: {
        savingsIncrease?: number;
        timeExtension?: number;
    }): Promise<{
        success: boolean;
        data: PredictionResult;
        scenario: {
            savingsIncrease?: number;
            timeExtension?: number;
        };
        timestamp: string;
    }>;
}
