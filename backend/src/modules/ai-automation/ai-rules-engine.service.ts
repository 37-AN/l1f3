import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AdvancedLoggerService } from '../../common/logger/advanced-logger.service';
import { MCPFrameworkService } from '../mcp-framework/mcp-framework.service';
import {
  AIRule,
  AICondition,
  AIAction,
  AutomationContext,
  ExecutionResult,
  AIRecommendation,
} from './interfaces/ai-automation.interface';

@Injectable()
export class AIRulesEngineService {
  private readonly logger = new Logger(AIRulesEngineService.name);
  private rules = new Map<string, AIRule>();
  private executionHistory = new Map<string, ExecutionResult[]>();

  constructor(
    private readonly configService: ConfigService,
    private readonly advancedLogger: AdvancedLoggerService,
    private readonly mcpFramework: MCPFrameworkService,
  ) {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules(): void {
    // Net Worth Goal Tracking Rule
    this.registerRule({
      id: 'net_worth_tracking',
      name: 'Net Worth Goal Progress Tracking',
      description: 'Monitor progress toward R1,800,000 net worth target',
      type: 'goal_tracking',
      priority: 'high',
      enabled: true,
      schedule: '0 */6 * * *', // Every 6 hours
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

    // Daily Revenue Tracking Rule
    this.registerRule({
      id: 'daily_revenue_tracking',
      name: '43V3R Daily Revenue Tracking',
      description: 'Monitor daily revenue progress toward R4,881 target',
      type: 'revenue_tracking',
      priority: 'high',
      enabled: true,
      schedule: '0 */3 * * *', // Every 3 hours
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

    // Expense Optimization Rule
    this.registerRule({
      id: 'expense_optimization',
      name: 'Expense Analysis & Optimization',
      description: 'Analyze expenses and identify 25% reduction opportunities',
      type: 'expense_optimization',
      priority: 'medium',
      enabled: true,
      schedule: '0 0 */2 * *', // Every 2 days
      conditions: [
        {
          id: 'expense_pattern',
          type: 'pattern',
          field: 'expenses',
          operator: 'trend_up',
          value: 0.05, // 5% increase threshold
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

    // Automation Anomaly Detection Rule
    this.registerRule({
      id: 'anomaly_detection',
      name: 'Financial Anomaly Detection',
      description: 'Detect unusual financial patterns and alert',
      type: 'financial',
      priority: 'urgent',
      enabled: true,
      schedule: '0 */1 * * *', // Every hour
      conditions: [
        {
          id: 'financial_anomaly',
          type: 'anomaly',
          field: 'financial_metrics',
          operator: 'anomaly_detected',
          value: 0.95, // 95% confidence threshold
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

  /**
   * Register a new AI rule
   */
  registerRule(rule: AIRule): void {
    this.rules.set(rule.id, rule);
    this.advancedLogger.logAutomation(`AI rule registered: ${rule.name}`, {
      ruleId: rule.id,
      operation: 'rule_registration',
      metadata: { priority: rule.priority },
    });
  }

  /**
   * Execute all scheduled rules
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async executeScheduledRules(): Promise<void> {
    const now = new Date();
    
    for (const rule of this.rules.values()) {
      if (!rule.enabled || !rule.schedule) continue;
      
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

  /**
   * Execute a specific rule
   */
  async executeRule(ruleId: string, context: AutomationContext): Promise<ExecutionResult> {
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
      // Check conditions
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

      // Execute actions
      const actionResults = await this.executeActions(rule.actions, context);
      
      // Generate recommendations
      const recommendations = await this.generateRecommendations(rule, context, actionResults);

      const result: ExecutionResult = {
        success: actionResults.every(a => a.success),
        executionTime: Date.now() - startTime,
        actions: actionResults,
        recommendations,
        nextExecution: this.calculateNextExecution(rule),
      };

      // Update rule metadata
      this.updateRuleMetadata(rule, result);
      
      // Store execution history
      this.storeExecutionHistory(ruleId, result);

      this.advancedLogger.logAutomation(`AI rule execution completed: ${rule.name}`, {
        ruleId,
        success: result.success,
        duration: result.executionTime,
        operation: 'rule_execution_complete',
        metadata: { actionsExecuted: result.actions.length },
      });

      return result;
    } catch (error) {
      this.advancedLogger.error(`AI rule execution failed: ${rule.name}`, error, {
        operation: 'rule_execution_error',
        metadata: { ruleId, userId: context.userId },
      });
      
      throw error;
    }
  }

  /**
   * Evaluate rule conditions
   */
  private async evaluateConditions(conditions: AICondition[], context: AutomationContext): Promise<boolean> {
    for (const condition of conditions) {
      const met = await this.evaluateCondition(condition, context);
      if (!met) return false;
    }
    return true;
  }

  /**
   * Evaluate individual condition
   */
  private async evaluateCondition(condition: AICondition, context: AutomationContext): Promise<boolean> {
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
    } catch (error) {
      this.logger.error(`Error evaluating condition ${condition.id}:`, error);
      return false;
    }
  }

  /**
   * Execute rule actions
   */
  private async executeActions(actions: AIAction[], context: AutomationContext): Promise<any[]> {
    const results = [];
    
    // Execute actions in priority order
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
      } catch (error) {
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

  /**
   * Execute individual action
   */
  private async executeAction(action: AIAction, context: AutomationContext): Promise<any> {
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

  // Action execution methods
  private async executeNotificationAction(action: AIAction, context: AutomationContext): Promise<any> {
    // Implementation for notification actions
    this.logger.log(`Executing notification action: ${action.id}`);
    return { sent: true, channels: action.parameters.channels || ['dashboard'] };
  }

  private async executeTaskCreationAction(action: AIAction, context: AutomationContext): Promise<any> {
    // Implementation for task creation via MCP
    const message = {
      jsonrpc: '2.0' as const,
      id: `task_${Date.now()}`,
      method: 'create_task',
      params: {
        ...action.parameters,
        automation_context: context,
      },
    };

    return await this.mcpFramework.sendMessage('asana_server', message);
  }

  private async executeDocumentUpdateAction(action: AIAction, context: AutomationContext): Promise<any> {
    // Implementation for document updates via MCP
    const message = {
      jsonrpc: '2.0' as const,
      id: `doc_${Date.now()}`,
      method: 'update_page',
      params: {
        ...action.parameters,
        automation_context: context,
      },
    };

    return await this.mcpFramework.sendMessage('notion_server', message);
  }

  private async executeCalculationAction(action: AIAction, context: AutomationContext): Promise<any> {
    // Implementation for calculations
    this.logger.log(`Executing calculation action: ${action.target}`);
    return { calculated: true, result: action.parameters };
  }

  private async executeExternalApiAction(action: AIAction, context: AutomationContext): Promise<any> {
    // Implementation for external API calls
    this.logger.log(`Executing external API action: ${action.target}`);
    return { api_called: true, target: action.target };
  }

  private async executeMCPSyncAction(action: AIAction, context: AutomationContext): Promise<any> {
    // Implementation for MCP synchronization
    return await this.mcpFramework.syncIntegration(action.parameters.integrationId);
  }

  // Condition evaluation methods
  private async evaluateThresholdCondition(condition: AICondition, context: AutomationContext): Promise<boolean> {
    // Implementation for threshold conditions
    return true; // Placeholder
  }

  private async evaluatePatternCondition(condition: AICondition, context: AutomationContext): Promise<boolean> {
    // Implementation for pattern conditions
    return true; // Placeholder
  }

  private async evaluateTrendCondition(condition: AICondition, context: AutomationContext): Promise<boolean> {
    // Implementation for trend conditions
    return true; // Placeholder
  }

  private async evaluateAnomalyCondition(condition: AICondition, context: AutomationContext): Promise<boolean> {
    // Implementation for anomaly conditions
    return false; // Placeholder - anomalies are rare
  }

  private async evaluateScheduleCondition(condition: AICondition, context: AutomationContext): Promise<boolean> {
    // Implementation for schedule conditions
    return context.triggeredBy === 'schedule';
  }

  /**
   * Generate AI recommendations based on execution results
   */
  private async generateRecommendations(
    rule: AIRule,
    context: AutomationContext,
    actionResults: any[]
  ): Promise<AIRecommendation[]> {
    const recommendations: AIRecommendation[] = [];

    // Generate context-specific recommendations
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

  /**
   * Utility methods
   */
  private shouldExecuteRule(rule: AIRule, now: Date): boolean {
    // Simple cron-like scheduling check
    // In production, use a proper cron parser
    return true; // Placeholder
  }

  private calculateNextExecution(rule: AIRule): Date {
    // Calculate next execution based on schedule
    const now = new Date();
    return new Date(now.getTime() + 3600000); // 1 hour from now (placeholder)
  }

  private updateRuleMetadata(rule: AIRule, result: ExecutionResult): void {
    rule.metadata.lastExecuted = new Date();
    rule.metadata.executionCount++;
    rule.metadata.averageExecutionTime = 
      (rule.metadata.averageExecutionTime * (rule.metadata.executionCount - 1) + result.executionTime) / 
      rule.metadata.executionCount;
  }

  private storeExecutionHistory(ruleId: string, result: ExecutionResult): void {
    if (!this.executionHistory.has(ruleId)) {
      this.executionHistory.set(ruleId, []);
    }
    
    const history = this.executionHistory.get(ruleId);
    history.push(result);
    
    // Keep only last 100 executions
    if (history.length > 100) {
      history.shift();
    }
  }

  /**
   * Public API methods
   */
  getRules(): AIRule[] {
    return Array.from(this.rules.values());
  }

  getRule(ruleId: string): AIRule | undefined {
    return this.rules.get(ruleId);
  }

  enableRule(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = true;
      this.advancedLogger.logAutomation(`AI rule enabled: ${rule.name}`, {
        ruleId,
        operation: 'rule_enable',
      });
    }
  }

  disableRule(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = false;
      this.advancedLogger.logAutomation(`AI rule disabled: ${rule.name}`, {
        ruleId,
        operation: 'rule_disable',
      });
    }
  }

  getExecutionHistory(ruleId: string): ExecutionResult[] {
    return this.executionHistory.get(ruleId) || [];
  }
}