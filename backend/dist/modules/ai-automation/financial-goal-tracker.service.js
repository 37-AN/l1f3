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
var FinancialGoalTrackerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialGoalTrackerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const advanced_logger_service_1 = require("../../common/logger/advanced-logger.service");
const mcp_framework_service_1 = require("../mcp-framework/mcp-framework.service");
let FinancialGoalTrackerService = FinancialGoalTrackerService_1 = class FinancialGoalTrackerService {
    constructor(configService, advancedLogger, mcpFramework) {
        this.configService = configService;
        this.advancedLogger = advancedLogger;
        this.mcpFramework = mcpFramework;
        this.logger = new common_1.Logger(FinancialGoalTrackerService_1.name);
        this.goals = new Map();
        this.progressHistory = new Map();
        this.initializeDefaultGoals();
    }
    initializeDefaultGoals() {
        this.createGoal({
            id: 'net_worth_1800000',
            name: 'LIF3 Net Worth Target',
            type: 'net_worth',
            targetAmount: 1800000,
            currentAmount: 0,
            currency: 'ZAR',
            targetDate: new Date('2025-12-31'),
            strategy: 'ai_optimized',
            milestones: [
                {
                    id: 'milestone_25_percent',
                    name: '25% Net Worth Milestone',
                    targetAmount: 450000,
                    targetDate: new Date('2025-09-30'),
                    achieved: false,
                    automationTriggers: ['net_worth_tracking', 'expense_optimization'],
                },
                {
                    id: 'milestone_50_percent',
                    name: '50% Net Worth Milestone',
                    targetAmount: 900000,
                    targetDate: new Date('2025-11-30'),
                    achieved: false,
                    automationTriggers: ['revenue_boost_rules', 'investment_optimization'],
                },
                {
                    id: 'milestone_75_percent',
                    name: '75% Net Worth Milestone',
                    targetAmount: 1350000,
                    targetDate: new Date('2025-12-15'),
                    achieved: false,
                    automationTriggers: ['final_push_automation'],
                },
            ],
            automationRules: ['net_worth_tracking', 'expense_optimization'],
            metadata: {
                createdAt: new Date(),
                lastUpdated: new Date(),
                progressHistory: [],
                predictionAccuracy: 85,
            },
        });
        this.createGoal({
            id: 'daily_revenue_4881',
            name: '43V3R Daily Revenue Target',
            type: 'revenue',
            targetAmount: 4881,
            currentAmount: 0,
            currency: 'ZAR',
            targetDate: new Date('2025-12-31'),
            strategy: 'exponential',
            milestones: [
                {
                    id: 'revenue_milestone_1000',
                    name: 'R1,000 Daily Revenue',
                    targetAmount: 1000,
                    targetDate: new Date('2025-08-31'),
                    achieved: false,
                    automationTriggers: ['daily_revenue_tracking'],
                },
                {
                    id: 'revenue_milestone_2500',
                    name: 'R2,500 Daily Revenue',
                    targetAmount: 2500,
                    targetDate: new Date('2025-10-31'),
                    achieved: false,
                    automationTriggers: ['revenue_optimization'],
                },
            ],
            automationRules: ['daily_revenue_tracking'],
            metadata: {
                createdAt: new Date(),
                lastUpdated: new Date(),
                progressHistory: [],
                predictionAccuracy: 90,
            },
        });
        this.createGoal({
            id: 'mrr_147917',
            name: '43V3R MRR Target',
            type: 'mrr',
            targetAmount: 147917,
            currentAmount: 0,
            currency: 'ZAR',
            targetDate: new Date('2025-12-31'),
            strategy: 'milestone_based',
            milestones: [
                {
                    id: 'mrr_milestone_50k',
                    name: 'R50,000 MRR',
                    targetAmount: 50000,
                    targetDate: new Date('2025-09-30'),
                    achieved: false,
                    automationTriggers: ['mrr_optimization'],
                },
                {
                    id: 'mrr_milestone_100k',
                    name: 'R100,000 MRR',
                    targetAmount: 100000,
                    targetDate: new Date('2025-11-30'),
                    achieved: false,
                    automationTriggers: ['scale_automation'],
                },
            ],
            automationRules: ['revenue_tracking', 'subscription_optimization'],
            metadata: {
                createdAt: new Date(),
                lastUpdated: new Date(),
                progressHistory: [],
                predictionAccuracy: 80,
            },
        });
        this.logger.log(`Initialized ${this.goals.size} financial goals`);
    }
    createGoal(goal) {
        this.goals.set(goal.id, goal);
        this.progressHistory.set(goal.id, []);
        this.advancedLogger.logGoalTracking(`Financial goal created: ${goal.name}`, {
            goalType: goal.type,
            targetAmount: goal.targetAmount,
            currentAmount: goal.currentAmount,
            operation: 'goal_creation',
        });
        this.syncGoalToNotion(goal);
    }
    async updateGoalProgress(goalId, newAmount, source = 'automated', factors = []) {
        const goal = this.goals.get(goalId);
        if (!goal) {
            throw new Error(`Goal not found: ${goalId}`);
        }
        const oldAmount = goal.currentAmount;
        goal.currentAmount = newAmount;
        goal.metadata.lastUpdated = new Date();
        const progressPoint = {
            date: new Date(),
            amount: newAmount,
            source,
            confidence: source === 'automated' ? 95 : 100,
            factors,
        };
        this.addProgressPoint(goalId, progressPoint);
        const progressPercentage = (newAmount / goal.targetAmount) * 100;
        await this.checkMilestones(goal, newAmount);
        this.advancedLogger.logGoalTracking(`Goal progress updated: ${goal.name}`, {
            goalType: goal.type,
            targetAmount: goal.targetAmount,
            currentAmount: newAmount,
            progressPercentage,
            operation: 'progress_update',
            metadata: { oldAmount, increase: newAmount - oldAmount },
        });
        if (progressPercentage >= 25 && progressPercentage % 25 === 0) {
            await this.triggerProgressAutomation(goal, progressPercentage);
        }
        await this.syncGoalToNotion(goal);
        await this.syncGoalToAsana(goal);
    }
    async checkMilestones(goal, currentAmount) {
        for (const milestone of goal.milestones) {
            if (!milestone.achieved && currentAmount >= milestone.targetAmount) {
                milestone.achieved = true;
                milestone.achievedDate = new Date();
                this.advancedLogger.logGoalMilestone(goal.type, currentAmount, goal.targetAmount, (currentAmount / goal.targetAmount) * 100, {
                    operation: 'milestone_achieved',
                    metadata: { milestoneId: milestone.id, milestoneName: milestone.name },
                });
                for (const ruleId of milestone.automationTriggers) {
                    await this.triggerAutomationRule(ruleId, {
                        userId: 'system',
                        triggeredBy: 'milestone',
                        goalId: goal.id,
                        timestamp: new Date(),
                        data: {
                            milestone,
                            currentAmount,
                            goal,
                        },
                    });
                }
                await this.createMilestoneTask(goal, milestone);
            }
        }
    }
    addProgressPoint(goalId, progressPoint) {
        const history = this.progressHistory.get(goalId) || [];
        history.push(progressPoint);
        if (history.length > 1000) {
            history.shift();
        }
        this.progressHistory.set(goalId, history);
        const goal = this.goals.get(goalId);
        if (goal) {
            goal.metadata.progressHistory = history.slice(-10);
        }
    }
    calculateGoalAnalytics(goalId) {
        const goal = this.goals.get(goalId);
        const history = this.progressHistory.get(goalId) || [];
        if (!goal || history.length < 2) {
            return {
                velocity: 0,
                timeToCompletion: Infinity,
                trendDirection: 'stable',
                confidence: 0,
                recommendations: [],
            };
        }
        const recentHistory = history.slice(-30);
        const timeSpan = recentHistory.length > 1
            ? (recentHistory[recentHistory.length - 1].date.getTime() - recentHistory[0].date.getTime()) / (1000 * 60 * 60 * 24)
            : 1;
        const amountChange = recentHistory[recentHistory.length - 1].amount - recentHistory[0].amount;
        const velocity = amountChange / timeSpan;
        const remainingAmount = goal.targetAmount - goal.currentAmount;
        const timeToCompletion = velocity > 0 ? remainingAmount / velocity : Infinity;
        const trendDirection = velocity > 100 ? 'up' : velocity < -100 ? 'down' : 'stable';
        const velocities = recentHistory.slice(1).map((point, index) => {
            const prevPoint = recentHistory[index];
            const timeDiff = (point.date.getTime() - prevPoint.date.getTime()) / (1000 * 60 * 60 * 24);
            return (point.amount - prevPoint.amount) / timeDiff;
        });
        const avgVelocity = velocities.reduce((sum, v) => sum + v, 0) / velocities.length;
        const variance = velocities.reduce((sum, v) => sum + Math.pow(v - avgVelocity, 2), 0) / velocities.length;
        const confidence = Math.max(0, Math.min(100, 100 - (variance / avgVelocity) * 10));
        const recommendations = this.generateProgressRecommendations(goal, velocity, trendDirection);
        return {
            velocity,
            timeToCompletion,
            trendDirection,
            confidence,
            recommendations,
        };
    }
    generateProgressRecommendations(goal, velocity, trend) {
        const recommendations = [];
        if (trend === 'down' || velocity < 100) {
            recommendations.push({
                id: `rec_${Date.now()}_velocity_boost`,
                type: 'revenue_boost',
                title: 'Accelerate Goal Progress',
                description: 'Current velocity is below target. Consider implementing these strategies.',
                impact: {
                    timeReduction: 60,
                    amountIncrease: velocity * 30,
                    riskReduction: 0.2,
                },
                effort: 'medium',
                priority: 8,
                automatable: true,
                suggestedActions: [
                    'Increase income streams',
                    'Optimize expense categories',
                    'Review investment allocation',
                    'Implement automatic savings increases',
                ],
            });
        }
        if (goal.type === 'net_worth' && goal.currentAmount < goal.targetAmount * 0.5) {
            recommendations.push({
                id: `rec_${Date.now()}_net_worth_strategy`,
                type: 'optimize_investments',
                title: 'Optimize Net Worth Growth Strategy',
                description: 'Focus on high-impact wealth building activities.',
                impact: {
                    timeReduction: 90,
                    amountIncrease: goal.targetAmount * 0.15,
                    riskReduction: 0.1,
                },
                effort: 'high',
                priority: 9,
                automatable: false,
                suggestedActions: [
                    'Diversify investment portfolio',
                    'Increase high-yield savings rate',
                    'Explore additional revenue streams',
                    'Optimize tax strategies',
                ],
            });
        }
        return recommendations;
    }
    async triggerAutomationRule(ruleId, context) {
        try {
            this.advancedLogger.logAutomationTrigger(ruleId, context.triggeredBy, 'goal_milestone', true, {
                metadata: { goalId: context.goalId, userId: context.userId },
            });
        }
        catch (error) {
            this.logger.error(`Failed to trigger automation rule ${ruleId}:`, error);
        }
    }
    async triggerProgressAutomation(goal, progressPercentage) {
        const context = {
            userId: 'system',
            triggeredBy: 'condition',
            goalId: goal.id,
            timestamp: new Date(),
            data: {
                goal,
                progressPercentage,
                milestone: `${progressPercentage}%`,
            },
        };
        for (const ruleId of goal.automationRules) {
            await this.triggerAutomationRule(ruleId, context);
        }
    }
    async syncGoalToNotion(goal) {
        try {
            const message = {
                jsonrpc: '2.0',
                id: `notion_sync_${Date.now()}`,
                method: 'update_page',
                params: {
                    page_id: `goal_${goal.id}`,
                    properties: {
                        'Goal Name': { title: [{ text: { content: goal.name } }] },
                        'Target Amount': { number: goal.targetAmount },
                        'Current Amount': { number: goal.currentAmount },
                        'Progress': { number: (goal.currentAmount / goal.targetAmount) * 100 },
                        'Currency': { select: { name: goal.currency } },
                        'Target Date': { date: { start: goal.targetDate.toISOString().split('T')[0] } },
                        'Strategy': { select: { name: goal.strategy } },
                    },
                },
            };
            await this.mcpFramework.sendMessage('notion_server', message);
        }
        catch (error) {
            this.logger.error('Failed to sync goal to Notion:', error);
        }
    }
    async syncGoalToAsana(goal) {
        try {
            const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;
            const message = {
                jsonrpc: '2.0',
                id: `asana_sync_${Date.now()}`,
                method: 'update_task',
                params: {
                    task_gid: `goal_${goal.id}`,
                    name: `${goal.name} - ${progressPercentage.toFixed(1)}% Complete`,
                    notes: `Target: ${goal.currency} ${goal.targetAmount.toLocaleString()}\nCurrent: ${goal.currency} ${goal.currentAmount.toLocaleString()}\nRemaining: ${goal.currency} ${(goal.targetAmount - goal.currentAmount).toLocaleString()}`,
                    completed: progressPercentage >= 100,
                },
            };
            await this.mcpFramework.sendMessage('asana_server', message);
        }
        catch (error) {
            this.logger.error('Failed to sync goal to Asana:', error);
        }
    }
    async createMilestoneTask(goal, milestone) {
        try {
            const message = {
                jsonrpc: '2.0',
                id: `milestone_task_${Date.now()}`,
                method: 'create_task',
                params: {
                    name: `🎉 Milestone Achieved: ${milestone.name}`,
                    notes: `Congratulations! You've achieved the ${milestone.name} milestone for ${goal.name}.\n\nAchieved Amount: ${goal.currency} ${milestone.targetAmount.toLocaleString()}\nAchieved Date: ${milestone.achievedDate?.toLocaleDateString()}\n\nNext milestone: Continue progressing toward ${goal.currency} ${goal.targetAmount.toLocaleString()}`,
                    completed: false,
                    projects: ['financial_goals'],
                },
            };
            await this.mcpFramework.sendMessage('asana_server', message);
        }
        catch (error) {
            this.logger.error('Failed to create milestone task:', error);
        }
    }
    async monitorGoalProgress() {
        this.logger.log('Running scheduled goal progress monitoring');
        for (const goal of this.goals.values()) {
            const analytics = this.calculateGoalAnalytics(goal.id);
            this.advancedLogger.logGoalTracking(`Goal analytics: ${goal.name}`, {
                goalType: goal.type,
                targetAmount: goal.targetAmount,
                currentAmount: goal.currentAmount,
                progressPercentage: (goal.currentAmount / goal.targetAmount) * 100,
                operation: 'progress_monitoring',
                metadata: analytics,
            });
            if (analytics.trendDirection === 'down' && analytics.confidence > 70) {
                await this.createProgressAlert(goal, analytics);
            }
        }
    }
    async createProgressAlert(goal, analytics) {
        const message = {
            jsonrpc: '2.0',
            id: `alert_${Date.now()}`,
            method: 'create_task',
            params: {
                name: `⚠️ Goal Progress Alert: ${goal.name}`,
                notes: `Goal progress has slowed down or reversed. Current velocity: ${analytics.velocity.toFixed(2)} per day.\n\nRecommendations:\n${analytics.recommendations.map(r => `- ${r.title}: ${r.description}`).join('\n')}`,
                priority: 'high',
                projects: ['financial_alerts'],
            },
        };
        await this.mcpFramework.sendMessage('asana_server', message);
    }
    getGoals() {
        return Array.from(this.goals.values());
    }
    getGoal(goalId) {
        return this.goals.get(goalId);
    }
    getGoalProgress(goalId) {
        return this.progressHistory.get(goalId) || [];
    }
    getGoalAnalytics(goalId) {
        return this.calculateGoalAnalytics(goalId);
    }
    async manualProgressUpdate(goalId, amount, source = 'manual') {
        await this.updateGoalProgress(goalId, amount, source, ['manual_update']);
    }
};
exports.FinancialGoalTrackerService = FinancialGoalTrackerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_6_HOURS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FinancialGoalTrackerService.prototype, "monitorGoalProgress", null);
exports.FinancialGoalTrackerService = FinancialGoalTrackerService = FinancialGoalTrackerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        advanced_logger_service_1.AdvancedLoggerService,
        mcp_framework_service_1.MCPFrameworkService])
], FinancialGoalTrackerService);
//# sourceMappingURL=financial-goal-tracker.service.js.map