export interface AIRule {
    id: string;
    name: string;
    description: string;
    type: 'financial' | 'business' | 'goal_tracking' | 'expense_optimization' | 'revenue_tracking';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    enabled: boolean;
    schedule?: string;
    conditions: AICondition[];
    actions: AIAction[];
    metadata: {
        createdAt: Date;
        lastExecuted?: Date;
        executionCount: number;
        successRate: number;
        averageExecutionTime: number;
    };
}
export interface AICondition {
    id: string;
    type: 'threshold' | 'pattern' | 'trend' | 'anomaly' | 'schedule';
    field: string;
    operator: 'gt' | 'lt' | 'eq' | 'ne' | 'contains' | 'trend_up' | 'trend_down' | 'anomaly_detected';
    value: any;
    confidence?: number;
}
export interface AIAction {
    id: string;
    type: 'notification' | 'task_creation' | 'document_update' | 'calculation' | 'external_api' | 'mcp_sync';
    target: string;
    parameters: any;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    retryPolicy?: {
        maxRetries: number;
        retryDelay: number;
        exponentialBackoff: boolean;
    };
}
export interface FinancialGoal {
    id: string;
    name: string;
    type: 'net_worth' | 'revenue' | 'mrr' | 'savings' | 'investment' | 'expense_reduction';
    targetAmount: number;
    currentAmount: number;
    currency: string;
    targetDate: Date;
    strategy: 'linear' | 'exponential' | 'milestone_based' | 'ai_optimized';
    milestones: GoalMilestone[];
    automationRules: string[];
    metadata: {
        createdAt: Date;
        lastUpdated: Date;
        progressHistory: ProgressPoint[];
        predictionAccuracy: number;
    };
}
export interface GoalMilestone {
    id: string;
    name: string;
    targetAmount: number;
    targetDate: Date;
    achieved: boolean;
    achievedDate?: Date;
    reward?: string;
    automationTriggers: string[];
}
export interface ProgressPoint {
    date: Date;
    amount: number;
    source: 'manual' | 'automated' | 'calculated' | 'predicted';
    confidence: number;
    factors: string[];
}
export interface PredictionResult {
    goalId: string;
    predictedAmount: number;
    predictedDate: Date;
    confidence: number;
    scenarios: {
        optimistic: {
            amount: number;
            date: Date;
            probability: number;
        };
        realistic: {
            amount: number;
            date: Date;
            probability: number;
        };
        pessimistic: {
            amount: number;
            date: Date;
            probability: number;
        };
    };
    recommendations: AIRecommendation[];
    riskFactors: string[];
}
export interface AIRecommendation {
    id: string;
    type: 'increase_savings' | 'reduce_expenses' | 'optimize_investments' | 'revenue_boost' | 'risk_mitigation';
    title: string;
    description: string;
    impact: {
        timeReduction: number;
        amountIncrease: number;
        riskReduction: number;
    };
    effort: 'low' | 'medium' | 'high';
    priority: number;
    automatable: boolean;
    suggestedActions: string[];
}
export interface ExpenseAnalysis {
    totalExpenses: number;
    categories: ExpenseCategory[];
    trends: ExpenseTrend[];
    anomalies: ExpenseAnomaly[];
    optimizations: ExpenseOptimization[];
    savingsPotential: number;
}
export interface ExpenseCategory {
    name: string;
    amount: number;
    percentage: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    subcategories: {
        name: string;
        amount: number;
        necessity: 'essential' | 'important' | 'optional' | 'luxury';
    }[];
}
export interface ExpenseTrend {
    category: string;
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    duration: number;
    significance: 'low' | 'medium' | 'high';
}
export interface ExpenseAnomaly {
    date: Date;
    category: string;
    amount: number;
    expectedAmount: number;
    deviation: number;
    severity: 'low' | 'medium' | 'high';
    description: string;
    investigated: boolean;
}
export interface ExpenseOptimization {
    category: string;
    currentAmount: number;
    recommendedAmount: number;
    savingsAmount: number;
    difficulty: 'easy' | 'medium' | 'hard';
    strategy: string;
    automatable: boolean;
    riskLevel: 'low' | 'medium' | 'high';
}
export interface RevenueTracking {
    dailyTarget: number;
    currentDaily: number;
    monthlyTarget: number;
    currentMonthly: number;
    trends: RevenueTrend[];
    forecasts: RevenueForecast[];
    optimizations: RevenueOptimization[];
}
export interface RevenueTrend {
    period: 'daily' | 'weekly' | 'monthly';
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    factors: string[];
    confidence: number;
}
export interface RevenueForecast {
    period: 'week' | 'month' | 'quarter';
    predictedAmount: number;
    confidence: number;
    scenarios: {
        best: number;
        worst: number;
        likely: number;
    };
}
export interface RevenueOptimization {
    strategy: string;
    expectedIncrease: number;
    timeframe: number;
    effort: 'low' | 'medium' | 'high';
    probability: number;
    dependencies: string[];
}
export interface AutomationContext {
    userId: string;
    sessionId?: string;
    triggeredBy: 'schedule' | 'event' | 'manual' | 'condition' | 'milestone';
    ruleId?: string;
    goalId?: string;
    timestamp: Date;
    data: any;
}
export interface ExecutionResult {
    success: boolean;
    executionTime: number;
    actions: {
        actionId: string;
        success: boolean;
        result?: any;
        error?: string;
        executionTime: number;
    }[];
    recommendations: AIRecommendation[];
    nextExecution?: Date;
}
