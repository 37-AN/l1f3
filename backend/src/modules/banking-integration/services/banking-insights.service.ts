import { Injectable, Logger } from '@nestjs/common';
import { AdvancedLoggerService } from '../../../common/logger/advanced-logger.service';
import { BankAccount, Transaction, BankingInsight, TransactionCategory } from '../interfaces/banking.interface';

@Injectable()
export class BankingInsightsService {
  private readonly logger = new Logger(BankingInsightsService.name);

  constructor(private readonly advancedLogger: AdvancedLoggerService) {}

  async generateInsights(
    userId: string,
    accounts: BankAccount[],
    transactions: Transaction[]
  ): Promise<BankingInsight[]> {
    const insights: BankingInsight[] = [];

    // Generate various types of insights
    insights.push(...this.generateSpendingPatternInsights(userId, transactions));
    insights.push(...this.generateSavingsOpportunityInsights(userId, accounts, transactions));
    insights.push(...this.generateIncomeInsights(userId, transactions));
    insights.push(...this.generateGoalProgressInsights(userId, transactions));

    // Sort by priority and confidence
    return insights
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return b.confidence - a.confidence;
      })
      .slice(0, 10); // Top 10 insights
  }

  private generateSpendingPatternInsights(userId: string, transactions: Transaction[]): BankingInsight[] {
    const insights: BankingInsight[] = [];
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Calculate monthly spending by category
    const thisMonthSpending = this.calculateCategorySpending(
      transactions.filter(t => t.date >= thisMonth && t.type === 'debit')
    );
    
    const lastMonthSpending = this.calculateCategorySpending(
      transactions.filter(t => t.date >= lastMonth && t.date < thisMonth && t.type === 'debit')
    );

    // Find categories with significant changes
    for (const [category, thisMonthAmount] of Object.entries(thisMonthSpending)) {
      const lastMonthAmount = lastMonthSpending[category as TransactionCategory] || 0;
      const change = thisMonthAmount - lastMonthAmount;
      const percentChange = lastMonthAmount > 0 ? (change / lastMonthAmount) * 100 : 0;

      if (Math.abs(percentChange) > 25 && Math.abs(change) > 500) {
        insights.push({
          id: `spending_${category}_${Date.now()}`,
          userId,
          type: 'spending_pattern',
          title: `${category.replace('_', ' ')} spending ${percentChange > 0 ? 'increased' : 'decreased'}`,
          description: `Your ${category.replace('_', ' ')} spending has ${percentChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(percentChange).toFixed(1)}% this month (R${Math.abs(change).toFixed(2)}).`,
          category: category as TransactionCategory,
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

  private generateSavingsOpportunityInsights(
    userId: string,
    accounts: BankAccount[],
    transactions: Transaction[]
  ): BankingInsight[] {
    const insights: BankingInsight[] = [];

    // Identify subscription services
    const subscriptions = this.identifySubscriptions(transactions);
    if (subscriptions.length > 0) {
      const totalSubscriptionCost = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
      
      insights.push({
        id: `subscriptions_${Date.now()}`,
        userId,
        type: 'savings_opportunity',
        title: 'Review your subscriptions',
        description: `You have ${subscriptions.length} active subscriptions costing R${totalSubscriptionCost.toFixed(2)} monthly. Review if you're using all of them.`,
        category: TransactionCategory.SUBSCRIPTIONS,
        impact: {
          amount: totalSubscriptionCost * 0.3, // Potential 30% savings
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

    // Bank fee optimization
    const monthlyFees = accounts.reduce((sum, acc) => sum + acc.fees.monthlyFee, 0);
    if (monthlyFees > 200) {
      insights.push({
        id: `bank_fees_${Date.now()}`,
        userId,
        type: 'fee_optimization',
        title: 'High banking fees detected',
        description: `You're paying R${monthlyFees.toFixed(2)} in monthly banking fees. Consider switching to lower-cost banking options.`,
        category: TransactionCategory.FEES_CHARGES,
        impact: {
          amount: monthlyFees * 0.5, // Potential 50% savings
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

  private generateIncomeInsights(userId: string, transactions: Transaction[]): BankingInsight[] {
    const insights: BankingInsight[] = [];
    const now = new Date();
    const last3Months = new Date(now.getFullYear(), now.getMonth() - 3, 1);

    const incomeTransactions = transactions.filter(
      t => t.date >= last3Months && 
          t.type === 'credit' && 
          (t.category === TransactionCategory.SALARY || 
           t.category === TransactionCategory.BUSINESS_REVENUE ||
           t.category === TransactionCategory.FREELANCE)
    );

    if (incomeTransactions.length === 0) return insights;

    // Calculate income trend
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
          category: TransactionCategory.SALARY,
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

  private generateGoalProgressInsights(userId: string, transactions: Transaction[]): BankingInsight[] {
    const insights: BankingInsight[] = [];

    // Analyze savings rate
    const thisMonth = new Date();
    thisMonth.setDate(1);
    
    const thisMonthTransactions = transactions.filter(t => t.date >= thisMonth);
    const income = thisMonthTransactions
      .filter(t => t.type === 'credit' && 
                  (t.category === TransactionCategory.SALARY || 
                   t.category === TransactionCategory.BUSINESS_REVENUE))
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = thisMonthTransactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);

    if (income > 0) {
      const savingsRate = ((income - expenses) / income) * 100;
      const recommendedSavingsRate = 20; // 20% recommended

      if (savingsRate < recommendedSavingsRate) {
        insights.push({
          id: `savings_rate_${Date.now()}`,
          userId,
          type: 'goal_progress',
          title: 'Low savings rate detected',
          description: `Your current savings rate is ${savingsRate.toFixed(1)}%. Financial experts recommend saving at least 20% of your income.`,
          category: TransactionCategory.SAVINGS,
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

  private calculateCategorySpending(transactions: Transaction[]): { [key in TransactionCategory]?: number } {
    const spending: { [key in TransactionCategory]?: number } = {};
    
    for (const transaction of transactions) {
      const category = transaction.category;
      spending[category] = (spending[category] || 0) + Math.abs(transaction.amount);
    }
    
    return spending;
  }

  private calculateMonthlyIncome(transactions: Transaction[]): { [month: string]: number } {
    const monthlyIncome: { [month: string]: number } = {};
    
    for (const transaction of transactions) {
      const monthKey = `${transaction.date.getFullYear()}-${String(transaction.date.getMonth() + 1).padStart(2, '0')}`;
      monthlyIncome[monthKey] = (monthlyIncome[monthKey] || 0) + transaction.amount;
    }
    
    return monthlyIncome;
  }

  private identifySubscriptions(transactions: Transaction[]): Array<{ name: string; amount: number; frequency: number }> {
    const subscriptionKeywords = ['netflix', 'spotify', 'dstv', 'showmax', 'microsoft', 'adobe', 'amazon'];
    const potentialSubscriptions = new Map<string, { amounts: number[]; count: number }>();

    // Look for recurring payments
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

    // Filter for likely subscriptions (recurring with similar amounts)
    const subscriptions: Array<{ name: string; amount: number; frequency: number }> = [];
    
    for (const [key, data] of potentialSubscriptions) {
      if (data.count >= 2) {
        const avgAmount = data.amounts.reduce((sum, amt) => sum + amt, 0) / data.amounts.length;
        const variance = data.amounts.reduce((sum, amt) => sum + Math.pow(amt - avgAmount, 2), 0) / data.amounts.length;
        
        // Low variance indicates consistent subscription amount
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
}