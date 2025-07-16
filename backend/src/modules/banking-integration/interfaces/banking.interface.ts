export interface BankAccount {
  id: string;
  accountNumber: string;
  accountType: 'savings' | 'current' | 'credit' | 'investment' | 'loan';
  bankId: string;
  bankName: string;
  branchCode?: string;
  accountName: string;
  currency: string;
  balance: number;
  availableBalance: number;
  overdraftLimit?: number;
  interestRate?: number;
  fees: AccountFees;
  isActive: boolean;
  lastSyncAt: Date;
  metadata: {
    productType: string;
    accountOpenDate: Date;
    lastTransactionDate?: Date;
    monthlyLimit?: number;
    dailyLimit?: number;
  };
}

export interface AccountFees {
  monthlyFee: number;
  transactionFees: {
    eft: number;
    debitOrder: number;
    cashWithdrawal: number;
    cardPurchase: number;
    onlinePurchase: number;
  };
  overdraftFee?: number;
  internationalFee?: number;
}

export interface Transaction {
  id: string;
  accountId: string;
  externalId: string;
  type: 'debit' | 'credit';
  amount: number;
  currency: string;
  description: string;
  reference: string;
  category: TransactionCategory;
  subcategory?: string;
  date: Date;
  valueDate: Date;
  balance: number;
  location?: TransactionLocation;
  merchant?: MerchantInfo;
  paymentMethod: 'card' | 'eft' | 'debit_order' | 'cash' | 'cheque' | 'mobile' | 'online';
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  tags: string[];
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  fraudScore?: number;
  isReviewed: boolean;
  goalImpact?: {
    goalId: string;
    impactType: 'positive' | 'negative' | 'neutral';
    amount: number;
  };
  metadata: {
    importedAt: Date;
    lastUpdated: Date;
    confidence: number;
    enrichmentVersion: string;
  };
}

export interface TransactionLocation {
  city: string;
  province: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface MerchantInfo {
  name: string;
  category: string;
  mcc?: string; // Merchant Category Code
  website?: string;
  phone?: string;
}

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  interval: number;
  nextExpectedDate: Date;
  averageAmount: number;
  variance: number;
  confidence: number;
}

export enum TransactionCategory {
  // Income
  SALARY = 'salary',
  FREELANCE = 'freelance',
  INVESTMENT_RETURN = 'investment_return',
  RENTAL_INCOME = 'rental_income',
  BUSINESS_INCOME = 'business_income',
  OTHER_INCOME = 'other_income',
  
  // Essential Expenses
  RENT_MORTGAGE = 'rent_mortgage',
  UTILITIES = 'utilities',
  GROCERIES = 'groceries',
  INSURANCE = 'insurance',
  LOAN_PAYMENT = 'loan_payment',
  MEDICAL = 'medical',
  TRANSPORT_FUEL = 'transport_fuel',
  
  // Lifestyle
  DINING = 'dining',
  ENTERTAINMENT = 'entertainment',
  SHOPPING = 'shopping',
  SUBSCRIPTIONS = 'subscriptions',
  FITNESS = 'fitness',
  TRAVEL = 'travel',
  PERSONAL_CARE = 'personal_care',
  
  // Financial
  SAVINGS = 'savings',
  INVESTMENTS = 'investments',
  DEBT_PAYMENT = 'debt_payment',
  TAX_PAYMENT = 'tax_payment',
  FEES_CHARGES = 'fees_charges',
  
  // Business (43V3R)
  BUSINESS_EXPENSE = 'business_expense',
  BUSINESS_REVENUE = 'business_revenue',
  MARKETING = 'marketing',
  SOFTWARE_TOOLS = 'software_tools',
  OFFICE_SUPPLIES = 'office_supplies',
  
  // Other
  TRANSFER = 'transfer',
  CASH_WITHDRAWAL = 'cash_withdrawal',
  UNKNOWN = 'unknown'
}

export interface BankingProvider {
  id: string;
  name: string;
  type: 'traditional' | 'aggregator' | 'fintech';
  country: string;
  supportedBanks: string[];
  capabilities: {
    accountData: boolean;
    transactionHistory: boolean;
    realTimeNotifications: boolean;
    paymentInitiation: boolean;
    balanceCheck: boolean;
  };
  authentication: {
    type: 'oauth2' | 'api_key' | 'certificate';
    scopes: string[];
    sandbox: boolean;
  };
  limits: {
    requestsPerMinute: number;
    requestsPerDay: number;
    historyDays: number;
  };
  fees: {
    setupFee: number;
    monthlyFee: number;
    perTransactionFee: number;
  };
}

