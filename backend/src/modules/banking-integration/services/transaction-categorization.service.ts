import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdvancedLoggerService } from '../../../common/logger/advanced-logger.service';
import { Transaction, TransactionCategory } from '../interfaces/banking.interface';

interface CategoryRule {
  id: string;
  category: TransactionCategory;
  patterns: string[];
  keywords: string[];
  merchantCategories: string[];
  amountRanges?: {
    min?: number;
    max?: number;
  };
  confidence: number;
  priority: number;
}

interface SouthAfricanMerchant {
  name: string;
  aliases: string[];
  category: TransactionCategory;
  mcc?: string;
  confidence: number;
}

interface CategorizationResult {
  category: TransactionCategory;
  confidence: number;
  method: 'rule_based' | 'merchant_lookup' | 'ml_prediction' | 'keyword_match';
  matchedRule?: string;
  suggestions?: TransactionCategory[];
}

@Injectable()
export class TransactionCategorizationService implements OnModuleInit {
  private readonly logger = new Logger(TransactionCategorizationService.name);
  private categoryRules: CategoryRule[] = [];
  private southAfricanMerchants: SouthAfricanMerchant[] = [];
  private learningData = new Map<string, { category: TransactionCategory; frequency: number }>();

  constructor(
    private readonly configService: ConfigService,
    private readonly advancedLogger: AdvancedLoggerService,
  ) {}

  async onModuleInit() {
    await this.initializeModels();
  }

  async initializeModels(): Promise<void> {
    this.logger.log('Initializing transaction categorization models');

    try {
      // Load categorization rules
      this.loadCategorizationRules();

      // Load South African merchant database
      this.loadSouthAfricanMerchants();

      // Initialize machine learning models (simplified)
      await this.initializeMLModels();

      this.advancedLogger.logAutomation('Transaction categorization models initialized', {
        operation: 'categorization_initialization',
        success: true,
        metadata: {
          rulesCount: this.categoryRules.length,
          merchantsCount: this.southAfricanMerchants.length,
        },
      });

      this.logger.log('Transaction categorization system ready');
    } catch (error) {
      this.logger.error('Failed to initialize categorization models:', error);
      throw error;
    }
  }

  /**
   * Categorize a transaction using multiple methods
   */
  async categorizeTransaction(transaction: Transaction): Promise<TransactionCategory> {
    try {
      const startTime = Date.now();
      
      // Try multiple categorization methods in order of confidence
      const results: CategorizationResult[] = [
        await this.categorizeBySouthAfricanMerchant(transaction),
        await this.categorizeByRules(transaction),
        await this.categorizeByKeywords(transaction),
        await this.categorizeByAmount(transaction),
      ].filter(result => result.confidence > 0);

      // Sort by confidence and select best result
      results.sort((a, b) => b.confidence - a.confidence);
      const bestResult = results[0];

      const finalCategory = bestResult?.category || TransactionCategory.UNKNOWN;
      const confidence = bestResult?.confidence || 0;

      // Learn from successful categorizations
      if (confidence > 70) {
        this.updateLearningData(transaction.description, finalCategory);
      }

      this.advancedLogger.logFinancial(`Transaction categorized: ${finalCategory}`, {
        operation: 'transaction_categorization',
        success: true,
        duration: Date.now() - startTime,
        metadata: {
          transactionId: transaction.id,
          category: finalCategory,
          confidence,
          method: bestResult?.method || 'unknown',
          amount: transaction.amount,
        },
      });

      return finalCategory;
    } catch (error) {
      this.logger.error(`Failed to categorize transaction ${transaction.id}:`, error);
      return TransactionCategory.UNKNOWN;
    }
  }

