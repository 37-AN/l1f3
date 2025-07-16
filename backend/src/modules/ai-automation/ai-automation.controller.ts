import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AIAutomationService } from './ai-automation.service';
import { AIRulesEngineService } from './ai-rules-engine.service';
import { FinancialGoalTrackerService } from './financial-goal-tracker.service';
import { PredictiveAnalyticsService } from './predictive-analytics.service';
import { AdvancedLoggerService } from '../../common/logger/advanced-logger.service';
import {
  FinancialGoal,
  AIRule,
  AutomationContext,
  ExecutionResult,
  PredictionResult,
} from './interfaces/ai-automation.interface';

export class CreateGoalDto {
  name: string;
  type: 'net_worth' | 'revenue' | 'mrr' | 'savings' | 'investment' | 'expense_reduction';
  targetAmount: number;
  currency: string;
  targetDate: string;
  strategy: 'linear' | 'exponential' | 'milestone_based' | 'ai_optimized';
}

export class UpdateGoalProgressDto {
  amount: number;
  source?: 'manual' | 'automated' | 'calculated';
  factors?: string[];
}

export class CreateRuleDto {
  name: string;
  description: string;
  type: 'financial' | 'business' | 'goal_tracking' | 'expense_optimization' | 'revenue_tracking';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  schedule?: string;
  conditions: any[];
  actions: any[];
}

export class ExecuteWorkflowDto {
  workflowType: 'financial_sync' | 'goal_tracking' | 'expense_analysis' | 'revenue_optimization';
  context?: any;
}

@ApiTags('AI Automation')
@Controller('api/ai-automation')
@ApiBearerAuth()
export class AIAutomationController {
  private readonly logger = new Logger(AIAutomationController.name);

  constructor(
    private readonly aiAutomation: AIAutomationService,
    private readonly rulesEngine: AIRulesEngineService,
    private readonly goalTracker: FinancialGoalTrackerService,
    private readonly predictiveAnalytics: PredictiveAnalyticsService,
    private readonly advancedLogger: AdvancedLoggerService,
  ) {}

  // ===== DASHBOARD ENDPOINTS =====

