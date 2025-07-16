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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AIAutomationController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAutomationController = exports.ExecuteWorkflowDto = exports.CreateRuleDto = exports.UpdateGoalProgressDto = exports.CreateGoalDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ai_automation_service_1 = require("./ai-automation.service");
const ai_rules_engine_service_1 = require("./ai-rules-engine.service");
const financial_goal_tracker_service_1 = require("./financial-goal-tracker.service");
const predictive_analytics_service_1 = require("./predictive-analytics.service");
const advanced_logger_service_1 = require("../../common/logger/advanced-logger.service");
class CreateGoalDto {
}
exports.CreateGoalDto = CreateGoalDto;
class UpdateGoalProgressDto {
}
exports.UpdateGoalProgressDto = UpdateGoalProgressDto;
class CreateRuleDto {
}
exports.CreateRuleDto = CreateRuleDto;
class ExecuteWorkflowDto {
}
exports.ExecuteWorkflowDto = ExecuteWorkflowDto;
let AIAutomationController = AIAutomationController_1 = class AIAutomationController {
    constructor(aiAutomation, rulesEngine, goalTracker, predictiveAnalytics, advancedLogger) {
        this.aiAutomation = aiAutomation;
        this.rulesEngine = rulesEngine;
        this.goalTracker = goalTracker;
        this.predictiveAnalytics = predictiveAnalytics;
        this.advancedLogger = advancedLogger;
        this.logger = new common_1.Logger(AIAutomationController_1.name);
    }
    async getDashboard() {
        try {
            const dashboard = await this.aiAutomation.getAutomationDashboard();
            this.advancedLogger.logAutomation('Dashboard accessed', {
                operation: 'dashboard_access',
                success: true,
            });
            return {
                success: true,
                data: dashboard,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Failed to get dashboard:', error);
            throw new common_1.HttpException('Failed to retrieve dashboard', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getSystemStatus() {
        try {
            const status = await this.aiAutomation.getSystemStatus();
            return {
                success: true,
                data: status,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Failed to get system status:', error);
            throw new common_1.HttpException('Failed to retrieve system status', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getMetrics() {
        try {
            const metrics = this.aiAutomation.getAutomationMetrics();
            return {
                success: true,
                data: metrics,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Failed to get metrics:', error);
            throw new common_1.HttpException('Failed to retrieve metrics', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async executeWorkflow(dto) {
        try {
            const context = {
                userId: 'api_user',
                triggeredBy: 'manual',
                timestamp: new Date(),
                data: dto.context || {},
            };
            const result = await this.aiAutomation.executeAutomationWorkflow(dto.workflowType, context);
            this.advancedLogger.logAutomation(`Manual workflow execution: ${dto.workflowType}`, {
                operation: 'manual_workflow_execution',
                success: result.success,
                metadata: { workflowType: dto.workflowType },
            });
            return {
                success: true,
                data: result,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Failed to execute workflow:', error);
            throw new common_1.HttpException('Failed to execute workflow', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async triggerWorkflow(workflowType) {
        try {
            const result = await this.aiAutomation.triggerManualAutomation(workflowType, 'api_user');
            return {
                success: true,
                data: result,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error(`Failed to trigger workflow ${workflowType}:`, error);
            throw new common_1.HttpException('Failed to trigger workflow', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getGoals() {
        try {
            const goals = this.goalTracker.getGoals();
            return {
                success: true,
                data: goals,
                count: goals.length,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Failed to get goals:', error);
            throw new common_1.HttpException('Failed to retrieve goals', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getGoal(goalId) {
        try {
            const goal = this.goalTracker.getGoal(goalId);
            if (!goal) {
                throw new common_1.HttpException('Goal not found', common_1.HttpStatus.NOT_FOUND);
            }
            const analytics = this.goalTracker.getGoalAnalytics(goalId);
            const progressHistory = this.goalTracker.getGoalProgress(goalId);
            const prediction = this.predictiveAnalytics.getPrediction(goalId);
            return {
                success: true,
                data: {
                    goal,
                    analytics,
                    progressHistory: progressHistory.slice(-30),
                    prediction,
                },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error(`Failed to get goal ${goalId}:`, error);
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException('Failed to retrieve goal', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createGoal(dto) {
        try {
            const goal = {
                id: `goal_${Date.now()}`,
                name: dto.name,
                type: dto.type,
                targetAmount: dto.targetAmount,
                currentAmount: 0,
                currency: dto.currency,
                targetDate: new Date(dto.targetDate),
                strategy: dto.strategy,
                milestones: [],
                automationRules: [],
                metadata: {
                    createdAt: new Date(),
                    lastUpdated: new Date(),
                    progressHistory: [],
                    predictionAccuracy: 85,
                },
            };
            this.goalTracker.createGoal(goal);
            this.advancedLogger.logGoalTracking(`New goal created: ${goal.name}`, {
                goalType: goal.type,
                targetAmount: goal.targetAmount,
                operation: 'goal_creation_api',
            });
            return {
                success: true,
                data: goal,
                message: 'Goal created successfully',
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Failed to create goal:', error);
            throw new common_1.HttpException('Failed to create goal', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateGoalProgress(goalId, dto) {
        try {
            await this.goalTracker.updateGoalProgress(goalId, dto.amount, dto.source || 'manual', dto.factors || ['manual_api_update']);
            const goal = this.goalTracker.getGoal(goalId);
            const analytics = this.goalTracker.getGoalAnalytics(goalId);
            return {
                success: true,
                data: {
                    goal,
                    analytics,
                },
                message: 'Goal progress updated successfully',
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error(`Failed to update goal progress ${goalId}:`, error);
            throw new common_1.HttpException('Failed to update goal progress', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getGoalAnalytics(goalId) {
        try {
            const analytics = this.goalTracker.getGoalAnalytics(goalId);
            return {
                success: true,
                data: analytics,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error(`Failed to get goal analytics ${goalId}:`, error);
            throw new common_1.HttpException('Failed to retrieve goal analytics', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getGoalPrediction(goalId) {
        try {
            const prediction = this.predictiveAnalytics.getPrediction(goalId);
            if (!prediction) {
                const goal = this.goalTracker.getGoal(goalId);
                if (!goal) {
                    throw new common_1.HttpException('Goal not found', common_1.HttpStatus.NOT_FOUND);
                }
                const progressHistory = this.goalTracker.getGoalProgress(goalId);
                const newPrediction = await this.predictiveAnalytics.generateGoalPrediction(goal, progressHistory);
                return {
                    success: true,
                    data: newPrediction,
                    generated: true,
                    timestamp: new Date().toISOString(),
                };
            }
            return {
                success: true,
                data: prediction,
                generated: false,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error(`Failed to get goal prediction ${goalId}:`, error);
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException('Failed to retrieve goal prediction', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getRules() {
        try {
            const rules = this.rulesEngine.getRules();
            return {
                success: true,
                data: rules,
                count: rules.length,
                active: rules.filter(r => r.enabled).length,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Failed to get rules:', error);
            throw new common_1.HttpException('Failed to retrieve rules', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getRule(ruleId) {
        try {
            const rule = this.rulesEngine.getRule(ruleId);
            if (!rule) {
                throw new common_1.HttpException('Rule not found', common_1.HttpStatus.NOT_FOUND);
            }
            const executionHistory = this.rulesEngine.getExecutionHistory(ruleId);
            return {
                success: true,
                data: {
                    rule,
                    executionHistory: executionHistory.slice(-10),
                },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error(`Failed to get rule ${ruleId}:`, error);
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException('Failed to retrieve rule', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createRule(dto) {
        try {
            const rule = {
                id: `rule_${Date.now()}`,
                name: dto.name,
                description: dto.description,
                type: dto.type,
                priority: dto.priority,
                enabled: true,
                schedule: dto.schedule,
                conditions: dto.conditions,
                actions: dto.actions,
                metadata: {
                    createdAt: new Date(),
                    executionCount: 0,
                    successRate: 100,
                    averageExecutionTime: 0,
                },
            };
            this.rulesEngine.registerRule(rule);
            this.advancedLogger.logAutomation(`New rule created: ${rule.name}`, {
                ruleId: rule.id,
                operation: 'rule_creation_api',
            });
            return {
                success: true,
                data: rule,
                message: 'Rule created successfully',
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Failed to create rule:', error);
            throw new common_1.HttpException('Failed to create rule', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async enableRule(ruleId) {
        try {
            this.rulesEngine.enableRule(ruleId);
            return {
                success: true,
                message: 'Rule enabled successfully',
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error(`Failed to enable rule ${ruleId}:`, error);
            throw new common_1.HttpException('Failed to enable rule', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async disableRule(ruleId) {
        try {
            this.rulesEngine.disableRule(ruleId);
            return {
                success: true,
                message: 'Rule disabled successfully',
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error(`Failed to disable rule ${ruleId}:`, error);
            throw new common_1.HttpException('Failed to disable rule', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async executeRule(ruleId) {
        try {
            const context = {
                userId: 'api_user',
                triggeredBy: 'manual',
                ruleId,
                timestamp: new Date(),
                data: {},
            };
            const result = await this.rulesEngine.executeRule(ruleId, context);
            return {
                success: true,
                data: result,
                message: 'Rule executed successfully',
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error(`Failed to execute rule ${ruleId}:`, error);
            throw new common_1.HttpException('Failed to execute rule', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getPredictions() {
        try {
            const goals = this.goalTracker.getGoals();
            const predictions = goals.map(goal => ({
                goalId: goal.id,
                goalName: goal.name,
                prediction: this.predictiveAnalytics.getPrediction(goal.id),
            })).filter(p => p.prediction);
            return {
                success: true,
                data: predictions,
                count: predictions.length,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Failed to get predictions:', error);
            throw new common_1.HttpException('Failed to retrieve predictions', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getModels() {
        try {
            const models = this.predictiveAnalytics.getModels();
            return {
                success: true,
                data: models,
                count: models.length,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Failed to get models:', error);
            throw new common_1.HttpException('Failed to retrieve models', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getMarketData() {
        try {
            const marketData = this.predictiveAnalytics.getMarketData();
            return {
                success: true,
                data: marketData,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Failed to get market data:', error);
            throw new common_1.HttpException('Failed to retrieve market data', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async generateCustomPrediction(goalId, scenario) {
        try {
            const prediction = await this.predictiveAnalytics.generateCustomPrediction(goalId, scenario);
            return {
                success: true,
                data: prediction,
                scenario,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error(`Failed to generate custom prediction for ${goalId}:`, error);
            throw new common_1.HttpException('Failed to generate custom prediction', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.AIAutomationController = AIAutomationController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get automation dashboard overview' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard data retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AIAutomationController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system status and health' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System status retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AIAutomationController.prototype, "getSystemStatus", null);
__decorate([
    (0, common_1.Get)('metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get automation metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Metrics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AIAutomationController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Post)('execute'),
    (0, swagger_1.ApiOperation)({ summary: 'Execute automation workflow' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Workflow executed successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ExecuteWorkflowDto]),
    __metadata("design:returntype", Promise)
], AIAutomationController.prototype, "executeWorkflow", null);
__decorate([
    (0, common_1.Post)('trigger/:workflowType'),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger specific automation workflow' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Workflow triggered successfully' }),
    __param(0, (0, common_1.Param)('workflowType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AIAutomationController.prototype, "triggerWorkflow", null);
__decorate([
    (0, common_1.Get)('goals'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all financial goals' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Goals retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AIAutomationController.prototype, "getGoals", null);
__decorate([
    (0, common_1.Get)('goals/:goalId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get specific financial goal' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Goal retrieved successfully' }),
    __param(0, (0, common_1.Param)('goalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AIAutomationController.prototype, "getGoal", null);
__decorate([
    (0, common_1.Post)('goals'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new financial goal' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Goal created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateGoalDto]),
    __metadata("design:returntype", Promise)
], AIAutomationController.prototype, "createGoal", null);
__decorate([
    (0, common_1.Put)('goals/:goalId/progress'),
    (0, swagger_1.ApiOperation)({ summary: 'Update goal progress' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Goal progress updated successfully' }),
    __param(0, (0, common_1.Param)('goalId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateGoalProgressDto]),
    __metadata("design:returntype", Promise)
], AIAutomationController.prototype, "updateGoalProgress", null);
__decorate([
    (0, common_1.Get)('goals/:goalId/analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get goal analytics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Goal analytics retrieved successfully' }),
    __param(0, (0, common_1.Param)('goalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AIAutomationController.prototype, "getGoalAnalytics", null);
__decorate([
    (0, common_1.Get)('goals/:goalId/prediction'),
    (0, swagger_1.ApiOperation)({ summary: 'Get goal prediction' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Goal prediction retrieved successfully' }),
    __param(0, (0, common_1.Param)('goalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AIAutomationController.prototype, "getGoalPrediction", null);
__decorate([
    (0, common_1.Get)('rules'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all automation rules' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Rules retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AIAutomationController.prototype, "getRules", null);
__decorate([
    (0, common_1.Get)('rules/:ruleId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get specific automation rule' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Rule retrieved successfully' }),
    __param(0, (0, common_1.Param)('ruleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AIAutomationController.prototype, "getRule", null);
__decorate([
    (0, common_1.Post)('rules'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new automation rule' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Rule created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateRuleDto]),
    __metadata("design:returntype", Promise)
], AIAutomationController.prototype, "createRule", null);
__decorate([
    (0, common_1.Put)('rules/:ruleId/enable'),
    (0, swagger_1.ApiOperation)({ summary: 'Enable automation rule' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Rule enabled successfully' }),
    __param(0, (0, common_1.Param)('ruleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AIAutomationController.prototype, "enableRule", null);
__decorate([
    (0, common_1.Put)('rules/:ruleId/disable'),
    (0, swagger_1.ApiOperation)({ summary: 'Disable automation rule' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Rule disabled successfully' }),
    __param(0, (0, common_1.Param)('ruleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AIAutomationController.prototype, "disableRule", null);
__decorate([
    (0, common_1.Post)('rules/:ruleId/execute'),
    (0, swagger_1.ApiOperation)({ summary: 'Execute automation rule manually' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Rule executed successfully' }),
    __param(0, (0, common_1.Param)('ruleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AIAutomationController.prototype, "executeRule", null);
__decorate([
    (0, common_1.Get)('predictions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all predictions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Predictions retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AIAutomationController.prototype, "getPredictions", null);
__decorate([
    (0, common_1.Get)('analytics/models'),
    (0, swagger_1.ApiOperation)({ summary: 'Get prediction models information' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Models information retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AIAutomationController.prototype, "getModels", null);
__decorate([
    (0, common_1.Get)('analytics/market-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Get market data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Market data retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AIAutomationController.prototype, "getMarketData", null);
__decorate([
    (0, common_1.Post)('analytics/custom-prediction/:goalId'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate custom prediction scenario' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Custom prediction generated successfully' }),
    __param(0, (0, common_1.Param)('goalId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AIAutomationController.prototype, "generateCustomPrediction", null);
exports.AIAutomationController = AIAutomationController = AIAutomationController_1 = __decorate([
    (0, swagger_1.ApiTags)('AI Automation'),
    (0, common_1.Controller)('api/ai-automation'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [ai_automation_service_1.AIAutomationService,
        ai_rules_engine_service_1.AIRulesEngineService,
        financial_goal_tracker_service_1.FinancialGoalTrackerService,
        predictive_analytics_service_1.PredictiveAnalyticsService,
        advanced_logger_service_1.AdvancedLoggerService])
], AIAutomationController);
//# sourceMappingURL=ai-automation.controller.js.map