  /**
   * Load categorization rules
   */
  private loadCategorizationRules(): void {
    this.categoryRules = [
      // Income Categories
      {
        id: 'salary_rule',
        category: TransactionCategory.SALARY,
        patterns: ['SALARY', 'WAGE', 'PAY', 'PAYROLL', 'EMPL'],
        keywords: ['salary', 'wage', 'payroll', 'employment', 'employer'],
        merchantCategories: [],
        confidence: 95,
        priority: 1,
      },
      {
        id: 'business_revenue_rule',
        category: TransactionCategory.BUSINESS_REVENUE,
        patterns: ['43V3R', 'BUSINESS', 'CLIENT', 'INVOICE', 'PAYMENT RECEIVED'],
        keywords: ['43v3r', 'business', 'client', 'invoice', 'payment', 'consulting'],
        merchantCategories: [],
        confidence: 90,
        priority: 1,
      },
      {
        id: 'freelance_rule',
        category: TransactionCategory.FREELANCE,
        patterns: ['FREELANCE', 'CONTRACT', 'CONSULTING', 'PROJECT'],
        keywords: ['freelance', 'contract', 'consulting', 'project', 'gig'],
        merchantCategories: [],
        confidence: 85,
        priority: 2,
      },

      // Essential Expenses
      {
        id: 'rent_mortgage_rule',
        category: TransactionCategory.RENT_MORTGAGE,
        patterns: ['RENT', 'MORTGAGE', 'BOND', 'LEVY'],
        keywords: ['rent', 'mortgage', 'bond', 'levy', 'property'],
        merchantCategories: [],
        amountRanges: { min: 5000, max: 50000 },
        confidence: 95,
        priority: 1,
      },
      {
        id: 'utilities_rule',
        category: TransactionCategory.UTILITIES,
        patterns: ['ESKOM', 'MUNICIPALITY', 'WATER', 'ELECTRICITY', 'RATES'],
        keywords: ['eskom', 'electricity', 'water', 'municipality', 'rates', 'utilities'],
        merchantCategories: ['4900'],
        confidence: 90,
        priority: 1,
      },
      {
        id: 'groceries_rule',
        category: TransactionCategory.GROCERIES,
        patterns: ['CHECKERS', 'PICK N PAY', 'WOOLWORTHS', 'SPAR', 'SHOPRITE', 'DISCHEM'],
        keywords: ['groceries', 'supermarket', 'food', 'pharmacy'],
        merchantCategories: ['5411', '5912'],
        confidence: 85,
        priority: 2,
      },
      {
        id: 'transport_fuel_rule',
        category: TransactionCategory.TRANSPORT_FUEL,
        patterns: ['SHELL', 'BP', 'SASOL', 'ENGEN', 'TOTAL', 'UBER', 'BOLT', 'TAXI'],
        keywords: ['fuel', 'petrol', 'diesel', 'uber', 'bolt', 'taxi', 'transport'],
        merchantCategories: ['5542', '4121'],
        confidence: 85,
        priority: 2,
      },

      // Lifestyle Categories
      {
        id: 'dining_rule',
        category: TransactionCategory.DINING,
        patterns: ['MCDONALDS', 'KFC', 'NANDOS', 'STEERS', 'WIMPY', 'RESTAURANT'],
        keywords: ['restaurant', 'food', 'dining', 'takeaway', 'fast food'],
        merchantCategories: ['5812', '5814'],
        confidence: 80,
        priority: 2,
      },
      {
        id: 'entertainment_rule',
        category: TransactionCategory.ENTERTAINMENT,
        patterns: ['STER KINEKOR', 'NU METRO', 'SPOTIFY', 'NETFLIX', 'DSTV', 'SHOWMAX'],
        keywords: ['cinema', 'movie', 'entertainment', 'streaming', 'music', 'tv'],
        merchantCategories: ['5813', '7832'],
        confidence: 80,
        priority: 2,
      },
      {
        id: 'shopping_rule',
        category: TransactionCategory.SHOPPING,
        patterns: ['GAME', 'MAKRO', 'BUILDERS', 'MR PRICE', 'EDGARS', 'FOSCHINI'],
        keywords: ['shopping', 'retail', 'store', 'clothing', 'electronics'],
        merchantCategories: ['5311', '5651', '5732'],
        confidence: 75,
        priority: 3,
      },

      // Financial Categories
      {
        id: 'savings_rule',
        category: TransactionCategory.SAVINGS,
        patterns: ['SAVINGS', 'INVEST', 'FIXED DEPOSIT', 'MONEY MARKET'],
        keywords: ['savings', 'investment', 'deposit', 'money market'],
        merchantCategories: [],
        confidence: 90,
        priority: 1,
      },
      {
        id: 'loan_payment_rule',
        category: TransactionCategory.LOAN_PAYMENT,
        patterns: ['LOAN', 'CREDIT', 'INSTALMENT', 'DEBT'],
        keywords: ['loan', 'credit', 'instalment', 'debt', 'repayment'],
        merchantCategories: [],
        confidence: 85,
        priority: 2,
      },

      // Transfer Categories
      {
        id: 'transfer_rule',
        category: TransactionCategory.TRANSFER,
        patterns: ['TRANSFER', 'FT', 'EFT', 'INTERNET TRANSFER'],
        keywords: ['transfer', 'eft', 'internet banking', 'payment'],
        merchantCategories: [],
        confidence: 70,
        priority: 4,
      },
      {
        id: 'cash_withdrawal_rule',
        category: TransactionCategory.CASH_WITHDRAWAL,
        patterns: ['ATM', 'CASH', 'WITHDRAWAL', 'TELLER'],
        keywords: ['atm', 'cash', 'withdrawal', 'teller'],
        merchantCategories: ['6011'],
        confidence: 95,
        priority: 1,
      },
    ];

    this.logger.log(`Loaded ${this.categoryRules.length} categorization rules`);
  }

