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
var BankingInsightsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankingInsightsService = void 0;
const common_1 = require("@nestjs/common");
const advanced_logger_service_1 = require("../../../common/logger/advanced-logger.service");
const banking_interface_1 = require("../interfaces/banking.interface");
let BankingInsightsService = BankingInsightsService_1 = class BankingInsightsService {
    constructor(advancedLogger) {
        this.advancedLogger = advancedLogger;
        this.logger = new common_1.Logger(BankingInsightsService_1.name);
    }
    async generateInsights(userId, accounts, transactions) {
        const insights = [];
        insights.push(...this.generateSpendingPatternInsights(userId, transactions));
        insights.push(...this.generateSavingsOpportunityInsights(userId, accounts, transactions));
        insights.push(...this.generateIncomeInsights(userId, transactions));
        insights.push(...this.generateGoalProgressInsights(userId, transactions));
        return insights
            .sort((a, b) => {
            if (a.priority !== b.priority) {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
            return b.confidence - a.confidence;
        })
            .slice(0, 10);
    }
    generateSpendingPatternInsights(userId, transactions) {
        const insights = [];
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const thisMonthSpending = this.calculateCategorySpending(transactions.filter(t => t.date >= thisMonth && t.type === 'debit'));
        const lastMonthSpending = this.calculateCategorySpending(transactions.filter(t => t.date >= lastMonth && t.date < thisMonth && t.type === 'debit'));
        for (const [category, thisMonthAmount] of Object.entries(thisMonthSpending)) {
            const lastMonthAmount = lastMonthSpending[category] || 0;
            const change = thisMonthAmount - lastMonthAmount;
            const percentChange = lastMonthAmount > 0 ? (change / lastMonthAmount) * 100 : 0;
            if (Math.abs(percentChange) > 25 && Math.abs(change) > 500) {
                insights.push({
                    id: `spending_${category}_${Date.now()}`,
                    userId,
                    type: 'spending_pattern',
                    title: `${category.replace('_', ' ')} spending ${percentChange > 0 ? 'increased' : 'decreased'}`,
                    description: `Your ${category.replace('_', ' ')} spending has ${percentChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(percentChange).toFixed(1)}% this month (R${Math.abs(change).toFixed(2)}).`,
                    category: category,
                    impact: {
                        amount: Math.abs(change),
                        percentage: Math.abs(percentChange),
                        timeframe: 'monthly',
                    },
                    confidence: Math.min(95, 60 + Math.abs(percentChange) / 2),
                    priority: Math.abs(change) > 2000 ? 'high' : Math.abs(change) > 1000 ? 'medium' : 'low',
                    actionable: true,
                    suggestedActions: percentChange > 0 ? [
                        'Review recent transactions in this category',
                        'Set up budget alerts for this category',
                        'Look for alternative cheaper options',
                    ] : [
                        'Great job reducing spending in this area!',
                        'Consider reallocating saved money to savings',
                    ],
                    dataPoints: [
                        { period: 'Last Month', value: lastMonthAmount },
                        { period: 'This Month', value: thisMonthAmount },
                    ],
                    createdAt: new Date(),
                    isRead: false,
                    isActioned: false,
                });
            }
        }
        return insights;
    }
    generateSavingsOpportunityInsights(userId, accounts, transactions) {
        const insights = [];
        const subscriptions = this.identifySubscriptions(transactions);
        if (subscriptions.length > 0) {
            const totalSubscriptionCost = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
            insights.push({
                id: `subscriptions_${Date.now()}`,
                userId,
                type: 'savings_opportunity',
                title: 'Review your subscriptions',
                description: `You have ${subscriptions.length} active subscriptions costing R${totalSubscriptionCost.toFixed(2)} monthly. Review if you're using all of them.`,
                category: banking_interface_1.TransactionCategory.SUBSCRIPTIONS,
                impact: {
                    amount: totalSubscriptionCost * 0.3,
                    percentage: 30,
                    timeframe: 'monthly',
                },
                confidence: 85,
                priority: totalSubscriptionCost > 500 ? 'medium' : 'low',
                actionable: true,
                suggestedActions: [
                    'Cancel unused subscriptions',
                    'Downgrade premium plans if not needed',
                    'Look for annual payment discounts',
                    'Bundle services where possible',
                ],
                dataPoints: subscriptions.map(sub => ({
                    period: sub.name,
                    value: sub.amount,
                })),
                createdAt: new Date(),
                isRead: false,
                isActioned: false,
            });
        }
        const monthlyFees = accounts.reduce((sum, acc) => sum + acc.fees.monthlyFee, 0);
        if (monthlyFees > 200) {
            insights.push({
                id: `bank_fees_${Date.now()}`,
                userId,
                type: 'fee_optimization',
                title: 'High banking fees detected',
                description: `You're paying R${monthlyFees.toFixed(2)} in monthly banking fees. Consider switching to lower-cost banking options.`,
                category: banking_interface_1.TransactionCategory.FEES_CHARGES,
                impact: {
                    amount: monthlyFees * 0.5,
                    percentage: 50,
                    timeframe: 'monthly',
                },
                confidence: 90,
                priority: 'medium',
                actionable: true,
                suggestedActions: [
                    'Compare banking packages',
                    'Consider digital-only banks like TymeBank',
                    'Negotiate with your current bank',
                    'Reduce unnecessary transactions',
                ],
                dataPoints: accounts.map(acc => ({
                    period: acc.bankName,
                    value: acc.fees.monthlyFee,
                })),
                createdAt: new Date(),
                isRead: false,
                isActioned: false,
            });
        }
        return insights;
    }
    generateIncomeInsights(userId, transactions) {
        const insights = [];
        const now = new Date();
        const last3Months = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        const incomeTransactions = transactions.filter(t => t.date >= last3Months &&
            t.type === 'credit' &&
            (t.category === banking_interface_1.TransactionCategory.SALARY ||
                t.category === banking_interface_1.TransactionCategory.BUSINESS_REVENUE ||
                t.category === banking_interface_1.TransactionCategory.FREELANCE));
        if (incomeTransactions.length === 0)
            return insights;
        const monthlyIncome = this.calculateMonthlyIncome(incomeTransactions);
        const incomeEntries = Object.entries(monthlyIncome).sort();
        if (incomeEntries.length >= 2) {
            const currentMonth = incomeEntries[incomeEntries.length - 1][1];
            const previousMonth = incomeEntries[incomeEntries.length - 2][1];
            const change = currentMonth - previousMonth;
            const percentChange = previousMonth > 0 ? (change / previousMonth) * 100 : 0;
            if (Math.abs(percentChange) > 10) {
                insights.push({
                    id: `income_trend_${Date.now()}`,
                    userId,
                    type: 'income_trend',
                    title: `Income ${percentChange > 0 ? 'increased' : 'decreased'} this month`,
                    description: `Your monthly income has ${percentChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(percentChange).toFixed(1)}% (R${Math.abs(change).toFixed(2)}).`,
                    category: banking_interface_1.TransactionCategory.SALARY,
                    impact: {
                        amount: Math.abs(change),
                        percentage: Math.abs(percentChange),
                        timeframe: 'monthly',
                    },
                    confidence: 85,
                    priority: Math.abs(change) > 5000 ? 'high' : 'medium',
                    actionable: percentChange < 0,
                    suggestedActions: percentChange > 0 ? [
                        'Consider increasing your savings rate',
                        'Invest the additional income',
                        'Pay down debt faster',
                    ] : [
                        'Review your income sources',
                        'Look for additional income opportunities',
                        'Adjust your budget accordingly',
                    ],
                    dataPoints: incomeEntries.map(([period, amount]) => ({
                        period,
                        value: amount,
                    })),
                    createdAt: new Date(),
                    isRead: false,
                    isActioned: false,
                });
            }
        }
        return insights;
    }
    generateGoalProgressInsights(userId, transactions) {
        const insights = [];
        const thisMonth = new Date();
        thisMonth.setDate(1);
        const thisMonthTransactions = transactions.filter(t => t.date >= thisMonth);
        const income = thisMonthTransactions
            .filter(t => t.type === 'credit' &&
            (t.category === banking_interface_1.TransactionCategory.SALARY ||
                t.category === banking_interface_1.TransactionCategory.BUSINESS_REVENUE))
            .reduce((sum, t) => sum + t.amount, 0);
        const expenses = thisMonthTransactions
            .filter(t => t.type === 'debit')
            .reduce((sum, t) => sum + t.amount, 0);
        if (income > 0) {
            const savingsRate = ((income - expenses) / income) * 100;
            const recommendedSavingsRate = 20;
            if (savingsRate < recommendedSavingsRate) {
                insights.push({
                    id: `savings_rate_${Date.now()}`,
                    userId,
                    type: 'goal_progress',
                    title: 'Low savings rate detected',
                    description: `Your current savings rate is ${savingsRate.toFixed(1)}%. Financial experts recommend saving at least 20% of your income.`,
                    category: banking_interface_1.TransactionCategory.SAVINGS,
                    impact: {
                        amount: income * (recommendedSavingsRate - savingsRate) / 100,
                        percentage: recommendedSavingsRate - savingsRate,
                        timeframe: 'monthly',
                    },
                    confidence: 90,
                    priority: savingsRate < 10 ? 'high' : 'medium',
                    actionable: true,
                    suggestedActions: [
                        'Set up automatic savings transfers',
                        'Review and reduce unnecessary expenses',
                        'Increase income through side hustles',
                        'Use the 50/30/20 budgeting rule',
                    ],
                    dataPoints: [
                        { period: 'Current Savings Rate', value: savingsRate },
                        { period: 'Recommended Rate', value: recommendedSavingsRate },
                    ],
                    createdAt: new Date(),
                    isRead: false,
                    isActioned: false,
                });
            }
        }
        return insights;
    }
    calculateCategorySpending(transactions) {
        const spending = {};
        for (const transaction of transactions) {
            const category = transaction.category;
            spending[category] = (spending[category] || 0) + Math.abs(transaction.amount);
        }
        return spending;
    }
    calculateMonthlyIncome(transactions) {
        const monthlyIncome = {};
        for (const transaction of transactions) {
            const monthKey = `${transaction.date.getFullYear()}-${String(transaction.date.getMonth() + 1).padStart(2, '0')}`;
            monthlyIncome[monthKey] = (monthlyIncome[monthKey] || 0) + transaction.amount;
        }
        return monthlyIncome;
    }
    identifySubscriptions(transactions) {
        const subscriptionKeywords = ['netflix', 'spotify', 'dstv', 'showmax', 'microsoft', 'adobe', 'amazon'];
        const potentialSubscriptions = new Map();
        for (const transaction of transactions) {
            if (transaction.type === 'debit') {
                const description = transaction.description.toLowerCase();
                const isSubscription = subscriptionKeywords.some(keyword => description.includes(keyword)) ||
                    transaction.isRecurring;
                if (isSubscription) {
                    const key = transaction.description.toLowerCase().substring(0, 20);
                    const existing = potentialSubscriptions.get(key) || { amounts: [], count: 0 };
                    existing.amounts.push(Math.abs(transaction.amount));
                    existing.count++;
                    potentialSubscriptions.set(key, existing);
                }
            }
        }
        const subscriptions = [];
        for (const [key, data] of potentialSubscriptions) {
            if (data.count >= 2) {
                const avgAmount = data.amounts.reduce((sum, amt) => sum + amt, 0) / data.amounts.length;
                const variance = data.amounts.reduce((sum, amt) => sum + Math.pow(amt - avgAmount, 2), 0) / data.amounts.length;
                if (variance < avgAmount * 0.1) {
                    subscriptions.push({
                        name: key.charAt(0).toUpperCase() + key.slice(1),
                        amount: avgAmount,
                        frequency: data.count,
                    });
                }
            }
        }
        return subscriptions;
    }
};
exports.BankingInsightsService = BankingInsightsService;
exports.BankingInsightsService = BankingInsightsService = BankingInsightsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [advanced_logger_service_1.AdvancedLoggerService])
], BankingInsightsService);
//# sourceMappingURL=banking-insights.service.js.map