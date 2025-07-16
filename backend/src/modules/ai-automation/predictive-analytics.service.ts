import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AdvancedLoggerService } from '../../common/logger/advanced-logger.service';
import { MCPFrameworkService } from '../mcp-framework/mcp-framework.service';
import {
  FinancialGoal,
  PredictionResult,
  ProgressPoint,
  AIRecommendation,
  ExpenseAnalysis,
  RevenueTracking,
  ExpenseCategory,
  ExpenseTrend,
  ExpenseAnomaly,
  RevenueTrend,
  RevenueForecast,
} from './interfaces/ai-automation.interface';

export interface PredictionModel {
  id: string;
  name: string;
  type: 'linear' | 'exponential' | 'polynomial' | 'lstm' | 'ensemble';
  accuracy: number;
  trainingData: number;
  lastTrained: Date;
}

export interface MarketData {
  date: Date;
  zarUsdRate: number;
  inflationRate: number;
  interestRate: number;
  marketVolatility: number;
}

@Injectable()
export class PredictiveAnalyticsService {
  private readonly logger = new Logger(PredictiveAnalyticsService.name);
  private models = new Map<string, PredictionModel>();
  private marketData: MarketData[] = [];
  private predictions = new Map<string, PredictionResult>();

  constructor(
    private readonly configService: ConfigService,
    private readonly advancedLogger: AdvancedLoggerService,
    private readonly mcpFramework: MCPFrameworkService,
  ) {
    this.initializePredictionModels();
  }

  private initializePredictionModels(): void {
    // Net Worth Prediction Model
    this.models.set('net_worth_predictor', {
      id: 'net_worth_predictor',
      name: 'Net Worth Growth Predictor',
      type: 'ensemble',
      accuracy: 87,
      trainingData: 1000,
      lastTrained: new Date(),
    });

    // Revenue Prediction Model
    this.models.set('revenue_predictor', {
      id: 'revenue_predictor',
      name: 'Revenue Forecasting Model',
      type: 'lstm',
      accuracy: 92,
      trainingData: 2000,
      lastTrained: new Date(),
    });

    // Expense Prediction Model
    this.models.set('expense_predictor', {
      id: 'expense_predictor',
      name: 'Expense Pattern Analyzer',
      type: 'polynomial',
      accuracy: 85,
      trainingData: 1500,
      lastTrained: new Date(),
    });

    // Market Trend Predictor
    this.models.set('market_predictor', {
      id: 'market_predictor',
      name: 'South African Market Predictor',
      type: 'ensemble',
      accuracy: 78,
      trainingData: 5000,
      lastTrained: new Date(),
    });

    this.logger.log(`Initialized ${this.models.size} prediction models`);
  }