  /**
   * Load South African merchant database
   */
  private loadSouthAfricanMerchants(): void {
    this.southAfricanMerchants = [
      // Grocery Stores
      { name: 'CHECKERS', aliases: ['CHECKERS HYPER', 'CHECKERS SIXTY60'], category: TransactionCategory.GROCERIES, confidence: 95 },
      { name: 'PICK N PAY', aliases: ['PNP', 'PICK N PAY HYPER'], category: TransactionCategory.GROCERIES, confidence: 95 },
      { name: 'WOOLWORTHS', aliases: ['WOOLIES', 'WW'], category: TransactionCategory.GROCERIES, confidence: 95 },
      { name: 'SPAR', aliases: ['SUPERSPAR', 'KWIKSPAR'], category: TransactionCategory.GROCERIES, confidence: 95 },
      { name: 'SHOPRITE', aliases: ['SHOPRITE CHECKERS'], category: TransactionCategory.GROCERIES, confidence: 95 },
      { name: 'DISCHEM', aliases: ['DIS-CHEM', 'DISCHEM PHARMACY'], category: TransactionCategory.MEDICAL, confidence: 90 },

      // Fast Food
      { name: 'MCDONALDS', aliases: ['MCD', 'MCDONALD\'S'], category: TransactionCategory.DINING, confidence: 95 },
      { name: 'KFC', aliases: ['KENTUCKY'], category: TransactionCategory.DINING, confidence: 95 },
      { name: 'NANDOS', aliases: ['NANDO\'S'], category: TransactionCategory.DINING, confidence: 95 },
      { name: 'STEERS', aliases: [], category: TransactionCategory.DINING, confidence: 95 },
      { name: 'WIMPY', aliases: [], category: TransactionCategory.DINING, confidence: 95 },
      { name: 'BURGER KING', aliases: ['BK'], category: TransactionCategory.DINING, confidence: 95 },

      // Fuel Stations
      { name: 'SHELL', aliases: ['SHELL SA'], category: TransactionCategory.TRANSPORT_FUEL, confidence: 95 },
      { name: 'BP', aliases: ['BP SOUTH AFRICA'], category: TransactionCategory.TRANSPORT_FUEL, confidence: 95 },
      { name: 'SASOL', aliases: [], category: TransactionCategory.TRANSPORT_FUEL, confidence: 95 },
      { name: 'ENGEN', aliases: [], category: TransactionCategory.TRANSPORT_FUEL, confidence: 95 },
      { name: 'TOTAL', aliases: ['TOTAL SA'], category: TransactionCategory.TRANSPORT_FUEL, confidence: 95 },

      // Transport
      { name: 'UBER', aliases: ['UBER TRIP'], category: TransactionCategory.TRANSPORT_FUEL, confidence: 90 },
      { name: 'BOLT', aliases: ['BOLT RIDE'], category: TransactionCategory.TRANSPORT_FUEL, confidence: 90 },

      // Entertainment
      { name: 'STER KINEKOR', aliases: ['STER-KINEKOR'], category: TransactionCategory.ENTERTAINMENT, confidence: 95 },
      { name: 'NU METRO', aliases: ['NUMETRO'], category: TransactionCategory.ENTERTAINMENT, confidence: 95 },
      { name: 'NETFLIX', aliases: [], category: TransactionCategory.ENTERTAINMENT, confidence: 95 },
      { name: 'SPOTIFY', aliases: [], category: TransactionCategory.ENTERTAINMENT, confidence: 95 },
      { name: 'DSTV', aliases: ['MULTICHOICE'], category: TransactionCategory.ENTERTAINMENT, confidence: 95 },
      { name: 'SHOWMAX', aliases: [], category: TransactionCategory.ENTERTAINMENT, confidence: 95 },

      // Utilities
      { name: 'ESKOM', aliases: ['ESKOM HOLDINGS'], category: TransactionCategory.UTILITIES, confidence: 95 },
      { name: 'CITY OF CAPE TOWN', aliases: ['COCT'], category: TransactionCategory.UTILITIES, confidence: 95 },
      { name: 'CITY OF JOHANNESBURG', aliases: ['COJ'], category: TransactionCategory.UTILITIES, confidence: 95 },
      { name: 'VODACOM', aliases: ['VDC'], category: TransactionCategory.UTILITIES, confidence: 90 },
      { name: 'MTN', aliases: ['MTN SA'], category: TransactionCategory.UTILITIES, confidence: 90 },
      { name: 'TELKOM', aliases: ['TELKOM SA'], category: TransactionCategory.UTILITIES, confidence: 90 },

      // Retail
      { name: 'GAME', aliases: ['GAME STORES'], category: TransactionCategory.SHOPPING, confidence: 90 },
      { name: 'MAKRO', aliases: [], category: TransactionCategory.SHOPPING, confidence: 90 },
      { name: 'BUILDERS WAREHOUSE', aliases: ['BUILDERS'], category: TransactionCategory.SHOPPING, confidence: 90 },
      { name: 'MR PRICE', aliases: ['MRP'], category: TransactionCategory.SHOPPING, confidence: 90 },
      { name: 'EDGARS', aliases: [], category: TransactionCategory.SHOPPING, confidence: 90 },
      { name: 'FOSCHINI', aliases: ['TFG'], category: TransactionCategory.SHOPPING, confidence: 90 },

      // Business/Software
      { name: '43V3R', aliases: ['43V3R BUSINESS', '43V3R CONSULTING'], category: TransactionCategory.BUSINESS_REVENUE, confidence: 100 },
      { name: 'PAYPAL', aliases: ['PAYPAL SA'], category: TransactionCategory.BUSINESS_REVENUE, confidence: 80 },
      { name: 'STRIPE', aliases: ['STRIPE PAYMENTS'], category: TransactionCategory.BUSINESS_REVENUE, confidence: 80 },
    ];

    this.logger.log(`Loaded ${this.southAfricanMerchants.length} South African merchants`);
  }

