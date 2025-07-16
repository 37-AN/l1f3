import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdvancedLoggerService } from '../../../common/logger/advanced-logger.service';
import { Transaction, BankAccount, FraudAlert, TransactionCategory } from '../interfaces/banking.interface';

export interface FraudRule {
  id: string;
  name: string;
  type: 'amount' | 'velocity' | 'location' | 'time' | 'merchant' | 'pattern';
  enabled: boolean;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  weight: number;
}

interface VelocityCheck {
  timeWindow: number; // minutes
  maxTransactions: number;
  maxAmount: number;
}

interface LocationRisk {
  city: string;
  province: string;
  country: string;
  riskScore: number;
  isKnownLocation: boolean;
}

interface FraudContext {
  transaction: Transaction;
  account: BankAccount;
  recentTransactions: Transaction[];
  userProfile: {
    averageTransactionAmount: number;
    commonMerchants: string[];
    commonLocations: string[];
    typicalTransactionTimes: number[];
    monthlySpendingPattern: { [category: string]: number };
  };
}

@Injectable()
export class FraudDetectionService {
  private readonly logger = new Logger(FraudDetectionService.name);
  private fraudRules: FraudRule[] = [];
  private activeAlerts = new Map<string, FraudAlert[]>();
  private userProfiles = new Map<string, any>();
  private blacklistedMerchants: string[] = [];
  private highRiskLocations: LocationRisk[] = [];

  constructor(
    private readonly configService: ConfigService,
    private readonly advancedLogger: AdvancedLoggerService,
  ) {}

  async initializeFraudRules(): Promise<void> {
    this.logger.log('Initializing fraud detection rules');

    try {
      // Load fraud detection rules
      this.loadFraudRules();

      // Load blacklisted merchants
      this.loadBlacklistedMerchants();

      // Load high-risk locations
      this.loadHighRiskLocations();

      this.advancedLogger.logSecurity('Fraud detection system initialized', {
        operation: 'fraud_detection_initialization',
        metadata: {
          rulesCount: this.fraudRules.length,
          blacklistedMerchants: this.blacklistedMerchants.length,
          highRiskLocations: this.highRiskLocations.length,
        },
      });

      this.logger.log('Fraud detection system ready');
    } catch (error) {
      this.logger.error('Failed to initialize fraud detection:', error);
      throw error;
    }
  }

  /**
   * Analyze transaction for fraud indicators
   */
  async analyzeTransaction(transaction: Transaction, account: BankAccount): Promise<number> {
    try {
      const startTime = Date.now();

      // Build fraud context
      const context = await this.buildFraudContext(transaction, account);

      // Run fraud detection rules
      const fraudScore = await this.calculateFraudScore(context);

      // Log analysis
      this.advancedLogger.logSecurity(`Fraud analysis completed: score ${fraudScore}`, {
        operation: 'fraud_analysis',
        success: true,
        duration: Date.now() - startTime,
        metadata: {
          transactionId: transaction.id,
          accountId: account.id,
          fraudScore,
          amount: transaction.amount,
          merchant: transaction.merchant?.name,
        },
      });

      // Create alert if high risk
      if (fraudScore > 70) {
        await this.createFraudAlert(transaction, account, fraudScore, context);
      }

      return fraudScore;
    } catch (error) {
      this.logger.error(`Failed to analyze transaction ${transaction.id}:`, error);
      return 0; // Safe default
    }
  }

