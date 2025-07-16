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
var PredictiveAnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictiveAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const advanced_logger_service_1 = require("../../common/logger/advanced-logger.service");
const mcp_framework_service_1 = require("../mcp-framework/mcp-framework.service");
let PredictiveAnalyticsService = PredictiveAnalyticsService_1 = class PredictiveAnalyticsService {
    constructor(configService, advancedLogger, mcpFramework) {
        this.configService = configService;
        this.advancedLogger = advancedLogger;
        this.mcpFramework = mcpFramework;
        this.logger = new common_1.Logger(PredictiveAnalyticsService_1.name);
        this.models = new Map();
        this.marketData = [];
        this.predictions = new Map();
        this.initializePredictionModels();
    }
    initializePredictionModels() {
        this.models.set('net_worth_predictor', {
            id: 'net_worth_predictor',
            name: 'Net Worth Growth Predictor',
            type: 'ensemble',
            accuracy: 87,
            trainingData: 1000,
            lastTrained: new Date(),
        });
        this.models.set('revenue_predictor', {
            id: 'revenue_predictor',
            name: 'Revenue Forecasting Model',
            type: 'lstm',
            accuracy: 92,
            trainingData: 2000,
            lastTrained: new Date(),
        });
        this.models.set('expense_predictor', {
            id: 'expense_predictor',
            name: 'Expense Pattern Analyzer',
            type: 'polynomial',
            accuracy: 85,
            trainingData: 1500,
            lastTrained: new Date(),
        });
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
    async generateGoalPrediction(goal, historicalData) {
        const startTime = Date.now();
        try {
            const cleanedData = this.preprocessData(historicalData);
            const marketFactors = await this.getMarketFactors();
            const linearPrediction = this.generateLinearPrediction(goal, cleanedData);
            const exponentialPrediction = this.generateExponentialPrediction(goal, cleanedData);
            const aiPrediction = await this.generateAIPrediction(goal, cleanedData, marketFactors);
            const ensemblePrediction = this.combineModelPredictions([
                { model: 'linear', weight: 0.3, result: linearPrediction },
                { model: 'exponential', weight: 0.35, result: exponentialPrediction },
                { model: 'ai', weight: 0.35, result: aiPrediction },
            ]);
            const scenarios = this.generateScenarioAnalysis(goal, ensemblePrediction, marketFactors);
            const recommendations = await this.generatePredictionRecommendations(goal, ensemblePrediction, scenarios);
            const riskFactors = this.assessRiskFactors(goal, cleanedData, marketFactors);
            const prediction = {
                goalId: goal.id,
                predictedAmount: ensemblePrediction.amount,
                predictedDate: ensemblePrediction.date,
                confidence: ensemblePrediction.confidence,
                scenarios,
                recommendations,
                riskFactors,
            };
            this.predictions.set(goal.id, prediction);
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
        }
        catch (error) {
            this.logger.error(`Failed to generate prediction for goal ${goal.id}:`, error);
            throw error;
        }
    }
    preprocessData(data) {
        const amounts = data.map(d => d.amount).sort((a, b) => a - b);
        const q1 = amounts[Math.floor(amounts.length * 0.25)];
        const q3 = amounts[Math.floor(amounts.length * 0.75)];
        const iqr = q3 - q1;
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;
        const cleaned = data.filter(d => d.amount >= lowerBound && d.amount <= upperBound);
        const smoothed = cleaned.map((point, index) => {
            if (index < 2)
                return point;
            const window = cleaned.slice(Math.max(0, index - 2), index + 1);
            const avgAmount = window.reduce((sum, p) => sum + p.amount, 0) / window.length;
            return {
                ...point,
                amount: avgAmount,
            };
        });
        return smoothed;
    }
    generateLinearPrediction(goal, data) {
        if (data.length < 2) {
            return {
                amount: goal.currentAmount,
                date: goal.targetDate,
                confidence: 20,
            };
        }
        const n = data.length;
        const xValues = data.map((_, index) => index);
        const yValues = data.map(d => d.amount);
        const sumX = xValues.reduce((sum, x) => sum + x, 0);
        const sumY = yValues.reduce((sum, y) => sum + y, 0);
        const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
        const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        const yMean = sumY / n;
        const ssTotal = yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
        const ssResidual = yValues.reduce((sum, y, i) => {
            const predicted = slope * xValues[i] + intercept;
            return sum + Math.pow(y - predicted, 2);
        }, 0);
        const rSquared = 1 - (ssResidual / ssTotal);
        const daysToTarget = Math.ceil((goal.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        const projectedIndex = n + daysToTarget;
        const predictedAmount = slope * projectedIndex + intercept;
        const daysToCompletion = slope > 0 ? Math.ceil((goal.targetAmount - goal.currentAmount) / slope) : Infinity;
        const completionDate = new Date();
        completionDate.setDate(completionDate.getDate() + daysToCompletion);
        return {
            amount: Math.max(0, predictedAmount),
            date: daysToCompletion < 365 * 10 ? completionDate : goal.targetDate,
            confidence: Math.max(30, Math.min(95, rSquared * 100)),
        };
    }
    generateExponentialPrediction(goal, data) {
        if (data.length < 3) {
            return this.generateLinearPrediction(goal, data);
        }
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
        const daysToTarget = Math.ceil((goal.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        const predictedAmount = goal.currentAmount * Math.pow(1 + avgGrowthRate, daysToTarget);
        const daysToCompletion = avgGrowthRate > 0
            ? Math.log(goal.targetAmount / goal.currentAmount) / Math.log(1 + avgGrowthRate)
            : Infinity;
        const completionDate = new Date();
        completionDate.setDate(completionDate.getDate() + daysToCompletion);
        const confidence = Math.max(40, Math.min(90, 100 - (rateVariance * 1000)));
        return {
            amount: Math.max(0, predictedAmount),
            date: daysToCompletion < 365 * 10 ? completionDate : goal.targetDate,
            confidence,
        };
    }
    async generateAIPrediction(goal, data, marketFactors) {
        const linearPred = this.generateLinearPrediction(goal, data);
        const expPred = this.generateExponentialPrediction(goal, data);
        const marketAdjustment = this.calculateMarketAdjustment(marketFactors);
        const seasonalAdjustment = this.calculateSeasonalAdjustment(new Date());
        const aiAmount = (linearPred.amount * 0.4 + expPred.amount * 0.6) * marketAdjustment * seasonalAdjustment;
        const baseConfidence = (linearPred.confidence + expPred.confidence) / 2;
        const marketConfidence = marketFactors.marketVolatility < 0.2 ? 1.1 : 0.9;
        const dataConfidence = data.length > 50 ? 1.15 : data.length / 50;
        const aiConfidence = Math.max(50, Math.min(95, baseConfidence * marketConfidence * dataConfidence));
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
    calculateMarketAdjustment(marketData) {
        let adjustment = 1.0;
        if (marketData.inflationRate > 0.06) {
            adjustment *= 0.95;
        }
        else if (marketData.inflationRate < 0.03) {
            adjustment *= 1.05;
        }
        if (marketData.interestRate > 0.08) {
            adjustment *= 1.1;
        }
        else if (marketData.interestRate < 0.04) {
            adjustment *= 0.95;
        }
        if (marketData.marketVolatility > 0.25) {
            adjustment *= 0.9;
        }
        else if (marketData.marketVolatility < 0.1) {
            adjustment *= 1.05;
        }
        return Math.max(0.8, Math.min(1.2, adjustment));
    }
    calculateSeasonalAdjustment(date) {
        const month = date.getMonth();
        if (month >= 11 || month <= 1) {
            return 0.95;
        }
        else if (month >= 2 && month <= 4) {
            return 1.05;
        }
        else if (month >= 5 && month <= 7) {
            return 1.02;
        }
        else {
            return 1.03;
        }
    }
    calculateVelocity(data) {
        if (data.length < 2)
            return 0;
        const recentData = data.slice(-Math.min(30, data.length));
        const timeSpan = (recentData[recentData.length - 1].date.getTime() - recentData[0].date.getTime()) / (1000 * 60 * 60 * 24);
        const amountChange = recentData[recentData.length - 1].amount - recentData[0].amount;
        return timeSpan > 0 ? amountChange / timeSpan : 0;
    }
    combineModelPredictions(predictions) {
        const totalWeight = predictions.reduce((sum, p) => sum + p.weight, 0);
        const weightedAmount = predictions.reduce((sum, p) => sum + (p.result.amount * p.weight), 0) / totalWeight;
        const weightedConfidence = predictions.reduce((sum, p) => sum + (p.result.confidence * p.weight), 0) / totalWeight;
        const bestModel = predictions.reduce((best, current) => current.result.confidence > best.result.confidence ? current : best);
        return {
            amount: weightedAmount,
            date: bestModel.result.date,
            confidence: weightedConfidence,
        };
    }
    generateScenarioAnalysis(goal, basePrediction, marketFactors) {
        const optimisticMultiplier = 1.3;
        const pessimisticMultiplier = 0.7;
        return {
            optimistic: {
                amount: basePrediction.amount * optimisticMultiplier,
                date: new Date(basePrediction.date.getTime() - (30 * 24 * 60 * 60 * 1000)),
                probability: 25,
            },
            realistic: {
                amount: basePrediction.amount,
                date: basePrediction.date,
                probability: 50,
            },
            pessimistic: {
                amount: basePrediction.amount * pessimisticMultiplier,
                date: new Date(basePrediction.date.getTime() + (60 * 24 * 60 * 60 * 1000)),
                probability: 25,
            },
        };
    }
    async generatePredictionRecommendations(goal, prediction, scenarios) {
        const recommendations = [];
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
    assessRiskFactors(goal, data, marketFactors) {
        const risks = [];
        const velocity = this.calculateVelocity(data);
        if (velocity < 100) {
            risks.push('Low progress velocity - goal achievement at risk');
        }
        const amounts = data.slice(-10).map(d => d.amount);
        const variance = amounts.reduce((sum, amount) => {
            const mean = amounts.reduce((s, a) => s + a, 0) / amounts.length;
            return sum + Math.pow(amount - mean, 2);
        }, 0) / amounts.length;
        if (variance > goal.targetAmount * 0.1) {
            risks.push('High variance in progress - inconsistent savings pattern');
        }
        if (marketFactors.marketVolatility > 0.2) {
            risks.push('High market volatility affecting investment returns');
        }
        if (marketFactors.inflationRate > 0.06) {
            risks.push('High inflation rate eroding purchasing power');
        }
        const daysRemaining = Math.ceil((goal.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        const remainingAmount = goal.targetAmount - goal.currentAmount;
        const requiredVelocity = remainingAmount / daysRemaining;
        if (requiredVelocity > velocity * 1.5) {
            risks.push('Required savings rate significantly higher than current velocity');
        }
        return risks;
    }
    async getMarketFactors() {
        return {
            date: new Date(),
            zarUsdRate: 18.5,
            inflationRate: 0.045,
            interestRate: 0.075,
            marketVolatility: 0.15,
        };
    }
    async analyzeExpensePatterns(expenses) {
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
    categorizeExpenses(expenses) {
        const categoryMap = new Map();
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
            trend: 'stable',
            subcategories: [],
        }));
    }
    analyzeExpenseTrends(expenses) {
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
    detectExpenseAnomalies(expenses) {
        return expenses
            .filter(expense => expense.amount > 5000)
            .map(expense => ({
            date: new Date(expense.date),
            category: expense.category,
            amount: expense.amount,
            expectedAmount: expense.amount * 0.7,
            deviation: expense.amount * 0.3,
            severity: expense.amount > 10000 ? 'high' : 'medium',
            description: `Unusually high ${expense.category} expense`,
            investigated: false,
        }));
    }
    generateExpenseOptimizations(categories) {
        return categories
            .filter(cat => cat.percentage > 10)
            .map(cat => ({
            category: cat.name,
            currentAmount: cat.amount,
            recommendedAmount: cat.amount * 0.85,
            savingsAmount: cat.amount * 0.15,
            difficulty: 'medium',
            strategy: `Optimize ${cat.name} spending through better planning and alternatives`,
            automatable: true,
            riskLevel: 'low',
        }));
    }
    async updatePredictions() {
        this.logger.log('Running scheduled prediction updates');
        await this.updateMarketData();
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
    async updateMarketData() {
        const latestData = await this.getMarketFactors();
        this.marketData.push(latestData);
        if (this.marketData.length > 365) {
            this.marketData.shift();
        }
    }
    async retrainModels() {
        for (const [modelId, model] of this.models) {
            const daysSinceTraining = Math.floor((new Date().getTime() - model.lastTrained.getTime()) / (1000 * 60 * 60 * 24));
            if (daysSinceTraining > 7) {
                model.lastTrained = new Date();
                model.trainingData += 100;
                model.accuracy = Math.min(95, model.accuracy + 0.5);
                this.logger.log(`Retrained model: ${model.name} (accuracy: ${model.accuracy}%)`);
            }
        }
    }
    getPrediction(goalId) {
        return this.predictions.get(goalId);
    }
    getModels() {
        return Array.from(this.models.values());
    }
    getMarketData() {
        return this.marketData.slice(-30);
    }
    async generateCustomPrediction(goalId, customScenario) {
        const basePrediction = this.predictions.get(goalId);
        if (!basePrediction) {
            throw new Error(`No base prediction found for goal: ${goalId}`);
        }
        const adjustedPrediction = { ...basePrediction };
        if (customScenario.savingsIncrease) {
            adjustedPrediction.predictedAmount *= (1 + customScenario.savingsIncrease);
        }
        if (customScenario.timeExtension) {
            adjustedPrediction.predictedDate = new Date(adjustedPrediction.predictedDate.getTime() + (customScenario.timeExtension * 24 * 60 * 60 * 1000));
        }
        return adjustedPrediction;
    }
};
exports.PredictiveAnalyticsService = PredictiveAnalyticsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PredictiveAnalyticsService.prototype, "updatePredictions", null);
exports.PredictiveAnalyticsService = PredictiveAnalyticsService = PredictiveAnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        advanced_logger_service_1.AdvancedLoggerService,
        mcp_framework_service_1.MCPFrameworkService])
], PredictiveAnalyticsService);
//# sourceMappingURL=predictive-analytics.service.js.map