  /**
   * Initialize ML models (simplified implementation)
   */
  private async initializeMLModels(): Promise<void> {
    // In a production system, this would load trained ML models
    // For now, we'll use a simple keyword-based approach with learning
    this.logger.log('ML models initialized (simplified implementation)');
  }

  /**
   * Categorize by South African merchant lookup
   */
  private async categorizeBySouthAfricanMerchant(transaction: Transaction): Promise<CategorizationResult> {
    const description = transaction.description.toUpperCase();

    for (const merchant of this.southAfricanMerchants) {
      const allNames = [merchant.name, ...merchant.aliases];
      
      for (const name of allNames) {
        if (description.includes(name.toUpperCase())) {
          return {
            category: merchant.category,
            confidence: merchant.confidence,
            method: 'merchant_lookup',
            matchedRule: merchant.name,
          };
        }
      }
    }

    return {
      category: TransactionCategory.UNKNOWN,
      confidence: 0,
      method: 'merchant_lookup',
    };
  }

  /**
   * Categorize by rule-based matching
   */
  private async categorizeByRules(transaction: Transaction): Promise<CategorizationResult> {
    const description = transaction.description.toUpperCase();
    const amount = Math.abs(transaction.amount);

    // Sort rules by priority
    const sortedRules = [...this.categoryRules].sort((a, b) => a.priority - b.priority);

    for (const rule of sortedRules) {
      let matches = 0;
      let totalChecks = 0;

      // Check patterns
      if (rule.patterns.length > 0) {
        totalChecks++;
        for (const pattern of rule.patterns) {
          if (description.includes(pattern.toUpperCase())) {
            matches++;
            break;
          }
        }
      }

      // Check amount ranges
      if (rule.amountRanges) {
        totalChecks++;
        const { min, max } = rule.amountRanges;
        if ((!min || amount >= min) && (!max || amount <= max)) {
          matches++;
        }
      }

      // Check merchant category codes
      if (rule.merchantCategories.length > 0 && transaction.merchant?.mcc) {
        totalChecks++;
        if (rule.merchantCategories.includes(transaction.merchant.mcc)) {
          matches++;
        }
      }

      // Calculate confidence based on matches
      if (matches > 0 && totalChecks > 0) {
        const matchRatio = matches / totalChecks;
        const adjustedConfidence = rule.confidence * matchRatio;

        if (adjustedConfidence > 50) {
          return {
            category: rule.category,
            confidence: adjustedConfidence,
            method: 'rule_based',
            matchedRule: rule.id,
          };
        }
      }
    }

    return {
      category: TransactionCategory.UNKNOWN,
      confidence: 0,
      method: 'rule_based',
    };
  }