  /**
   * Load fraud detection rules
   */
  private loadFraudRules(): void {
    this.fraudRules = [
      {
        id: 'unusual_amount',
        name: 'Unusual Transaction Amount',
        type: 'amount',
        enabled: true,
        threshold: 3.0, // 3 standard deviations
        severity: 'medium',
        description: 'Transaction amount significantly higher than usual',
        weight: 25,
      },
      {
        id: 'velocity_check',
        name: 'High Transaction Velocity',
        type: 'velocity',
        enabled: true,
        threshold: 5, // 5 transactions in window
        severity: 'high',
        description: 'Too many transactions in short time period',
        weight: 30,
      },
      {
        id: 'off_hours_transaction',
        name: 'Off-Hours Transaction',
        type: 'time',
        enabled: true,
        threshold: 0.1, // 10% probability
        severity: 'low',
        description: 'Transaction at unusual time',
        weight: 10,
      },
      {
        id: 'unusual_location',
        name: 'Unusual Transaction Location',
        type: 'location',
        enabled: true,
        threshold: 100, // 100km from usual locations
        severity: 'medium',
        description: 'Transaction in unfamiliar location',
        weight: 20,
      },
      {
        id: 'blacklisted_merchant',
        name: 'Blacklisted Merchant',
        type: 'merchant',
        enabled: true,
        threshold: 1,
        severity: 'critical',
        description: 'Transaction with known fraudulent merchant',
        weight: 50,
      },
      {
        id: 'duplicate_transaction',
        name: 'Duplicate Transaction',
        type: 'pattern',
        enabled: true,
        threshold: 0.95, // 95% similarity
        severity: 'high',
        description: 'Very similar transaction detected recently',
        weight: 35,
      },
      {
        id: 'round_amount_pattern',
        name: 'Round Amount Pattern',
        type: 'pattern',
        enabled: true,
        threshold: 3, // 3+ consecutive round amounts
        severity: 'low',
        description: 'Pattern of round number transactions',
        weight: 15,
      },
      {
        id: 'international_transaction',
        name: 'International Transaction',
        type: 'location',
        enabled: true,
        threshold: 1,
        severity: 'medium',
        description: 'Transaction outside South Africa',
        weight: 25,
      },
      {
        id: 'card_not_present',
        name: 'Card Not Present Transaction',
        type: 'pattern',
        enabled: true,
        threshold: 1000, // Amount threshold for CNP
        severity: 'low',
        description: 'Large online/phone transaction',
        weight: 12,
      },
      {
        id: 'spending_surge',
        name: 'Sudden Spending Surge',
        type: 'pattern',
        enabled: true,
        threshold: 5.0, // 5x normal daily spending
        severity: 'high',
        description: 'Daily spending much higher than normal',
        weight: 28,
      },
    ];

    this.logger.log(`Loaded ${this.fraudRules.length} fraud detection rules`);
  }

  /**
   * Load blacklisted merchants (known fraudulent entities)
   */
  private loadBlacklistedMerchants(): void {
    // In production, this would come from external fraud databases
    this.blacklistedMerchants = [
      'FRAUDULENT MERCHANT',
      'SCAM COMPANY',
      'FAKE STORE',
      'PHISHING SITE',
      // Add known fraudulent South African entities
    ];

    this.logger.log(`Loaded ${this.blacklistedMerchants.length} blacklisted merchants`);
  }

  /**
   * Load high-risk locations
   */
  private loadHighRiskLocations(): void {
    this.highRiskLocations = [
      {
        city: 'Unknown',
        province: 'Unknown',
        country: 'Nigeria', // Common source of fraud
        riskScore: 80,
        isKnownLocation: false,
      },
      {
        city: 'Unknown',
        province: 'Unknown',
        country: 'Ghana',
        riskScore: 75,
        isKnownLocation: false,
      },
      {
        city: 'Unknown',
        province: 'Unknown',
        country: 'Russia',
        riskScore: 85,
        isKnownLocation: false,
      },
      // Add other high-risk international locations
    ];

    this.logger.log(`Loaded ${this.highRiskLocations.length} high-risk locations`);
  }

  /**
   * Build fraud context for analysis
   */
  private async buildFraudContext(transaction: Transaction, account: BankAccount): Promise<FraudContext> {
    // Get recent transactions (last 30 days)
    const recentTransactions = await this.getRecentTransactions(account.id, 30);

    // Build or update user profile
    const userProfile = this.buildUserProfile(account.id.split('_')[0], recentTransactions);

    return {
      transaction,
      account,
      recentTransactions,
      userProfile,
    };
  }

  /**
   * Calculate overall fraud score
   */
  private async calculateFraudScore(context: FraudContext): Promise<number> {
    let totalScore = 0;
    let totalWeight = 0;

    const ruleResults: { [ruleId: string]: number } = {};

    // Apply each enabled fraud rule
    for (const rule of this.fraudRules) {
      if (!rule.enabled) continue;

      let ruleScore = 0;

      switch (rule.type) {
        case 'amount':
          ruleScore = await this.checkAmountAnomaly(context, rule);
          break;
        case 'velocity':
          ruleScore = await this.checkVelocityAnomaly(context, rule);
          break;
        case 'time':
          ruleScore = await this.checkTimeAnomaly(context, rule);
          break;
        case 'location':
          ruleScore = await this.checkLocationAnomaly(context, rule);
          break;
        case 'merchant':
          ruleScore = await this.checkMerchantRisk(context, rule);
          break;
        case 'pattern':
          ruleScore = await this.checkPatternAnomaly(context, rule);
          break;
      }

      if (ruleScore > 0) {
        totalScore += ruleScore * rule.weight;
        totalWeight += rule.weight;
        ruleResults[rule.id] = ruleScore;
      }
    }

    // Normalize score to 0-100 range
    const normalizedScore = totalWeight > 0 ? Math.min(100, (totalScore / totalWeight)) : 0;

    // Log detailed results for high scores
    if (normalizedScore > 50) {
      this.advancedLogger.logSecurity(`High fraud score detected: ${normalizedScore}`, {
        operation: 'fraud_score_calculation',
        metadata: {
          transactionId: context.transaction.id,
          fraudScore: normalizedScore,
          triggeredRules: Object.keys(ruleResults),
          ruleResults,
        },
      });
    }

    return Math.round(normalizedScore);
  }

