import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdvancedLoggerService } from '../../../common/logger/advanced-logger.service';
import {
  BankAccount,
  Transaction,
  BankConnection,
  TransactionCategory,
  AccountFees,
} from '../interfaces/banking.interface';

interface NedBankConfig {
  clientId: string;
  clientSecret: string;
  apiBaseUrl: string;
  sandboxMode: boolean;
  redirectUri: string;
}

interface NedBankTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface NedBankAccountResponse {
  Data: {
    Account: Array<{
      AccountId: string;
      Currency: string;
      AccountType: string;
      AccountSubType: string;
      Nickname: string;
      Account: Array<{
        SchemeName: string;
        Identification: string;
        Name: string;
      }>;
    }>;
  };
}

interface NedBankBalanceResponse {
  Data: {
    Balance: Array<{
      AccountId: string;
      Amount: {
        Amount: string;
        Currency: string;
      };
      CreditDebitIndicator: 'Credit' | 'Debit';
      Type: 'ClosingAvailable' | 'ClosingBooked' | 'Expected' | 'ForwardAvailable';
      DateTime: string;
    }>;
  };
}

interface NedBankTransactionResponse {
  Data: {
    Transaction: Array<{
      AccountId: string;
      TransactionId: string;
      TransactionReference: string;
      Amount: {
        Amount: string;
        Currency: string;
      };
      CreditDebitIndicator: 'Credit' | 'Debit';
      Status: 'Booked' | 'Pending';
      BookingDateTime: string;
      ValueDateTime: string;
      TransactionInformation: string;
      BankTransactionCode: {
        Code: string;
        SubCode: string;
      };
      ProprietaryBankTransactionCode: {
        Code: string;
        Issuer: string;
      };
      MerchantDetails?: {
        MerchantName: string;
        MerchantCategoryCode: string;
      };
    }>;
  };
}

@Injectable()
export class NedBankService {
  private readonly logger = new Logger(NedBankService.name);
  private config: NedBankConfig;
  private accessTokens = new Map<string, { token: string; expiresAt: Date }>();

  constructor(
    private readonly configService: ConfigService,
    private readonly advancedLogger: AdvancedLoggerService,
  ) {
    this.loadConfiguration();
  }

  private loadConfiguration(): void {
    this.config = {
      clientId: this.configService.get('NEDBANK_CLIENT_ID', 'sandbox_client_id'),
      clientSecret: this.configService.get('NEDBANK_CLIENT_SECRET', 'sandbox_client_secret'),
      apiBaseUrl: this.configService.get('NEDBANK_API_BASE_URL', 'https://api.nedbank.co.za/apimarket/sandbox'),
      sandboxMode: this.configService.get('NEDBANK_SANDBOX_MODE', 'true') === 'true',
      redirectUri: this.configService.get('NEDBANK_REDIRECT_URI', 'http://localhost:3000/auth/nedbank/callback'),
    };
  }

  async initialize(): Promise<void> {
    this.logger.log('Initializing Nedbank integration');
    
    if (this.config.sandboxMode) {
      this.logger.warn('Nedbank integration running in SANDBOX mode');
    }

    this.advancedLogger.logFinancial('Nedbank service initialized', {
      operation: 'nedbank_initialization',
      metadata: {
        sandboxMode: this.config.sandboxMode,
        apiBaseUrl: this.config.apiBaseUrl,
      },
    });
  }

  /**
   * Initiate OAuth2 connection to Nedbank
   */
  async connect(userId: string): Promise<BankConnection> {
    try {
      this.advancedLogger.logFinancial(`Initiating Nedbank connection for user: ${userId}`, {
        operation: 'nedbank_connection_start',
        userId,
      });

      // In sandbox mode, simulate successful connection
      if (this.config.sandboxMode) {
        return this.createSandboxConnection(userId);
      }

      // Generate OAuth2 authorization URL
      const authUrl = this.generateAuthUrl(userId);
      
      throw new Error(`Please complete OAuth2 flow: ${authUrl}`);
    } catch (error) {
      this.advancedLogger.error('Nedbank connection failed', error, {
        operation: 'nedbank_connection_error',
        userId,
      });
      throw error;
    }
  }