  /**
   * Categorize by keyword matching
   */
  private async categorizeByKeywords(transaction: Transaction): Promise<CategorizationResult> {
    const description = transaction.description.toLowerCase();
    const reference = transaction.reference.toLowerCase();
    const fullText = `${description} ${reference}`;

    for (const rule of this.categoryRules) {
      for (const keyword of rule.keywords) {
        if (fullText.includes(keyword.toLowerCase())) {
          return {
            category: rule.category,
            confidence: Math.max(60, rule.confidence * 0.7), // Reduced confidence for keyword matching
            method: 'keyword_match',
            matchedRule: rule.id,
          };
        }
      }
    }

    return {
      category: TransactionCategory.UNKNOWN,
      confidence: 0,
      method: 'keyword_match',
    };
  }

  /**
   * Categorize by transaction amount patterns
   */
  private async categorizeByAmount(transaction: Transaction): Promise<CategorizationResult> {
    const amount = Math.abs(transaction.amount);

    // Common amount patterns in South Africa
    if (amount >= 25000 && amount <= 50000 && transaction.type === 'credit') {
      return {
        category: TransactionCategory.SALARY,
        confidence: 60,
        method: 'ml_prediction',
      };
    }

    if (amount >= 5000 && amount <= 15000 && transaction.type === 'debit') {
      return {
        category: TransactionCategory.RENT_MORTGAGE,
        confidence: 50,
        method: 'ml_prediction',
      };
    }

    if (amount <= 100 && transaction.type === 'debit') {
      return {
        category: TransactionCategory.TRANSPORT_FUEL,
        confidence: 40,
        method: 'ml_prediction',
      };
    }

    return {
      category: TransactionCategory.UNKNOWN,
      confidence: 0,
      method: 'ml_prediction',
    };
  }