  /**
   * Check for amount-based anomalies
   */
  private async checkAmountAnomaly(context: FraudContext, rule: FraudRule): Promise<number> {
    const { transaction, userProfile } = context;
    const amount = Math.abs(transaction.amount);

    // Calculate z-score based on user's transaction history
    const avgAmount = userProfile.averageTransactionAmount || 0;
    if (avgAmount === 0) return 0;

    // Simple standard deviation calculation
    const recentAmounts = context.recentTransactions.map(t => Math.abs(t.amount));
    const variance = recentAmounts.reduce((sum, amt) => sum + Math.pow(amt - avgAmount, 2), 0) / recentAmounts.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return 0;

    const zScore = (amount - avgAmount) / stdDev;

    // Return score if amount is unusually high
    if (zScore > rule.threshold) {
      return Math.min(100, (zScore / rule.threshold) * 100);
    }

    return 0;
  }

  /**
   * Check for velocity-based anomalies
   */
  private async checkVelocityAnomaly(context: FraudContext, rule: FraudRule): Promise<number> {
    const { transaction, recentTransactions } = context;
    const now = transaction.date;

    // Check transactions in last hour
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const recentHourTransactions = recentTransactions.filter(t => t.date >= oneHourAgo);

    // Check transaction count
    if (recentHourTransactions.length >= rule.threshold) {
      return 100;
    }

    // Check transaction amount velocity
    const totalAmount = recentHourTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    if (totalAmount > 10000) { // R10,000 in one hour
      return 80;
    }

    return 0;
  }

  /**
   * Check for time-based anomalies
   */
  private async checkTimeAnomaly(context: FraudContext, rule: FraudRule): Promise<number> {
    const { transaction, userProfile } = context;
    const hour = transaction.date.getHours();

    // Check if transaction is outside typical hours
    const typicalHours = userProfile.typicalTransactionTimes || [];
    if (typicalHours.length === 0) return 0;

    const isTypicalTime = typicalHours.some(typicalHour => Math.abs(hour - typicalHour) <= 2);

    if (!isTypicalTime) {
      // Higher score for very unusual hours (2-6 AM)
      if (hour >= 2 && hour <= 6) {
        return 70;
      }
      return 30;
    }

    return 0;
  }

  /**
   * Check for location-based anomalies
   */
  private async checkLocationAnomaly(context: FraudContext, rule: FraudRule): Promise<number> {
    const { transaction, userProfile } = context;

    if (!transaction.location) return 0;

    // Check if international transaction
    if (transaction.location.country !== 'South Africa') {
      const riskLocation = this.highRiskLocations.find(
        loc => loc.country === transaction.location!.country
      );
      if (riskLocation) {
        return riskLocation.riskScore;
      }
      return 50; // Default score for international transactions
    }

    // Check against user's common locations
    const commonLocations = userProfile.commonLocations || [];
    const isKnownLocation = commonLocations.some(loc => 
      loc.toLowerCase().includes(transaction.location!.city.toLowerCase())
    );

    if (!isKnownLocation) {
      return 40;
    }

    return 0;
  }

  /**
   * Check for merchant-related risks
   */
  private async checkMerchantRisk(context: FraudContext, rule: FraudRule): Promise<number> {
    const { transaction } = context;

    if (!transaction.merchant) return 0;

    // Check blacklisted merchants
    const isBlacklisted = this.blacklistedMerchants.some(merchant =>
      transaction.merchant!.name.toLowerCase().includes(merchant.toLowerCase())
    );

    if (isBlacklisted) {
      return 100;
    }

    // Check for suspicious merchant patterns
    const merchantName = transaction.merchant.name.toLowerCase();
    const suspiciousPatterns = ['test', 'temp', 'xxx', '123', 'fake', 'scam'];
    
    const hasSuspiciousPattern = suspiciousPatterns.some(pattern =>
      merchantName.includes(pattern)
    );

    if (hasSuspiciousPattern) {
      return 60;
    }

    return 0;
  }