  /**
   * Create sandbox connection for testing
   */
  private createSandboxConnection(userId: string): BankConnection {
    const connectionId = `nedbank_${userId}_${Date.now()}`;
    const connection: BankConnection = {
      id: connectionId,
      userId,
      providerId: 'nedbank',
      bankId: 'nedbank',
      status: 'active',
      accessToken: 'sandbox_access_token',
      refreshToken: 'sandbox_refresh_token',
      tokenExpiresAt: new Date(Date.now() + 3600000), // 1 hour
      accounts: [`nedbank_acc_${userId}_1`, `nedbank_acc_${userId}_2`],
      metadata: {
        connectedAt: new Date(),
        lastActiveAt: new Date(),
        syncFrequency: 'hourly',
        autoSync: true,
      },
    };

    // Store access token
    this.accessTokens.set(connectionId, {
      token: 'sandbox_access_token',
      expiresAt: new Date(Date.now() + 3600000),
    });

    this.logger.log(`Sandbox Nedbank connection created: ${connectionId}`);
    return connection;
  }

  /**
   * Generate OAuth2 authorization URL
   */
  private generateAuthUrl(userId: string): string {
    const state = Buffer.from(JSON.stringify({ userId, provider: 'nedbank' })).toString('base64');
    const scopes = 'accounts transactions balances payments';
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: scopes,
      state,
    });

    return `${this.config.apiBaseUrl}/oauth2/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, state: string): Promise<BankConnection> {
    try {
      const { userId } = JSON.parse(Buffer.from(state, 'base64').toString());

      const response = await fetch(`${this.config.apiBaseUrl}/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.config.redirectUri,
        }),
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.status}`);
      }

      const tokenData: NedBankTokenResponse = await response.json();

      const connectionId = `nedbank_${userId}_${Date.now()}`;
      const connection: BankConnection = {
        id: connectionId,
        userId,
        providerId: 'nedbank',
        bankId: 'nedbank',
        status: 'active',
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        accounts: [], // Will be populated after fetching accounts
        metadata: {
          connectedAt: new Date(),
          lastActiveAt: new Date(),
          syncFrequency: 'hourly',
          autoSync: true,
        },
      };

      // Store access token
      this.accessTokens.set(connectionId, {
        token: tokenData.access_token,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      });

      this.advancedLogger.logFinancial(`Nedbank token exchange successful: ${connectionId}`, {
        operation: 'nedbank_token_exchange',
        userId,
        metadata: { connectionId },
      });

      return connection;
    } catch (error) {
      this.advancedLogger.error('Nedbank token exchange failed', error, {
        operation: 'nedbank_token_exchange_error',
      });
      throw error;
    }
  }

  /**
   * Get accounts from Nedbank API
   */
  async getAccounts(connection: BankConnection): Promise<BankAccount[]> {
    try {
      if (this.config.sandboxMode) {
        return this.getSandboxAccounts(connection);
      }

      const accessToken = await this.getValidAccessToken(connection.id);
      const response = await fetch(`${this.config.apiBaseUrl}/open-banking/v3.1/aisp/accounts`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'x-fapi-financial-id': 'nedbank',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch accounts: ${response.status}`);
      }

      const accountData: NedBankAccountResponse = await response.json();
      const accounts: BankAccount[] = [];

      for (const accountInfo of accountData.Data.Account) {
        // Get balance for each account
        const balanceResponse = await fetch(`${this.config.apiBaseUrl}/open-banking/v3.1/aisp/accounts/${accountInfo.AccountId}/balances`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'x-fapi-financial-id': 'nedbank',
            'Accept': 'application/json',
          },
        });

        let balance = 0;
        let availableBalance = 0;

        if (balanceResponse.ok) {
          const balanceData: NedBankBalanceResponse = await balanceResponse.json();
          const closingBalance = balanceData.Data.Balance.find(b => b.Type === 'ClosingBooked');
          const availBalance = balanceData.Data.Balance.find(b => b.Type === 'ClosingAvailable');

          if (closingBalance) {
            balance = parseFloat(closingBalance.Amount.Amount);
            if (closingBalance.CreditDebitIndicator === 'Debit') {
              balance = -balance;
            }
          }

          if (availBalance) {
            availableBalance = parseFloat(availBalance.Amount.Amount);
            if (availBalance.CreditDebitIndicator === 'Debit') {
              availableBalance = -availableBalance;
            }
          }
        }

        const account: BankAccount = {
          id: accountInfo.AccountId,
          accountNumber: accountInfo.Account[0]?.Identification || accountInfo.AccountId,
          accountType: this.mapAccountType(accountInfo.AccountSubType),
          bankId: 'nedbank',
          bankName: 'Nedbank',
          branchCode: '198765',
          accountName: accountInfo.Nickname || accountInfo.Account[0]?.Name || 'Nedbank Account',
          currency: accountInfo.Currency,
          balance,
          availableBalance,
          fees: this.getNedBankFees(accountInfo.AccountSubType),
          isActive: true,
          lastSyncAt: new Date(),
          metadata: {
            productType: accountInfo.AccountSubType,
            accountOpenDate: new Date(), // Would need to be fetched from account details
            monthlyLimit: 50000,
            dailyLimit: 10000,
          },
        };

        accounts.push(account);
      }

      this.advancedLogger.logFinancial(`Retrieved ${accounts.length} Nedbank accounts`, {
        operation: 'nedbank_accounts_retrieved',
        metadata: { connectionId: connection.id, accountCount: accounts.length },
      });

      return accounts;
    } catch (error) {
      this.advancedLogger.error('Failed to retrieve Nedbank accounts', error, {
        operation: 'nedbank_accounts_error',
        metadata: { connectionId: connection.id },
      });
      throw error;
    }
  }

  /**
   * Get transactions from Nedbank API
   */
  async getTransactions(connection: BankConnection): Promise<{ [accountId: string]: Transaction[] }> {
    try {
      if (this.config.sandboxMode) {
        return this.getSandboxTransactions(connection);
      }

      const accessToken = await this.getValidAccessToken(connection.id);
      const transactions: { [accountId: string]: Transaction[] } = {};

      for (const accountId of connection.accounts) {
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 30); // Last 30 days

        const params = new URLSearchParams({
          fromBookingDateTime: fromDate.toISOString(),
          toBookingDateTime: new Date().toISOString(),
        });

        const response = await fetch(`${this.config.apiBaseUrl}/open-banking/v3.1/aisp/accounts/${accountId}/transactions?${params}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'x-fapi-financial-id': 'nedbank',
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          this.logger.warn(`Failed to fetch transactions for account ${accountId}: ${response.status}`);
          continue;
        }

        const transactionData: NedBankTransactionResponse = await response.json();
        const accountTransactions: Transaction[] = [];

        for (const txn of transactionData.Data.Transaction) {
          const transaction: Transaction = {
            id: `nedbank_${txn.TransactionId}`,
            accountId,
            externalId: txn.TransactionId,
            type: txn.CreditDebitIndicator === 'Credit' ? 'credit' : 'debit',
            amount: parseFloat(txn.Amount.Amount),
            currency: txn.Amount.Currency,
            description: txn.TransactionInformation,
            reference: txn.TransactionReference,
            category: this.mapTransactionCategory(txn),
            date: new Date(txn.BookingDateTime),
            valueDate: new Date(txn.ValueDateTime),
            balance: 0, // Would need to be calculated
            merchant: txn.MerchantDetails ? {
              name: txn.MerchantDetails.MerchantName,
              category: txn.MerchantDetails.MerchantCategoryCode,
              mcc: txn.MerchantDetails.MerchantCategoryCode,
            } : undefined,
            paymentMethod: this.mapPaymentMethod(txn.BankTransactionCode.Code),
            status: txn.Status === 'Booked' ? 'completed' : 'pending',
            tags: [],
            isRecurring: false,
            isReviewed: false,
            metadata: {
              importedAt: new Date(),
              lastUpdated: new Date(),
              confidence: 100,
              enrichmentVersion: '1.0',
            },
          };

          accountTransactions.push(transaction);
        }

        transactions[accountId] = accountTransactions;
      }

      const totalTransactions = Object.values(transactions).reduce((sum, txns) => sum + txns.length, 0);
      this.advancedLogger.logFinancial(`Retrieved ${totalTransactions} Nedbank transactions`, {
        operation: 'nedbank_transactions_retrieved',
        metadata: { 
          connectionId: connection.id, 
          accountCount: connection.accounts.length,
          totalTransactions,
        },
      });

      return transactions;
    } catch (error) {
      this.advancedLogger.error('Failed to retrieve Nedbank transactions', error, {
        operation: 'nedbank_transactions_error',
        metadata: { connectionId: connection.id },
      });
      throw error;
    }
  }

  /**
   * Get sandbox accounts for testing
   */
  private getSandboxAccounts(connection: BankConnection): BankAccount[] {
    return [
      {
        id: `nedbank_acc_${connection.userId}_1`,
        accountNumber: '1234567890',
        accountType: 'current',
        bankId: 'nedbank',
        bankName: 'Nedbank',
        branchCode: '198765',
        accountName: 'Nedbank Current Account',
        currency: 'ZAR',
        balance: 25000.00,
        availableBalance: 23500.00,
        overdraftLimit: 5000.00,
        interestRate: 0.0275,
        fees: {
          monthlyFee: 95.00,
          transactionFees: {
            eft: 7.50,
            debitOrder: 5.00,
            cashWithdrawal: 8.50,
            cardPurchase: 2.50,
            onlinePurchase: 1.50,
          },
          overdraftFee: 15.75,
        },
        isActive: true,
        lastSyncAt: new Date(),
        metadata: {
          productType: 'Current Account',
          accountOpenDate: new Date('2020-01-15'),
          lastTransactionDate: new Date(),
          monthlyLimit: 50000,
          dailyLimit: 10000,
        },
      },
      {
        id: `nedbank_acc_${connection.userId}_2`,
        accountNumber: '1234567891',
        accountType: 'savings',
        bankId: 'nedbank',
        bankName: 'Nedbank',
        branchCode: '198765',
        accountName: 'Nedbank Savings Account',
        currency: 'ZAR',
        balance: 175000.00,
        availableBalance: 175000.00,
        interestRate: 0.0425,
        fees: {
          monthlyFee: 25.00,
          transactionFees: {
            eft: 7.50,
            debitOrder: 5.00,
            cashWithdrawal: 8.50,
            cardPurchase: 2.50,
            onlinePurchase: 1.50,
          },
        },
        isActive: true,
        lastSyncAt: new Date(),
        metadata: {
          productType: 'Savings Account',
          accountOpenDate: new Date('2020-01-15'),
          lastTransactionDate: new Date(),
          monthlyLimit: 25000,
          dailyLimit: 5000,
        },
      },
    ];
  }

  /**
   * Get sandbox transactions for testing
   */
  private getSandboxTransactions(connection: BankConnection): { [accountId: string]: Transaction[] } {
    const transactions: { [accountId: string]: Transaction[] } = {};
    
    // Generate sample transactions for each account
    for (let i = 0; i < connection.accounts.length; i++) {
      const accountId = connection.accounts[i];
      const accountTransactions: Transaction[] = [];

      // Generate 30 days of sample transactions
      for (let day = 0; day < 30; day++) {
        const transactionDate = new Date();
        transactionDate.setDate(transactionDate.getDate() - day);

        // Salary transaction on the 25th of each month
        if (transactionDate.getDate() === 25 && i === 0) {
          accountTransactions.push({
            id: `nedbank_txn_salary_${day}`,
            accountId,
            externalId: `SAL${transactionDate.getTime()}`,
            type: 'credit',
            amount: 35000.00,
            currency: 'ZAR',
            description: 'SALARY PAYMENT - EMPLOYER NAME',
            reference: 'SAL001',
            category: TransactionCategory.SALARY,
            date: transactionDate,
            valueDate: transactionDate,
            balance: 25000 + 35000,
            paymentMethod: 'eft',
            status: 'completed',
            tags: ['income', 'salary'],
            isRecurring: true,
            recurringPattern: {
              frequency: 'monthly',
              interval: 1,
              nextExpectedDate: new Date(transactionDate.getFullYear(), transactionDate.getMonth() + 1, 25),
              averageAmount: 35000,
              variance: 0,
              confidence: 95,
            },
            isReviewed: true,
            metadata: {
              importedAt: new Date(),
              lastUpdated: new Date(),
              confidence: 100,
              enrichmentVersion: '1.0',
            },
          });
        }

        // Random daily transactions
        if (Math.random() > 0.3) { // 70% chance of transaction per day
          const isExpense = Math.random() > 0.2; // 80% expenses, 20% income
          const categories = isExpense 
            ? [TransactionCategory.GROCERIES, TransactionCategory.DINING, TransactionCategory.TRANSPORT_FUEL, TransactionCategory.ENTERTAINMENT]
            : [TransactionCategory.FREELANCE, TransactionCategory.OTHER_INCOME];
          
          const category = categories[Math.floor(Math.random() * categories.length)];
          const amount = isExpense 
            ? Math.random() * 500 + 50  // R50 - R550 for expenses
            : Math.random() * 2000 + 100; // R100 - R2100 for income

          accountTransactions.push({
            id: `nedbank_txn_${day}_${Math.random()}`,
            accountId,
            externalId: `TXN${transactionDate.getTime()}${Math.floor(Math.random() * 1000)}`,
            type: isExpense ? 'debit' : 'credit',
            amount: Math.round(amount * 100) / 100,
            currency: 'ZAR',
            description: this.getTransactionDescription(category),
            reference: `REF${Math.floor(Math.random() * 100000)}`,
            category,
            date: transactionDate,
            valueDate: transactionDate,
            balance: 25000, // Simplified
            paymentMethod: Math.random() > 0.5 ? 'card' : 'eft',
            status: 'completed',
            tags: [],
            isRecurring: false,
            isReviewed: false,
            metadata: {
              importedAt: new Date(),
              lastUpdated: new Date(),
              confidence: 95,
              enrichmentVersion: '1.0',
            },
          });
        }
      }

      transactions[accountId] = accountTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    return transactions;
  }

  /**
   * Helper methods
   */
  private async getValidAccessToken(connectionId: string): Promise<string> {
    const tokenInfo = this.accessTokens.get(connectionId);
    if (!tokenInfo) {
      throw new Error('No access token found for connection');
    }

    if (tokenInfo.expiresAt <= new Date()) {
      // Token expired, need to refresh
      throw new Error('Access token expired, refresh required');
    }

    return tokenInfo.token;
  }

  private mapAccountType(accountSubType: string): 'savings' | 'current' | 'credit' | 'investment' | 'loan' {
    switch (accountSubType.toLowerCase()) {
      case 'savings':
      case 'savings account':
        return 'savings';
      case 'current':
      case 'current account':
      case 'cheque':
        return 'current';
      case 'credit card':
      case 'credit':
        return 'credit';
      case 'investment':
      case 'fixed deposit':
        return 'investment';
      case 'loan':
      case 'home loan':
      case 'personal loan':
        return 'loan';
      default:
        return 'current';
    }
  }

  private getNedBankFees(accountType: string): AccountFees {
    // Standard Nedbank fees (simplified)
    return {
      monthlyFee: accountType.toLowerCase().includes('savings') ? 25.00 : 95.00,
      transactionFees: {
        eft: 7.50,
        debitOrder: 5.00,
        cashWithdrawal: 8.50,
        cardPurchase: 2.50,
        onlinePurchase: 1.50,
      },
      overdraftFee: 15.75,
      internationalFee: 2.95,
    };
  }

  private mapTransactionCategory(txn: any): TransactionCategory {
    const description = txn.TransactionInformation.toLowerCase();
    const code = txn.BankTransactionCode.Code;

    if (description.includes('salary') || description.includes('wage')) {
      return TransactionCategory.SALARY;
    }
    if (description.includes('groceries') || description.includes('supermarket')) {
      return TransactionCategory.GROCERIES;
    }
    if (description.includes('fuel') || description.includes('petrol')) {
      return TransactionCategory.TRANSPORT_FUEL;
    }
    if (description.includes('restaurant') || description.includes('dining')) {
      return TransactionCategory.DINING;
    }
    if (description.includes('transfer')) {
      return TransactionCategory.TRANSFER;
    }
    if (description.includes('cash') || description.includes('atm')) {
      return TransactionCategory.CASH_WITHDRAWAL;
    }

    return TransactionCategory.UNKNOWN;
  }

  private mapPaymentMethod(code: string): 'card' | 'eft' | 'debit_order' | 'cash' | 'cheque' | 'mobile' | 'online' {
    switch (code.toLowerCase()) {
      case 'ddt':
      case 'debit_order':
        return 'debit_order';
      case 'eft':
      case 'electronic_transfer':
        return 'eft';
      case 'pos':
      case 'card_payment':
        return 'card';
      case 'atm':
      case 'cash_withdrawal':
        return 'cash';
      case 'online':
      case 'internet_banking':
        return 'online';
      case 'mobile':
      case 'mobile_banking':
        return 'mobile';
      default:
        return 'eft';
    }
  }

  private getTransactionDescription(category: TransactionCategory): string {
    const descriptions = {
      [TransactionCategory.GROCERIES]: ['CHECKERS HYPER', 'PICK N PAY', 'WOOLWORTHS', 'SPAR', 'SHOPRITE'],
      [TransactionCategory.DINING]: ['MCDONALDS', 'KFC', 'NANDOS', 'STEERS', 'WIMPY'],
      [TransactionCategory.TRANSPORT_FUEL]: ['SHELL', 'BP', 'SASOL', 'ENGEN', 'TOTAL'],
      [TransactionCategory.ENTERTAINMENT]: ['STER KINEKOR', 'NU METRO', 'SPOTIFY', 'NETFLIX', 'DSTV'],
      [TransactionCategory.FREELANCE]: ['FREELANCE PROJECT', 'CONSULTING FEE', 'DESIGN WORK'],
      [TransactionCategory.OTHER_INCOME]: ['INVESTMENT RETURN', 'BONUS PAYMENT', 'REFUND'],
    };

    const categoryDescriptions = descriptions[category] || ['TRANSACTION'];
    return categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
  }
}