  /**
   * Update learning data for future improvements
   */
  private updateLearningData(description: string, category: TransactionCategory): void {
    const key = description.toLowerCase().trim();
    const existing = this.learningData.get(key);

    if (existing) {
      if (existing.category === category) {
        existing.frequency++;
      }
    } else {
      this.learningData.set(key, { category, frequency: 1 });
    }
  }

  /**
   * Get categorization suggestions for manual review
   */
  async getCategorySuggestions(transaction: Transaction): Promise<TransactionCategory[]> {
    try {
      const results: CategorizationResult[] = [
        await this.categorizeBySouthAfricanMerchant(transaction),
        await this.categorizeByRules(transaction),
        await this.categorizeByKeywords(transaction),
        await this.categorizeByAmount(transaction),
      ].filter(result => result.confidence > 30);

      // Sort by confidence and return unique categories
      const uniqueCategories = [...new Set(results.map(r => r.category))];
      return uniqueCategories.slice(0, 3); // Top 3 suggestions
    } catch (error) {
      this.logger.error('Failed to generate category suggestions:', error);
      return [TransactionCategory.UNKNOWN];
    }
  }

  /**
   * Learn from user corrections
   */
  async learnFromCorrection(transaction: Transaction, correctCategory: TransactionCategory): Promise<void> {
    try {
      // Store the correction for future learning
      this.updateLearningData(transaction.description, correctCategory);

      // Add to merchant database if it's a strong merchant match
      if (correctCategory !== TransactionCategory.UNKNOWN && transaction.merchant) {
        const existingMerchant = this.southAfricanMerchants.find(
          m => m.name.toUpperCase() === transaction.merchant!.name.toUpperCase()
        );

        if (!existingMerchant) {
          this.southAfricanMerchants.push({
            name: transaction.merchant.name.toUpperCase(),
            aliases: [],
            category: correctCategory,
            confidence: 85,
          });
        }
      }

      this.advancedLogger.logAutomation('Learning from user correction', {
        operation: 'categorization_learning',
        metadata: {
          transactionId: transaction.id,
          correctedCategory: correctCategory,
          description: transaction.description.substring(0, 50),
        },
      });
    } catch (error) {
      this.logger.error('Failed to learn from correction:', error);
    }
  }

  /**
   * Get categorization statistics
   */
  getCategorizationStats(): {
    totalRules: number;
    totalMerchants: number;
    learningDataSize: number;
    topCategories: { category: TransactionCategory; count: number }[];
  } {
    const categoryCount = new Map<TransactionCategory, number>();
    
    for (const { category, frequency } of this.learningData.values()) {
      const current = categoryCount.get(category) || 0;
      categoryCount.set(category, current + frequency);
    }

    const topCategories = Array.from(categoryCount.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalRules: this.categoryRules.length,
      totalMerchants: this.southAfricanMerchants.length,
      learningDataSize: this.learningData.size,
      topCategories,
    };
  }

  /**
   * Export learned data for model training
   */
  exportLearningData(): Array<{ description: string; category: TransactionCategory; frequency: number }> {
    return Array.from(this.learningData.entries()).map(([description, data]) => ({
      description,
      category: data.category,
      frequency: data.frequency,
    }));
  }
}