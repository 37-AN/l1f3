export interface SystemMetrics {
  timestamp: Date;
  system: {
    uptime: number;
    cpuUsage: number;
    memoryUsage: {
      used: number;
      total: number;
      percentage: number;
    };
    diskUsage: {
      used: number;
      total: number;
      percentage: number;
    };
  };
  application: {
    activeConnections: number;
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
  };
  database: {
    connections: number;
    queryTime: number;
    cacheHitRate: number;
  };
}

export interface FinancialSnapshot {
  timestamp: Date;
  currentNetWorth: number;
  targetNetWorth: number;
  netWorthProgress: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  businessRevenue: {
    daily: number;
    monthly: number;
    target: number;
    progress: number;
  };
  goals: FinancialGoal[];
}

export interface FinancialGoal {
  id: string;
  name: string;
  type: 'net_worth' | 'revenue' | 'savings' | 'debt_reduction' | 'investment';
  targetAmount: number;
  currentAmount: number;
  progress: number;
  targetDate: Date;
  onTrack: boolean;
  projectedCompletion: Date;
  velocity: number; // Rate of progress per day
}

export interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'security' | 'financial';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  source: string;
  timestamp: Date;
  isRead: boolean;
  isResolved: boolean;
  actions?: AlertAction[];
  metadata?: Record<string, any>;
}

export interface AlertAction {
  id: string;
  label: string;
  type: 'button' | 'link' | 'form';
  action: string;
  payload?: Record<string, any>;
}

export interface MCPIntegrationStatus {
  id: string;
  name: string;
  type: 'financial' | 'ai' | 'communication' | 'storage' | 'analytics';
  status: 'online' | 'offline' | 'error' | 'warning';
  lastSync: Date;
  syncFrequency: number; // minutes
  dataPoints: number;
  errorCount: number;
  performance: {
    avgResponseTime: number;
    successRate: number;
    throughput: number;
  };
  nextSync: Date;
}

export interface BankingStatus {
  totalConnections: number;
  activeConnections: number;
  failedConnections: number;
  totalAccounts: number;
  totalBalance: number;
  lastSync: Date;
  transactionsToday: number;
  fraudAlertsActive: number;
  categorizedTransactions: number;
  uncategorizedTransactions: number;
  banks: BankConnectionStatus[];
}

export interface BankConnectionStatus {
  bankId: string;
  bankName: string;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  accounts: number;
  lastSync: Date;
  syncStatus: 'success' | 'failed' | 'in_progress';
  errorMessage?: string;
}

export interface AIAutomationStatus {
  totalRules: number;
  activeRules: number;
  rulesExecutedToday: number;
  successRate: number;
  automationsSaved: number; // Time saved in minutes
  goalTrackingActive: boolean;
  predictiveModelsActive: number;
  recommendations: {
    pending: number;
    implemented: number;
    ignored: number;
  };
}

export interface SecurityMetrics {
  timestamp: Date;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  activeThreats: number;
  blockedRequests: number;
  fraudDetections: number;
  loginAttempts: {
    successful: number;
    failed: number;
    blocked: number;
  };
  dataEncryption: {
    status: 'active' | 'inactive';
    algorithm: string;
    keyRotationDue: Date;
  };
  auditEvents: number;
}

export interface ControlBoardDashboard {
  timestamp: Date;
  systemMetrics: SystemMetrics;
  financialSnapshot: FinancialSnapshot;
  alerts: SystemAlert[];
  mcpIntegrations: MCPIntegrationStatus[];
  bankingStatus: BankingStatus;
  aiAutomationStatus: AIAutomationStatus;
  securityMetrics: SecurityMetrics;
  performance: {
    goalsOnTrack: number;
    totalGoals: number;
    systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
    automationEfficiency: number; // Percentage
    costOptimization: number; // Amount saved
  };
}

export interface ControlAction {
  id: string;
  type: 'system' | 'financial' | 'integration' | 'automation' | 'security';
  action: string;
  parameters?: Record<string, any>;
  requiresConfirmation: boolean;
  estimatedImpact?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: ControlAction;
  enabled: boolean;
  description: string;
}

export interface SystemCommand {
  command: string;
  description: string;
  parameters?: {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'select';
    required: boolean;
    options?: string[];
  }[];
  permission: 'user' | 'admin' | 'system';
}