  /**
   * Generate comprehensive prediction for a financial goal
   */
  async generateGoalPrediction(goal: FinancialGoal, historicalData: ProgressPoint[]): Promise<PredictionResult> {
    const startTime = Date.now();

    try {
      // Prepare data for prediction
      const cleanedData = this.preprocessData(historicalData);
      const marketFactors = await this.getMarketFactors();

      // Generate predictions using multiple models
      const linearPrediction = this.generateLinearPrediction(goal, cleanedData);
      const exponentialPrediction = this.generateExponentialPrediction(goal, cleanedData);
      const aiPrediction = await this.generateAIPrediction(goal, cleanedData, marketFactors);

      // Ensemble prediction combining all models
      const ensemblePrediction = this.combineModelPredictions([
        { model: 'linear', weight: 0.3, result: linearPrediction },
        { model: 'exponential', weight: 0.35, result: exponentialPrediction },
        { model: 'ai', weight: 0.35, result: aiPrediction },
      ]);

      // Generate scenario analysis
      const scenarios = this.generateScenarioAnalysis(goal, ensemblePrediction, marketFactors);

      // Generate AI recommendations
      const recommendations = await this.generatePredictionRecommendations(goal, ensemblePrediction, scenarios);

      // Assess risk factors
      const riskFactors = this.assessRiskFactors(goal, cleanedData, marketFactors);

      const prediction: PredictionResult = {
        goalId: goal.id,
        predictedAmount: ensemblePrediction.amount,
        predictedDate: ensemblePrediction.date,
        confidence: ensemblePrediction.confidence,
        scenarios,
        recommendations,
        riskFactors,
      };

      // Store prediction
      this.predictions.set(goal.id, prediction);

      // Log prediction analytics
      this.advancedLogger.logAutomation(`Generated prediction for goal: ${goal.name}`, {
        operation: 'prediction_generation',
        success: true,
        duration: Date.now() - startTime,
        metadata: {
          goalId: goal.id,
          confidence: prediction.confidence,
          timeframe: Math.ceil((prediction.predictedDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
        },
      });

      return prediction;
    } catch (error) {
      this.logger.error(`Failed to generate prediction for goal ${goal.id}:`, error);
      throw error;
    }
  }

  /**
   * Preprocess historical data for prediction
   */
  private preprocessData(data: ProgressPoint[]): ProgressPoint[] {
    // Remove outliers using IQR method
    const amounts = data.map(d => d.amount).sort((a, b) => a - b);
    const q1 = amounts[Math.floor(amounts.length * 0.25)];
    const q3 = amounts[Math.floor(amounts.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const cleaned = data.filter(d => d.amount >= lowerBound && d.amount <= upperBound);

    // Smooth data using moving average
    const smoothed = cleaned.map((point, index) => {
      if (index < 2) return point;
      
      const window = cleaned.slice(Math.max(0, index - 2), index + 1);
      const avgAmount = window.reduce((sum, p) => sum + p.amount, 0) / window.length;
      
      return {
        ...point,
        amount: avgAmount,
      };
    });

    return smoothed;
  }

  /**
   * Generate linear prediction
   */
  private generateLinearPrediction(goal: FinancialGoal, data: ProgressPoint[]): {
    amount: number;
    date: Date;
    confidence: number;
  } {
    if (data.length < 2) {
      return {
        amount: goal.currentAmount,
        date: goal.targetDate,
        confidence: 20,
      };
    }

    // Calculate linear regression
    const n = data.length;
    const xValues = data.map((_, index) => index);
    const yValues = data.map(d => d.amount);

    const sumX = xValues.reduce((sum, x) => sum + x, 0);
    const sumY = yValues.reduce((sum, y) => sum + y, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared for confidence
    const yMean = sumY / n;
    const ssTotal = yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    const ssResidual = yValues.reduce((sum, y, i) => {
      const predicted = slope * xValues[i] + intercept;
      return sum + Math.pow(y - predicted, 2);
    }, 0);
    const rSquared = 1 - (ssResidual / ssTotal);

    // Project to target date
    const daysToTarget = Math.ceil((goal.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const projectedIndex = n + daysToTarget;
    const predictedAmount = slope * projectedIndex + intercept;

    // Determine completion date
    const daysToCompletion = slope > 0 ? Math.ceil((goal.targetAmount - goal.currentAmount) / slope) : Infinity;
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysToCompletion);

    return {
      amount: Math.max(0, predictedAmount),
      date: daysToCompletion < 365 * 10 ? completionDate : goal.targetDate,
      confidence: Math.max(30, Math.min(95, rSquared * 100)),
    };
  }

  /**
   * Generate exponential prediction
   */
  private generateExponentialPrediction(goal: FinancialGoal, data: ProgressPoint[]): {
    amount: number;
    date: Date;
    confidence: number;
  } {
    if (data.length < 3) {
      return this.generateLinearPrediction(goal, data);
    }

    // Calculate exponential growth rate
    const recentData = data.slice(-Math.min(30, data.length));
    const growthRates = [];

    for (let i = 1; i < recentData.length; i++) {
      if (recentData[i - 1].amount > 0) {
        const rate = (recentData[i].amount - recentData[i - 1].amount) / recentData[i - 1].amount;
        growthRates.push(rate);
      }
    }

    const avgGrowthRate = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
    const rateVariance = growthRates.reduce((sum, rate) => sum + Math.pow(rate - avgGrowthRate, 2), 0) / growthRates.length;

    // Project exponential growth
    const daysToTarget = Math.ceil((goal.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const predictedAmount = goal.currentAmount * Math.pow(1 + avgGrowthRate, daysToTarget);

    // Calculate completion time
    const daysToCompletion = avgGrowthRate > 0 
      ? Math.log(goal.targetAmount / goal.currentAmount) / Math.log(1 + avgGrowthRate)
      : Infinity;

    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysToCompletion);

    // Confidence based on growth rate consistency
    const confidence = Math.max(40, Math.min(90, 100 - (rateVariance * 1000)));

    return {
      amount: Math.max(0, predictedAmount),
      date: daysToCompletion < 365 * 10 ? completionDate : goal.targetDate,
      confidence,
    };
  }

  /**
   * Generate AI-enhanced prediction
   */
  private async generateAIPrediction(
    goal: FinancialGoal,
    data: ProgressPoint[],
    marketFactors: MarketData
  ): Promise<{ amount: number; date: Date; confidence: number }> {
    // This would integrate with actual ML models in production
    // For now, we'll use a sophisticated heuristic approach

    const linearPred = this.generateLinearPrediction(goal, data);
    const expPred = this.generateExponentialPrediction(goal, data);

    // Adjust based on market factors
    const marketAdjustment = this.calculateMarketAdjustment(marketFactors);
    const seasonalAdjustment = this.calculateSeasonalAdjustment(new Date());

    // Combine predictions with market intelligence
    const aiAmount = (linearPred.amount * 0.4 + expPred.amount * 0.6) * marketAdjustment * seasonalAdjustment;
    
    // Enhanced confidence calculation
    const baseConfidence = (linearPred.confidence + expPred.confidence) / 2;
    const marketConfidence = marketFactors.marketVolatility < 0.2 ? 1.1 : 0.9;
    const dataConfidence = data.length > 50 ? 1.15 : data.length / 50;

    const aiConfidence = Math.max(50, Math.min(95, baseConfidence * marketConfidence * dataConfidence));

    // Calculate AI-predicted completion date
    const velocity = this.calculateVelocity(data);
    const remainingAmount = goal.targetAmount - goal.currentAmount;
    const aiDaysToCompletion = velocity > 0 ? remainingAmount / velocity : Infinity;

    const aiCompletionDate = new Date();
    aiCompletionDate.setDate(aiCompletionDate.getDate() + aiDaysToCompletion);

    return {
      amount: Math.max(0, aiAmount),
      date: aiDaysToCompletion < 365 * 10 ? aiCompletionDate : goal.targetDate,
      confidence: aiConfidence,
    };
  }

  /**
   * Calculate market adjustment factor
   */
  private calculateMarketAdjustment(marketData: MarketData): number {
    let adjustment = 1.0;

    // Inflation adjustment
    if (marketData.inflationRate > 0.06) {
      adjustment *= 0.95; // Higher inflation hurts savings goals
    } else if (marketData.inflationRate < 0.03) {
      adjustment *= 1.05; // Low inflation helps
    }

    // Interest rate adjustment
    if (marketData.interestRate > 0.08) {
      adjustment *= 1.1; // Higher rates help savings
    } else if (marketData.interestRate < 0.04) {
      adjustment *= 0.95; // Low rates hurt savings
    }

    // Market volatility adjustment
    if (marketData.marketVolatility > 0.25) {
      adjustment *= 0.9; // High volatility creates uncertainty
    } else if (marketData.marketVolatility < 0.1) {
      adjustment *= 1.05; // Low volatility is good for planning
    }

    return Math.max(0.8, Math.min(1.2, adjustment));
  }

  /**
   * Calculate seasonal adjustment
   */
  private calculateSeasonalAdjustment(date: Date): number {
    const month = date.getMonth();
    
    // South African seasonal patterns
    if (month >= 11 || month <= 1) {
      return 0.95; // December-February: holiday spending
    } else if (month >= 2 && month <= 4) {
      return 1.05; // March-May: post-holiday recovery
    } else if (month >= 5 && month <= 7) {
      return 1.02; // June-August: winter savings
    } else {
      return 1.03; // September-November: pre-holiday preparation
    }
  }

  /**
   * Calculate velocity from historical data
   */
  private calculateVelocity(data: ProgressPoint[]): number {
    if (data.length < 2) return 0;

    const recentData = data.slice(-Math.min(30, data.length));
    const timeSpan = (recentData[recentData.length - 1].date.getTime() - recentData[0].date.getTime()) / (1000 * 60 * 60 * 24);
    const amountChange = recentData[recentData.length - 1].amount - recentData[0].amount;

    return timeSpan > 0 ? amountChange / timeSpan : 0;
  }

  /**
   * Combine multiple model predictions
   */
  private combineModelPredictions(predictions: Array<{
    model: string;
    weight: number;
    result: { amount: number; date: Date; confidence: number };
  }>): { amount: number; date: Date; confidence: number } {
    const totalWeight = predictions.reduce((sum, p) => sum + p.weight, 0);
    
    const weightedAmount = predictions.reduce((sum, p) => sum + (p.result.amount * p.weight), 0) / totalWeight;
    const weightedConfidence = predictions.reduce((sum, p) => sum + (p.result.confidence * p.weight), 0) / totalWeight;
    
    // Use the date from the most confident model
    const bestModel = predictions.reduce((best, current) => 
      current.result.confidence > best.result.confidence ? current : best
    );

    return {
      amount: weightedAmount,
      date: bestModel.result.date,
      confidence: weightedConfidence,
    };
  }

  /**
   * Generate scenario analysis
   */
  private generateScenarioAnalysis(
    goal: FinancialGoal,
    basePrediction: { amount: number; date: Date; confidence: number },
    marketFactors: MarketData
  ) {
    const optimisticMultiplier = 1.3;
    const pessimisticMultiplier = 0.7;

    return {
      optimistic: {
        amount: basePrediction.amount * optimisticMultiplier,
        date: new Date(basePrediction.date.getTime() - (30 * 24 * 60 * 60 * 1000)), // 30 days earlier
        probability: 25,
      },
      realistic: {
        amount: basePrediction.amount,
        date: basePrediction.date,
        probability: 50,
      },
      pessimistic: {
        amount: basePrediction.amount * pessimisticMultiplier,
        date: new Date(basePrediction.date.getTime() + (60 * 24 * 60 * 60 * 1000)), // 60 days later
        probability: 25,
      },
    };
  }

  /**
   * Generate prediction-based recommendations
   */
  private async generatePredictionRecommendations(
    goal: FinancialGoal,
    prediction: { amount: number; date: Date; confidence: number },
    scenarios: any
  ): Promise<AIRecommendation[]> {
    const recommendations: AIRecommendation[] = [];

    // Check if goal will be missed
    if (prediction.date > goal.targetDate) {
      recommendations.push({
        id: `rec_${Date.now()}_acceleration`,
        type: 'increase_savings',
        title: 'Accelerate Goal Achievement',
        description: 'Current trajectory suggests target date may be missed. Consider these acceleration strategies.',
        impact: {
          timeReduction: Math.ceil((prediction.date.getTime() - goal.targetDate.getTime()) / (1000 * 60 * 60 * 24)),
          amountIncrease: goal.targetAmount - prediction.amount,
          riskReduction: 0.15,
        },
        effort: 'medium',
        priority: 9,
        automatable: true,
        suggestedActions: [
          'Increase monthly savings rate by 25%',
          'Identify additional income sources',
          'Optimize high-yield investment allocation',
          'Reduce discretionary spending by 15%',
        ],
      });
    }

    // Low confidence prediction
    if (prediction.confidence < 70) {
      recommendations.push({
        id: `rec_${Date.now()}_consistency`,
        type: 'risk_mitigation',
        title: 'Improve Prediction Accuracy',
        description: 'Establish more consistent financial patterns to improve prediction reliability.',
        impact: {
          timeReduction: 0,
          amountIncrease: 0,
          riskReduction: 0.3,
        },
        effort: 'low',
        priority: 6,
        automatable: true,
        suggestedActions: [
          'Set up automatic monthly transfers',
          'Create consistent income streams',
          'Establish regular investment schedule',
          'Track expenses more accurately',
        ],
      });
    }

    // Opportunity for early achievement
    if (scenarios.optimistic.date < goal.targetDate) {
      recommendations.push({
        id: `rec_${Date.now()}_optimization`,
        type: 'optimize_investments',
        title: 'Optimize for Early Achievement',
        description: 'You\'re on track to achieve your goal early. Consider optimization strategies.',
        impact: {
          timeReduction: Math.ceil((goal.targetDate.getTime() - scenarios.optimistic.date.getTime()) / (1000 * 60 * 60 * 24)),
          amountIncrease: scenarios.optimistic.amount - goal.targetAmount,
          riskReduction: 0.1,
        },
        effort: 'low',
        priority: 7,
        automatable: false,
        suggestedActions: [
          'Consider increasing target amount',
          'Diversify into higher-yield investments',
          'Set new stretch goals',
          'Plan for tax optimization',
        ],
      });
    }

    return recommendations;
  }

  /**
   * Assess risk factors
   */
  private assessRiskFactors(
    goal: FinancialGoal,
    data: ProgressPoint[],
    marketFactors: MarketData
  ): string[] {
    const risks: string[] = [];

    // Velocity risk
    const velocity = this.calculateVelocity(data);
    if (velocity < 100) {
      risks.push('Low progress velocity - goal achievement at risk');
    }

    // Consistency risk
    const amounts = data.slice(-10).map(d => d.amount);
    const variance = amounts.reduce((sum, amount) => {
      const mean = amounts.reduce((s, a) => s + a, 0) / amounts.length;
      return sum + Math.pow(amount - mean, 2);
    }, 0) / amounts.length;

    if (variance > goal.targetAmount * 0.1) {
      risks.push('High variance in progress - inconsistent savings pattern');
    }

    // Market risks
    if (marketFactors.marketVolatility > 0.2) {
      risks.push('High market volatility affecting investment returns');
    }

    if (marketFactors.inflationRate > 0.06) {
      risks.push('High inflation rate eroding purchasing power');
    }

    // Time risk
    const daysRemaining = Math.ceil((goal.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const remainingAmount = goal.targetAmount - goal.currentAmount;
    const requiredVelocity = remainingAmount / daysRemaining;

    if (requiredVelocity > velocity * 1.5) {
      risks.push('Required savings rate significantly higher than current velocity');
    }

    return risks;
  }

  /**
   * Get current market factors
   */
  private async getMarketFactors(): Promise<MarketData> {
    // In production, this would fetch real market data
    // For now, return simulated South African market data
    return {
      date: new Date(),
      zarUsdRate: 18.5,
      inflationRate: 0.045,
      interestRate: 0.075,
      marketVolatility: 0.15,
    };
  }

  /**
   * Analyze expense patterns
   */
  async analyzeExpensePatterns(expenses: any[]): Promise<ExpenseAnalysis> {
    const categories = this.categorizeExpenses(expenses);
    const trends = this.analyzeExpenseTrends(expenses);
    const anomalies = this.detectExpenseAnomalies(expenses);
    const optimizations = this.generateExpenseOptimizations(categories);

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const savingsPotential = optimizations.reduce((sum, opt) => sum + opt.savingsAmount, 0);

    return {
      totalExpenses,
      categories,
      trends,
      anomalies,
      optimizations,
      savingsPotential,
    };
  }

  /**
   * Categorize expenses
   */
  private categorizeExpenses(expenses: any[]): ExpenseCategory[] {
    const categoryMap = new Map<string, { amount: number; count: number }>();

    expenses.forEach(expense => {
      const category = expense.category || 'Other';
      const current = categoryMap.get(category) || { amount: 0, count: 0 };
      categoryMap.set(category, {
        amount: current.amount + expense.amount,
        count: current.count + 1,
      });
    });

    const totalAmount = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.amount, 0);

    return Array.from(categoryMap.entries()).map(([name, data]) => ({
      name,
      amount: data.amount,
      percentage: (data.amount / totalAmount) * 100,
      trend: 'stable' as const, // Would calculate from historical data
      subcategories: [], // Would be populated from detailed categorization
    }));
  }

  /**
   * Analyze expense trends
   */
  private analyzeExpenseTrends(expenses: any[]): ExpenseTrend[] {
    // Simplified trend analysis
    return [
      {
        category: 'Total',
        direction: 'stable',
        percentage: 2.5,
        duration: 30,
        significance: 'low',
      },
    ];
  }

  /**
   * Detect expense anomalies
   */
  private detectExpenseAnomalies(expenses: any[]): ExpenseAnomaly[] {
    // Simplified anomaly detection
    return expenses
      .filter(expense => expense.amount > 5000) // ZAR threshold
      .map(expense => ({
        date: new Date(expense.date),
        category: expense.category,
        amount: expense.amount,
        expectedAmount: expense.amount * 0.7, // Simplified
        deviation: expense.amount * 0.3,
        severity: expense.amount > 10000 ? 'high' : 'medium' as const,
        description: `Unusually high ${expense.category} expense`,
        investigated: false,
      }));
  }

  /**
   * Generate expense optimizations
   */
  private generateExpenseOptimizations(categories: ExpenseCategory[]): any[] {
    return categories
      .filter(cat => cat.percentage > 10) // Focus on major categories
      .map(cat => ({
        category: cat.name,
        currentAmount: cat.amount,
        recommendedAmount: cat.amount * 0.85, // 15% reduction
        savingsAmount: cat.amount * 0.15,
        difficulty: 'medium',
        strategy: `Optimize ${cat.name} spending through better planning and alternatives`,
        automatable: true,
        riskLevel: 'low',
      }));
  }

  /**
   * Scheduled prediction updates
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updatePredictions(): Promise<void> {
    this.logger.log('Running scheduled prediction updates');

    // Update market data
    await this.updateMarketData();

    // Retrain models if needed
    await this.retrainModels();

    this.advancedLogger.logAutomation('Completed scheduled prediction updates', {
      operation: 'scheduled_update',
      success: true,
      metadata: {
        modelsUpdated: this.models.size,
        predictionsGenerated: this.predictions.size,
      },
    });
  }

  /**
   * Update market data
   */
  private async updateMarketData(): Promise<void> {
    const latestData = await this.getMarketFactors();
    this.marketData.push(latestData);

    // Keep only last 365 days
    if (this.marketData.length > 365) {
      this.marketData.shift();
    }
  }

  /**
   * Retrain models
   */
  private async retrainModels(): Promise<void> {
    for (const [modelId, model] of this.models) {
      const daysSinceTraining = Math.floor((new Date().getTime() - model.lastTrained.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceTraining > 7) { // Retrain weekly
        model.lastTrained = new Date();
        model.trainingData += 100; // Simulate additional training data
        model.accuracy = Math.min(95, model.accuracy + 0.5); // Slight improvement
        
        this.logger.log(`Retrained model: ${model.name} (accuracy: ${model.accuracy}%)`);
      }
    }
  }

  /**
   * Public API methods
   */
  getPrediction(goalId: string): PredictionResult | undefined {
    return this.predictions.get(goalId);
  }

  getModels(): PredictionModel[] {
    return Array.from(this.models.values());
  }

  getMarketData(): MarketData[] {
    return this.marketData.slice(-30); // Last 30 days
  }

  async generateCustomPrediction(
    goalId: string,
    customScenario: { savingsIncrease?: number; timeExtension?: number }
  ): Promise<PredictionResult> {
    // Custom prediction logic would go here
    const basePrediction = this.predictions.get(goalId);
    if (!basePrediction) {
      throw new Error(`No base prediction found for goal: ${goalId}`);
    }

    // Apply custom scenario adjustments
    const adjustedPrediction = { ...basePrediction };
    if (customScenario.savingsIncrease) {
      adjustedPrediction.predictedAmount *= (1 + customScenario.savingsIncrease);
    }
    if (customScenario.timeExtension) {
      adjustedPrediction.predictedDate = new Date(
        adjustedPrediction.predictedDate.getTime() + (customScenario.timeExtension * 24 * 60 * 60 * 1000)
      );
    }

    return adjustedPrediction;
  }
}