export interface BankConnection {
  id: string;
  userId: string;
  providerId: string;
  bankId: string;
  status: 'active' | 'inactive' | 'error' | 'reauth_required';
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  lastSyncAt?: Date;
  errorMessage?: string;
  consentId?: string;
  consentExpiresAt?: Date;
  accounts: string[]; // Account IDs
  metadata: {
    connectedAt: Date;
    lastActiveAt: Date;
    syncFrequency: 'real_time' | 'hourly' | 'daily';
    autoSync: boolean;
  };
}

export interface TransactionSyncResult {
  success: boolean;
  accountId: string;
  newTransactions: number;
  updatedTransactions: number;
  duplicateTransactions: number;
  errorCount: number;
  errors: string[];
  syncedPeriod: {
    from: Date;
    to: Date;
  };
  nextSyncAt?: Date;
}

export interface FraudAlert {
  id: string;
  transactionId: string;
  accountId: string;
  type: 'unusual_amount' | 'unusual_location' | 'unusual_time' | 'unusual_merchant' | 'velocity_check' | 'duplicate_transaction';
  severity: 'low' | 'medium' | 'high' | 'critical';
  score: number; // 0-100
  description: string;
  triggers: string[];
  createdAt: Date;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: string;
  notificationSent: boolean;
  actions: {
    accountBlocked: boolean;
    cardBlocked: boolean;
    notificationSent: boolean;
    manualReviewRequired: boolean;
  };
}

export interface BankingInsight {
  id: string;
  userId: string;
  type: 'spending_pattern' | 'income_trend' | 'savings_opportunity' | 'budget_variance' | 'goal_progress' | 'fee_optimization';
  title: string;
  description: string;
  category: string;
  impact: {
    amount: number;
    percentage: number;
    timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly';
  };
  confidence: number;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  suggestedActions: string[];
  dataPoints: {
    period: string;
    value: number;
    comparison?: number;
  }[];
  createdAt: Date;
  expiresAt?: Date;
  isRead: boolean;
  isActioned: boolean;
}

export interface BudgetTracker {
  id: string;
  userId: string;
  name: string;
  category: TransactionCategory;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  endDate: Date;
  warningThreshold: number; // percentage
  isActive: boolean;
  notifications: {
    warningEnabled: boolean;
    exceededEnabled: boolean;
    weeklyDigest: boolean;
  };
  history: {
    period: string;
    budgeted: number;
    spent: number;
    variance: number;
  }[];
}

export interface SouthAfricanBankInfo {
  bankId: string;
  name: string;
  shortName: string;
  universalBranchCode: string;
  swiftCode: string;
  logo: string;
  website: string;
  supportLevel: 'full' | 'limited' | 'planned';
  apiEndpoint?: string;
  features: {
    openBanking: boolean;
    instantPayments: boolean;
    sameDay: boolean;
    internationalTransfers: boolean;
  };
  fees: {
    monthlyAdmin: number;
    eftFee: number;
    debitOrderFee: number;
    cardFee: number;
  };
}

export interface PaymentInstruction {
  id: string;
  fromAccountId: string;
  toAccount: {
    accountNumber: string;
    branchCode: string;
    accountName: string;
    bankId: string;
    reference: string;
  };
  amount: number;
  currency: string;
  paymentType: 'immediate' | 'future_dated' | 'recurring';
  scheduledDate?: Date;
  recurringSchedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: Date;
    maxExecutions?: number;
  };
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  executedAt?: Date;
  failureReason?: string;
  beneficiaryVerified: boolean;
  requiresOTP: boolean;
  fees: number;
}

export interface BankingDashboard {
  totalBalance: number;
  totalAvailableBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netWorthChange: number;
  savingsRate: number;
  topExpenseCategories: {
    category: TransactionCategory;
    amount: number;
    percentage: number;
    change: number;
  }[];
  upcomingPayments: PaymentInstruction[];
  recentTransactions: Transaction[];
  budgetSummary: {
    totalBudget: number;
    totalSpent: number;
    remainingBudget: number;
    categoriesOverBudget: number;
  };
  goalProgress: {
    goalId: string;
    goalName: string;
    targetAmount: number;
    currentAmount: number;
    progressPercentage: number;
    monthlyContribution: number;
  }[];
  alerts: {
    fraudAlerts: number;
    budgetWarnings: number;
    paymentDue: number;
    lowBalance: number;
  };
  insights: BankingInsight[];
}