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
var AIRulesEngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIRulesEngineService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const advanced_logger_service_1 = require("../../common/logger/advanced-logger.service");
const mcp_framework_service_1 = require("../mcp-framework/mcp-framework.service");
let AIRulesEngineService = AIRulesEngineService_1 = class AIRulesEngineService {
    constructor(configService, advancedLogger, mcpFramework) {
        this.configService = configService;
        this.advancedLogger = advancedLogger;
        this.mcpFramework = mcpFramework;
        this.logger = new common_1.Logger(AIRulesEngineService_1.name);
        this.rules = new Map();
        this.executionHistory = new Map();
        this.initializeDefaultRules();
    }
    initializeDefaultRules() {
        this.registerRule({
            id: 'net_worth_tracking',
            name: 'Net Worth Goal Progress Tracking',
            description: 'Monitor progress toward R1,800,000 net worth target',
            type: 'goal_tracking',
            priority: 'high',
            enabled: true,
            schedule: '0 */6 * * *',
            conditions: [
                {
                    id: 'net_worth_updated',
                    type: 'threshold',
                    field: 'net_worth',
                    operator: 'gt',
                    value: 0,
                },
            ],
            actions: [
                {
                    id: 'update_progress',
                    type: 'calculation',
                    target: 'goal_progress',
                    parameters: { goalId: 'net_worth_1800000' },
                    priority: 'high',
                },
                {
                    id: 'notify_milestone',
                    type: 'notification',
                    target: 'milestone_check',
                    parameters: { type: 'net_worth' },
                    priority: 'medium',
                },
                {
                    id: 'sync_notion',
                    type: 'mcp_sync',
                    target: 'notion_server',
                    parameters: { document_type: 'goal_tracking' },
                    priority: 'medium',
                },
            ],
            metadata: {
                createdAt: new Date(),
                executionCount: 0,
                successRate: 100,
                averageExecutionTime: 0,
            },
        });
        this.registerRule({
            id: 'daily_revenue_tracking',
            name: '43V3R Daily Revenue Tracking',
            description: 'Monitor daily revenue progress toward R4,881 target',
            type: 'revenue_tracking',
            priority: 'high',
            enabled: true,
            schedule: '0 */3 * * *',
            conditions: [
                {
                    id: 'revenue_updated',
                    type: 'threshold',
                    field: 'daily_revenue',
                    operator: 'gt',
                    value: 0,
                },
            ],
            actions: [
                {
                    id: 'check_daily_target',
                    type: 'calculation',
                    target: 'revenue_analysis',
                    parameters: { target: 4881, type: 'daily' },
                    priority: 'high',
                },
                {
                    id: 'create_action_task',
                    type: 'task_creation',
                    target: 'asana_server',
                    parameters: { condition: 'below_target' },
                    priority: 'medium',
                },
            ],
            metadata: {
                createdAt: new Date(),
                executionCount: 0,
                successRate: 100,
                averageExecutionTime: 0,
            },
        });
        this.registerRule({
            id: 'expense_optimization',
            name: 'Expense Analysis & Optimization',
            description: 'Analyze expenses and identify 25% reduction opportunities',
            type: 'expense_optimization',
            priority: 'medium',
            enabled: true,
            schedule: '0 0 */2 * *',
            conditions: [
                {
                    id: 'expense_pattern',
                    type: 'pattern',
                    field: 'expenses',
                    operator: 'trend_up',
                    value: 0.05,
                },
            ],
            actions: [
                {
                    id: 'analyze_expenses',
                    type: 'calculation',
                    target: 'expense_analysis',
                    parameters: { lookback_days: 30 },
                    priority: 'medium',
                },
                {
                    id: 'generate_recommendations',
                    type: 'calculation',
                    target: 'optimization_suggestions',
                    parameters: { target_reduction: 0.25 },
                    priority: 'medium',
                },
            ],
            metadata: {
                createdAt: new Date(),
                executionCount: 0,
                successRate: 100,
                averageExecutionTime: 0,
            },
        });
        this.registerRule({
            id: 'anomaly_detection',
            name: 'Financial Anomaly Detection',
            description: 'Detect unusual financial patterns and alert',
            type: 'financial',
            priority: 'urgent',
            enabled: true,
            schedule: '0 */1 * * *',
            conditions: [
                {
                    id: 'financial_anomaly',
                    type: 'anomaly',
                    field: 'financial_metrics',
                    operator: 'anomaly_detected',
                    value: 0.95,
                },
            ],
            actions: [
                {
                    id: 'alert_anomaly',
                    type: 'notification',
                    target: 'high_priority_alert',
                    parameters: { channels: ['discord', 'email'] },
                    priority: 'urgent',
                },
                {
                    id: 'investigate_anomaly',
                    type: 'task_creation',
                    target: 'asana_server',
                    parameters: { priority: 'urgent', type: 'investigation' },
                    priority: 'high',
                },
            ],
            metadata: {
                createdAt: new Date(),
                executionCount: 0,
                successRate: 100,
                averageExecutionTime: 0,
            },
        });
        this.logger.log(`Initialized ${this.rules.size} default AI automation rules`);
    }
    registerRule(rule) {
        this.rules.set(rule.id, rule);
        this.advancedLogger.logAutomation(`AI rule registered: ${rule.name}`, {
            ruleId: rule.id,
            operation: 'rule_registration',
            metadata: { priority: rule.priority },
        });
    }
    async executeScheduledRules() {
        const now = new Date();
        for (const rule of this.rules.values()) {
            if (!rule.enabled || !rule.schedule)
                continue;
            if (this.shouldExecuteRule(rule, now)) {
                await this.executeRule(rule.id, {
                    userId: 'system',
                    triggeredBy: 'schedule',
                    ruleId: rule.id,
                    timestamp: now,
                    data: {},
                });
            }
        }
    }
    async executeRule(ruleId, context) {
        const startTime = Date.now();
        const rule = this.rules.get(ruleId);
        if (!rule) {
            throw new Error(`Rule not found: ${ruleId}`);
        }
        this.advancedLogger.logAutomation(`Executing AI rule: ${rule.name}`, {
            ruleId,
            triggeredBy: context.triggeredBy,
            userId: context.userId,
            operation: 'rule_execution_start',
        });
        try {
            const conditionsMet = await this.evaluateConditions(rule.conditions, context);
            if (!conditionsMet) {
                this.logger.debug(`Rule conditions not met: ${rule.name}`);
                return {
                    success: true,
                    executionTime: Date.now() - startTime,
                    actions: [],
                    recommendations: [],
                };
            }
            const actionResults = await this.executeActions(rule.actions, context);
            const recommendations = await this.generateRecommendations(rule, context, actionResults);
            const result = {
                success: actionResults.every(a => a.success),
                executionTime: Date.now() - startTime,
                actions: actionResults,
                recommendations,
                nextExecution: this.calculateNextExecution(rule),
            };
            this.updateRuleMetadata(rule, result);
            this.storeExecutionHistory(ruleId, result);
            this.advancedLogger.logAutomation(`AI rule execution completed: ${rule.name}`, {
                ruleId,
                success: result.success,
                duration: result.executionTime,
                operation: 'rule_execution_complete',
                metadata: { actionsExecuted: result.actions.length },
            });
            return result;
        }
        catch (error) {
            this.advancedLogger.error(`AI rule execution failed: ${rule.name}`, error, {
                operation: 'rule_execution_error',
                metadata: { ruleId, userId: context.userId },
            });
            throw error;
        }
    }
    async evaluateConditions(conditions, context) {
        for (const condition of conditions) {
            const met = await this.evaluateCondition(condition, context);
            if (!met)
                return false;
        }
        return true;
    }
    async evaluateCondition(condition, context) {
        try {
            switch (condition.type) {
                case 'threshold':
                    return await this.evaluateThresholdCondition(condition, context);
                case 'pattern':
                    return await this.evaluatePatternCondition(condition, context);
                case 'trend':
                    return await this.evaluateTrendCondition(condition, context);
                case 'anomaly':
                    return await this.evaluateAnomalyCondition(condition, context);
                case 'schedule':
                    return await this.evaluateScheduleCondition(condition, context);
                default:
                    this.logger.warn(`Unknown condition type: ${condition.type}`);
                    return false;
            }
        }
        catch (error) {
            this.logger.error(`Error evaluating condition ${condition.id}:`, error);
            return false;
        }
    }
    async executeActions(actions, context) {
        const results = [];
        const sortedActions = actions.sort((a, b) => {
            const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
        for (const action of sortedActions) {
            const startTime = Date.now();
            try {
                const result = await this.executeAction(action, context);
                results.push({
                    actionId: action.id,
                    success: true,
                    result,
                    executionTime: Date.now() - startTime,
                });
            }
            catch (error) {
                results.push({
                    actionId: action.id,
                    success: false,
                    error: error.message,
                    executionTime: Date.now() - startTime,
                });
            }
        }
        return results;
    }
    async executeAction(action, context) {
        switch (action.type) {
            case 'notification':
                return await this.executeNotificationAction(action, context);
            case 'task_creation':
                return await this.executeTaskCreationAction(action, context);
            case 'document_update':
                return await this.executeDocumentUpdateAction(action, context);
            case 'calculation':
                return await this.executeCalculationAction(action, context);
            case 'external_api':
                return await this.executeExternalApiAction(action, context);
            case 'mcp_sync':
                return await this.executeMCPSyncAction(action, context);
            default:
                throw new Error(`Unknown action type: ${action.type}`);
        }
    }
    async executeNotificationAction(action, context) {
        this.logger.log(`Executing notification action: ${action.id}`);
        return { sent: true, channels: action.parameters.channels || ['dashboard'] };
    }
    async executeTaskCreationAction(action, context) {
        const message = {
            jsonrpc: '2.0',
            id: `task_${Date.now()}`,
            method: 'create_task',
            params: {
                ...action.parameters,
                automation_context: context,
            },
        };
        return await this.mcpFramework.sendMessage('asana_server', message);
    }
    async executeDocumentUpdateAction(action, context) {
        const message = {
            jsonrpc: '2.0',
            id: `doc_${Date.now()}`,
            method: 'update_page',
            params: {
                ...action.parameters,
                automation_context: context,
            },
        };
        return await this.mcpFramework.sendMessage('notion_server', message);
    }
    async executeCalculationAction(action, context) {
        this.logger.log(`Executing calculation action: ${action.target}`);
        return { calculated: true, result: action.parameters };
    }
    async executeExternalApiAction(action, context) {
        this.logger.log(`Executing external API action: ${action.target}`);
        return { api_called: true, target: action.target };
    }
    async executeMCPSyncAction(action, context) {
        return await this.mcpFramework.syncIntegration(action.parameters.integrationId);
    }
    async evaluateThresholdCondition(condition, context) {
        return true;
    }
    async evaluatePatternCondition(condition, context) {
        return true;
    }
    async evaluateTrendCondition(condition, context) {
        return true;
    }
    async evaluateAnomalyCondition(condition, context) {
        return false;
    }
    async evaluateScheduleCondition(condition, context) {
        return context.triggeredBy === 'schedule';
    }
    async generateRecommendations(rule, context, actionResults) {
        const recommendations = [];
        if (rule.type === 'goal_tracking') {
            recommendations.push({
                id: `rec_${Date.now()}_goal`,
                type: 'increase_savings',
                title: 'Optimize Savings Rate',
                description: 'Increase monthly savings by 15% to accelerate goal achievement',
                impact: {
                    timeReduction: 30,
                    amountIncrease: 50000,
                    riskReduction: 0.1,
                },
                effort: 'medium',
                priority: 8,
                automatable: true,
                suggestedActions: [
                    'Set up automatic savings transfer',
                    'Review monthly budget allocation',
                    'Identify expense reduction opportunities',
                ],
            });
        }
        return recommendations;
    }
    shouldExecuteRule(rule, now) {
        return true;
    }
    calculateNextExecution(rule) {
        const now = new Date();
        return new Date(now.getTime() + 3600000);
    }
    updateRuleMetadata(rule, result) {
        rule.metadata.lastExecuted = new Date();
        rule.metadata.executionCount++;
        rule.metadata.averageExecutionTime =
            (rule.metadata.averageExecutionTime * (rule.metadata.executionCount - 1) + result.executionTime) /
                rule.metadata.executionCount;
    }
    storeExecutionHistory(ruleId, result) {
        if (!this.executionHistory.has(ruleId)) {
            this.executionHistory.set(ruleId, []);
        }
        const history = this.executionHistory.get(ruleId);
        history.push(result);
        if (history.length > 100) {
            history.shift();
        }
    }
    getRules() {
        return Array.from(this.rules.values());
    }
    getRule(ruleId) {
        return this.rules.get(ruleId);
    }
    enableRule(ruleId) {
        const rule = this.rules.get(ruleId);
        if (rule) {
            rule.enabled = true;
            this.advancedLogger.logAutomation(`AI rule enabled: ${rule.name}`, {
                ruleId,
                operation: 'rule_enable',
            });
        }
    }
    disableRule(ruleId) {
        const rule = this.rules.get(ruleId);
        if (rule) {
            rule.enabled = false;
            this.advancedLogger.logAutomation(`AI rule disabled: ${rule.name}`, {
                ruleId,
                operation: 'rule_disable',
            });
        }
    }
    getExecutionHistory(ruleId) {
        return this.executionHistory.get(ruleId) || [];
    }
};
exports.AIRulesEngineService = AIRulesEngineService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AIRulesEngineService.prototype, "executeScheduledRules", null);
exports.AIRulesEngineService = AIRulesEngineService = AIRulesEngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        advanced_logger_service_1.AdvancedLoggerService,
        mcp_framework_service_1.MCPFrameworkService])
], AIRulesEngineService);
//# sourceMappingURL=ai-rules-engine.service.js.map