  @Get('dashboard')
  @ApiOperation({ summary: 'Get automation dashboard overview' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
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
    } catch (error) {
      this.logger.error('Failed to get dashboard:', error);
      throw new HttpException('Failed to retrieve dashboard', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('status')
  @ApiOperation({ summary: 'Get system status and health' })
  @ApiResponse({ status: 200, description: 'System status retrieved successfully' })
  async getSystemStatus() {
    try {
      const status = await this.aiAutomation.getSystemStatus();
      
      return {
        success: true,
        data: status,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get system status:', error);
      throw new HttpException('Failed to retrieve system status', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get automation metrics' })
  @ApiResponse({ status: 200, description: 'Metrics retrieved successfully' })
  async getMetrics() {
    try {
      const metrics = this.aiAutomation.getAutomationMetrics();
      
      return {
        success: true,
        data: metrics,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get metrics:', error);
      throw new HttpException('Failed to retrieve metrics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ===== WORKFLOW EXECUTION ENDPOINTS =====

  @Post('execute')
  @ApiOperation({ summary: 'Execute automation workflow' })
  @ApiResponse({ status: 200, description: 'Workflow executed successfully' })
  async executeWorkflow(@Body() dto: ExecuteWorkflowDto) {
    try {
      const context: AutomationContext = {
        userId: 'api_user', // In production, get from JWT token
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
    } catch (error) {
      this.logger.error('Failed to execute workflow:', error);
      throw new HttpException('Failed to execute workflow', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('trigger/:workflowType')
  @ApiOperation({ summary: 'Trigger specific automation workflow' })
  @ApiResponse({ status: 200, description: 'Workflow triggered successfully' })
  async triggerWorkflow(@Param('workflowType') workflowType: string) {
    try {
      const result = await this.aiAutomation.triggerManualAutomation(workflowType, 'api_user');
      
      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to trigger workflow ${workflowType}:`, error);
      throw new HttpException('Failed to trigger workflow', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ===== GOALS MANAGEMENT ENDPOINTS =====

  @Get('goals')
  @ApiOperation({ summary: 'Get all financial goals' })
  @ApiResponse({ status: 200, description: 'Goals retrieved successfully' })
  async getGoals() {
    try {
      const goals = this.goalTracker.getGoals();
      
      return {
        success: true,
        data: goals,
        count: goals.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get goals:', error);
      throw new HttpException('Failed to retrieve goals', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('goals/:goalId')
  @ApiOperation({ summary: 'Get specific financial goal' })
  @ApiResponse({ status: 200, description: 'Goal retrieved successfully' })
  async getGoal(@Param('goalId') goalId: string) {
    try {
      const goal = this.goalTracker.getGoal(goalId);
      
      if (!goal) {
        throw new HttpException('Goal not found', HttpStatus.NOT_FOUND);
      }

      const analytics = this.goalTracker.getGoalAnalytics(goalId);
      const progressHistory = this.goalTracker.getGoalProgress(goalId);
      const prediction = this.predictiveAnalytics.getPrediction(goalId);

      return {
        success: true,
        data: {
          goal,
          analytics,
          progressHistory: progressHistory.slice(-30), // Last 30 data points
          prediction,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to get goal ${goalId}:`, error);
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to retrieve goal', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('goals')
  @ApiOperation({ summary: 'Create new financial goal' })
  @ApiResponse({ status: 201, description: 'Goal created successfully' })
  async createGoal(@Body() dto: CreateGoalDto) {
    try {
      const goal: FinancialGoal = {
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
    } catch (error) {
      this.logger.error('Failed to create goal:', error);
      throw new HttpException('Failed to create goal', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('goals/:goalId/progress')
  @ApiOperation({ summary: 'Update goal progress' })
  @ApiResponse({ status: 200, description: 'Goal progress updated successfully' })
  async updateGoalProgress(
    @Param('goalId') goalId: string,
    @Body() dto: UpdateGoalProgressDto
  ) {
    try {
      await this.goalTracker.updateGoalProgress(
        goalId,
        dto.amount,
        dto.source || 'manual',
        dto.factors || ['manual_api_update']
      );

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
    } catch (error) {
      this.logger.error(`Failed to update goal progress ${goalId}:`, error);
      throw new HttpException('Failed to update goal progress', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('goals/:goalId/analytics')
  @ApiOperation({ summary: 'Get goal analytics' })
  @ApiResponse({ status: 200, description: 'Goal analytics retrieved successfully' })
  async getGoalAnalytics(@Param('goalId') goalId: string) {
    try {
      const analytics = this.goalTracker.getGoalAnalytics(goalId);
      
      return {
        success: true,
        data: analytics,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to get goal analytics ${goalId}:`, error);
      throw new HttpException('Failed to retrieve goal analytics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('goals/:goalId/prediction')
  @ApiOperation({ summary: 'Get goal prediction' })
  @ApiResponse({ status: 200, description: 'Goal prediction retrieved successfully' })
  async getGoalPrediction(@Param('goalId') goalId: string) {
    try {
      const prediction = this.predictiveAnalytics.getPrediction(goalId);
      
      if (!prediction) {
        // Generate new prediction if none exists
        const goal = this.goalTracker.getGoal(goalId);
        if (!goal) {
          throw new HttpException('Goal not found', HttpStatus.NOT_FOUND);
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
    } catch (error) {
      this.logger.error(`Failed to get goal prediction ${goalId}:`, error);
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to retrieve goal prediction', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ===== RULES MANAGEMENT ENDPOINTS =====

  @Get('rules')
  @ApiOperation({ summary: 'Get all automation rules' })
  @ApiResponse({ status: 200, description: 'Rules retrieved successfully' })
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
    } catch (error) {
      this.logger.error('Failed to get rules:', error);
      throw new HttpException('Failed to retrieve rules', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('rules/:ruleId')
  @ApiOperation({ summary: 'Get specific automation rule' })
  @ApiResponse({ status: 200, description: 'Rule retrieved successfully' })
  async getRule(@Param('ruleId') ruleId: string) {
    try {
      const rule = this.rulesEngine.getRule(ruleId);
      
      if (!rule) {
        throw new HttpException('Rule not found', HttpStatus.NOT_FOUND);
      }

      const executionHistory = this.rulesEngine.getExecutionHistory(ruleId);

      return {
        success: true,
        data: {
          rule,
          executionHistory: executionHistory.slice(-10), // Last 10 executions
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to get rule ${ruleId}:`, error);
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to retrieve rule', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('rules')
  @ApiOperation({ summary: 'Create new automation rule' })
  @ApiResponse({ status: 201, description: 'Rule created successfully' })
  async createRule(@Body() dto: CreateRuleDto) {
    try {
      const rule: AIRule = {
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
    } catch (error) {
      this.logger.error('Failed to create rule:', error);
      throw new HttpException('Failed to create rule', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('rules/:ruleId/enable')
  @ApiOperation({ summary: 'Enable automation rule' })
  @ApiResponse({ status: 200, description: 'Rule enabled successfully' })
  async enableRule(@Param('ruleId') ruleId: string) {
    try {
      this.rulesEngine.enableRule(ruleId);
      
      return {
        success: true,
        message: 'Rule enabled successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to enable rule ${ruleId}:`, error);
      throw new HttpException('Failed to enable rule', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('rules/:ruleId/disable')
  @ApiOperation({ summary: 'Disable automation rule' })
  @ApiResponse({ status: 200, description: 'Rule disabled successfully' })
  async disableRule(@Param('ruleId') ruleId: string) {
    try {
      this.rulesEngine.disableRule(ruleId);
      
      return {
        success: true,
        message: 'Rule disabled successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to disable rule ${ruleId}:`, error);
      throw new HttpException('Failed to disable rule', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('rules/:ruleId/execute')
  @ApiOperation({ summary: 'Execute automation rule manually' })
  @ApiResponse({ status: 200, description: 'Rule executed successfully' })
  async executeRule(@Param('ruleId') ruleId: string) {
    try {
      const context: AutomationContext = {
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
    } catch (error) {
      this.logger.error(`Failed to execute rule ${ruleId}:`, error);
      throw new HttpException('Failed to execute rule', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ===== PREDICTIONS AND ANALYTICS ENDPOINTS =====

  @Get('predictions')
  @ApiOperation({ summary: 'Get all predictions' })
  @ApiResponse({ status: 200, description: 'Predictions retrieved successfully' })
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
    } catch (error) {
      this.logger.error('Failed to get predictions:', error);
      throw new HttpException('Failed to retrieve predictions', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('analytics/models')
  @ApiOperation({ summary: 'Get prediction models information' })
  @ApiResponse({ status: 200, description: 'Models information retrieved successfully' })
  async getModels() {
    try {
      const models = this.predictiveAnalytics.getModels();
      
      return {
        success: true,
        data: models,
        count: models.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get models:', error);
      throw new HttpException('Failed to retrieve models', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('analytics/market-data')
  @ApiOperation({ summary: 'Get market data' })
  @ApiResponse({ status: 200, description: 'Market data retrieved successfully' })
  async getMarketData() {
    try {
      const marketData = this.predictiveAnalytics.getMarketData();
      
      return {
        success: true,
        data: marketData,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get market data:', error);
      throw new HttpException('Failed to retrieve market data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('analytics/custom-prediction/:goalId')
  @ApiOperation({ summary: 'Generate custom prediction scenario' })
  @ApiResponse({ status: 200, description: 'Custom prediction generated successfully' })
  async generateCustomPrediction(
    @Param('goalId') goalId: string,
    @Body() scenario: { savingsIncrease?: number; timeExtension?: number }
  ) {
    try {
      const prediction = await this.predictiveAnalytics.generateCustomPrediction(goalId, scenario);
      
      return {
        success: true,
        data: prediction,
        scenario,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to generate custom prediction for ${goalId}:`, error);
      throw new HttpException('Failed to generate custom prediction', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}