  /**
   * Check for pattern-based anomalies
   */
  private async checkPatternAnomaly(context: FraudContext, rule: FraudRule): Promise<number> {
    const { transaction, recentTransactions } = context;

    switch (rule.id) {
      case 'duplicate_transaction':
        return this.checkDuplicateTransaction(transaction, recentTransactions);
      
      case 'round_amount_pattern':
        return this.checkRoundAmountPattern(transaction, recentTransactions);
      
      case 'card_not_present':
        return this.checkCardNotPresent(transaction, rule);
      
      case 'spending_surge':
        return this.checkSpendingSurge(transaction, recentTransactions);
      
      default:
        return 0;
    }
  }

  /**
   * Check for duplicate transactions
   */
  private checkDuplicateTransaction(transaction: Transaction, recentTransactions: Transaction[]): number {
    const lastHour = new Date(transaction.date.getTime() - 60 * 60 * 1000);
    const recentSimilar = recentTransactions.filter(t => {
      return t.date >= lastHour &&
             Math.abs(t.amount - transaction.amount) < 1 &&
             t.merchant?.name === transaction.merchant?.name;
    });

    if (recentSimilar.length > 0) {
      return 90;
    }

    return 0;
  }

  /**
   * Check for round amount patterns
   */
  private checkRoundAmountPattern(transaction: Transaction, recentTransactions: Transaction[]): number {
    const amount = Math.abs(transaction.amount);
    
    // Check if current transaction is a round number
    if (amount % 100 !== 0) return 0;

    // Check recent transactions for round number pattern
    const recentRoundAmounts = recentTransactions
      .slice(0, 5) // Last 5 transactions
      .filter(t => Math.abs(t.amount) % 100 === 0);

    if (recentRoundAmounts.length >= 3) {
      return 50;
    }

    return 0;
  }

  /**
   * Check for card-not-present risks
   */
  private checkCardNotPresent(transaction: Transaction, rule: FraudRule): number {
    if (transaction.paymentMethod === 'online' && Math.abs(transaction.amount) > rule.threshold) {
      return 40;
    }

    return 0;
  }

  /**
   * Check for spending surge
   */
  private checkSpendingSurge(transaction: Transaction, recentTransactions: Transaction[]): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTransactions = recentTransactions.filter(t => {
      const txnDate = new Date(t.date);
      txnDate.setHours(0, 0, 0, 0);
      return txnDate.getTime() === today.getTime() && t.type === 'debit';
    });

    const todaySpending = todayTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Compare with average daily spending over last 30 days
    const last30Days = recentTransactions.filter(t => 
      t.date >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && t.type === 'debit'
    );

    if (last30Days.length === 0) return 0;

    const avgDailySpending = last30Days.reduce((sum, t) => sum + Math.abs(t.amount), 0) / 30;

    if (avgDailySpending > 0 && todaySpending > avgDailySpending * 5) {
      return 80;
    }

    return 0;
  }

  /**
   * Create fraud alert
   */
  private async createFraudAlert(
    transaction: Transaction,
    account: BankAccount,
    fraudScore: number,
    context: FraudContext
  ): Promise<void> {
    const alert: FraudAlert = {
      id: `fraud_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      transactionId: transaction.id,
      accountId: account.id,
      type: this.determineFraudType(context),
      severity: this.determineSeverity(fraudScore),
      score: fraudScore,
      description: `Potentially fraudulent transaction detected: ${transaction.description}`,
      triggers: this.getTriggeredRules(context),
      createdAt: new Date(),
      status: 'open',
      notificationSent: false,
      actions: {
        accountBlocked: false,
        cardBlocked: false,
        notificationSent: false,
        manualReviewRequired: fraudScore > 85,
      },
    };

    // Store alert
    const accountAlerts = this.activeAlerts.get(account.id) || [];
    accountAlerts.push(alert);
    this.activeAlerts.set(account.id, accountAlerts);

    this.advancedLogger.logSecurity(`Fraud alert created: ${alert.id}`, {
      operation: 'fraud_alert_creation',
      metadata: {
        alertId: alert.id,
        transactionId: transaction.id,
        fraudScore,
        severity: alert.severity,
        triggers: alert.triggers,
      },
    });
  }

  /**
   * Helper methods
   */
  private async getRecentTransactions(accountId: string, days: number): Promise<Transaction[]> {
    // In production, this would query the database
    // For now, return empty array (transactions would be passed from banking service)
    return [];
  }

  private buildUserProfile(userId: string, recentTransactions: Transaction[]): any {
    if (recentTransactions.length === 0) {
      return {
        averageTransactionAmount: 0,
        commonMerchants: [],
        commonLocations: [],
        typicalTransactionTimes: [],
        monthlySpendingPattern: {},
      };
    }

    const amounts = recentTransactions.map(t => Math.abs(t.amount));
    const averageTransactionAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;

    const merchantCounts = new Map<string, number>();
    const locationCounts = new Map<string, number>();
    const hourCounts = new Map<number, number>();
    const categorySpending = new Map<TransactionCategory, number>();

    for (const txn of recentTransactions) {
      // Count merchants
      if (txn.merchant) {
        const count = merchantCounts.get(txn.merchant.name) || 0;
        merchantCounts.set(txn.merchant.name, count + 1);
      }

      // Count locations
      if (txn.location) {
        const location = `${txn.location.city}, ${txn.location.province}`;
        const count = locationCounts.get(location) || 0;
        locationCounts.set(location, count + 1);
      }

      // Count transaction hours
      const hour = txn.date.getHours();
      const count = hourCounts.get(hour) || 0;
      hourCounts.set(hour, count + 1);

      // Count category spending
      if (txn.type === 'debit') {
        const spending = categorySpending.get(txn.category) || 0;
        categorySpending.set(txn.category, spending + Math.abs(txn.amount));
      }
    }

    return {
      averageTransactionAmount,
      commonMerchants: Array.from(merchantCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([merchant]) => merchant),
      commonLocations: Array.from(locationCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([location]) => location),
      typicalTransactionTimes: Array.from(hourCounts.entries())
        .filter(([, count]) => count >= 2)
        .map(([hour]) => hour),
      monthlySpendingPattern: Object.fromEntries(categorySpending),
    };
  }

  private determineFraudType(context: FraudContext): FraudAlert['type'] {
    const { transaction } = context;
    
    if (Math.abs(transaction.amount) > 5000) {
      return 'unusual_amount';
    }
    
    if (transaction.location && transaction.location.country !== 'South Africa') {
      return 'unusual_location';
    }
    
    const hour = transaction.date.getHours();
    if (hour >= 22 || hour <= 5) {
      return 'unusual_time';
    }
    
    return 'velocity_check';
  }

  private determineSeverity(fraudScore: number): FraudAlert['severity'] {
    if (fraudScore >= 90) return 'critical';
    if (fraudScore >= 80) return 'high';
    if (fraudScore >= 60) return 'medium';
    return 'low';
  }

  private getTriggeredRules(context: FraudContext): string[] {
    // This would be populated during fraud score calculation
    // For now, return generic indicators
    return ['high_fraud_score'];
  }

  /**
   * Public API methods
   */
  async getActiveAlertsCount(userId: string): Promise<number> {
    let totalAlerts = 0;
    for (const alerts of this.activeAlerts.values()) {
      totalAlerts += alerts.filter(alert => alert.status === 'open').length;
    }
    return totalAlerts;
  }

  async getAccountAlerts(accountId: string): Promise<FraudAlert[]> {
    return this.activeAlerts.get(accountId) || [];
  }

  async resolveAlert(alertId: string, resolution: string): Promise<void> {
    for (const [accountId, alerts] of this.activeAlerts) {
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        alert.status = 'resolved';
        alert.resolvedAt = new Date();
        alert.resolution = resolution;
        
        this.advancedLogger.logSecurity(`Fraud alert resolved: ${alertId}`, {
          operation: 'fraud_alert_resolution',
          metadata: { alertId, resolution },
        });
        break;
      }
    }
  }

  getFraudRules(): FraudRule[] {
    return this.fraudRules;
  }

  async updateFraudRule(ruleId: string, updates: Partial<FraudRule>): Promise<void> {
    const rule = this.fraudRules.find(r => r.id === ruleId);
    if (rule) {
      Object.assign(rule, updates);
      
      this.advancedLogger.logSecurity(`Fraud rule updated: ${ruleId}`, {
        operation: 'fraud_rule_update',
        metadata: { ruleId, updates },
      });
    }
  }
}