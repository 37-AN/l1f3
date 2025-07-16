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
var NedBankService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NedBankService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const advanced_logger_service_1 = require("../../../common/logger/advanced-logger.service");
const banking_interface_1 = require("../interfaces/banking.interface");
let NedBankService = NedBankService_1 = class NedBankService {
    constructor(configService, advancedLogger) {
        this.configService = configService;
        this.advancedLogger = advancedLogger;
        this.logger = new common_1.Logger(NedBankService_1.name);
        this.accessTokens = new Map();
        this.loadConfiguration();
    }
    loadConfiguration() {
        this.config = {
            clientId: this.configService.get('NEDBANK_CLIENT_ID', 'sandbox_client_id'),
            clientSecret: this.configService.get('NEDBANK_CLIENT_SECRET', 'sandbox_client_secret'),
            apiBaseUrl: this.configService.get('NEDBANK_API_BASE_URL', 'https://api.nedbank.co.za/apimarket/sandbox'),
            sandboxMode: this.configService.get('NEDBANK_SANDBOX_MODE', 'true') === 'true',
            redirectUri: this.configService.get('NEDBANK_REDIRECT_URI', 'http://localhost:3000/auth/nedbank/callback'),
        };
    }
    async initialize() {
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
    async connect(userId) {
        try {
            this.advancedLogger.logFinancial(`Initiating Nedbank connection for user: ${userId}`, {
                operation: 'nedbank_connection_start',
                userId,
            });
            if (this.config.sandboxMode) {
                return this.createSandboxConnection(userId);
            }
            const authUrl = this.generateAuthUrl(userId);
            throw new Error(`Please complete OAuth2 flow: ${authUrl}`);
        }
        catch (error) {
            this.advancedLogger.error('Nedbank connection failed', error, {
                operation: 'nedbank_connection_error',
                userId,
            });
            throw error;
        }
    }
    createSandboxConnection(userId) {
        const connectionId = `nedbank_${userId}_${Date.now()}`;
        const connection = {
            id: connectionId,
            userId,
            providerId: 'nedbank',
            bankId: 'nedbank',
            status: 'active',
            accessToken: 'sandbox_access_token',
            refreshToken: 'sandbox_refresh_token',
            tokenExpiresAt: new Date(Date.now() + 3600000),
            accounts: [`nedbank_acc_${userId}_1`, `nedbank_acc_${userId}_2`],
            metadata: {
                connectedAt: new Date(),
                lastActiveAt: new Date(),
                syncFrequency: 'hourly',
                autoSync: true,
            },
        };
        this.accessTokens.set(connectionId, {
            token: 'sandbox_access_token',
            expiresAt: new Date(Date.now() + 3600000),
        });
        this.logger.log(`Sandbox Nedbank connection created: ${connectionId}`);
        return connection;
    }
    generateAuthUrl(userId) {
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
    async exchangeCodeForToken(code, state) {
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
            const tokenData = await response.json();
            const connectionId = `nedbank_${userId}_${Date.now()}`;
            const connection = {
                id: connectionId,
                userId,
                providerId: 'nedbank',
                bankId: 'nedbank',
                status: 'active',
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                tokenExpiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
                accounts: [],
                metadata: {
                    connectedAt: new Date(),
                    lastActiveAt: new Date(),
                    syncFrequency: 'hourly',
                    autoSync: true,
                },
            };
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
        }
        catch (error) {
            this.advancedLogger.error('Nedbank token exchange failed', error, {
                operation: 'nedbank_token_exchange_error',
            });
            throw error;
        }
    }
    async getAccounts(connection) {
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
            const accountData = await response.json();
            const accounts = [];
            for (const accountInfo of accountData.Data.Account) {
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
                    const balanceData = await balanceResponse.json();
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
                const account = {
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
                        accountOpenDate: new Date(),
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
        }
        catch (error) {
            this.advancedLogger.error('Failed to retrieve Nedbank accounts', error, {
                operation: 'nedbank_accounts_error',
                metadata: { connectionId: connection.id },
            });
            throw error;
        }
    }
    async getTransactions(connection) {
        try {
            if (this.config.sandboxMode) {
                return this.getSandboxTransactions(connection);
            }
            const accessToken = await this.getValidAccessToken(connection.id);
            const transactions = {};
            for (const accountId of connection.accounts) {
                const fromDate = new Date();
                fromDate.setDate(fromDate.getDate() - 30);
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
                const transactionData = await response.json();
                const accountTransactions = [];
                for (const txn of transactionData.Data.Transaction) {
                    const transaction = {
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
                        balance: 0,
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
        }
        catch (error) {
            this.advancedLogger.error('Failed to retrieve Nedbank transactions', error, {
                operation: 'nedbank_transactions_error',
                metadata: { connectionId: connection.id },
            });
            throw error;
        }
    }
    getSandboxAccounts(connection) {
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
    getSandboxTransactions(connection) {
        const transactions = {};
        for (let i = 0; i < connection.accounts.length; i++) {
            const accountId = connection.accounts[i];
            const accountTransactions = [];
            for (let day = 0; day < 30; day++) {
                const transactionDate = new Date();
                transactionDate.setDate(transactionDate.getDate() - day);
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
                        category: banking_interface_1.TransactionCategory.SALARY,
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
                if (Math.random() > 0.3) {
                    const isExpense = Math.random() > 0.2;
                    const categories = isExpense
                        ? [banking_interface_1.TransactionCategory.GROCERIES, banking_interface_1.TransactionCategory.DINING, banking_interface_1.TransactionCategory.TRANSPORT_FUEL, banking_interface_1.TransactionCategory.ENTERTAINMENT]
                        : [banking_interface_1.TransactionCategory.FREELANCE, banking_interface_1.TransactionCategory.OTHER_INCOME];
                    const category = categories[Math.floor(Math.random() * categories.length)];
                    const amount = isExpense
                        ? Math.random() * 500 + 50
                        : Math.random() * 2000 + 100;
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
                        balance: 25000,
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
    async getValidAccessToken(connectionId) {
        const tokenInfo = this.accessTokens.get(connectionId);
        if (!tokenInfo) {
            throw new Error('No access token found for connection');
        }
        if (tokenInfo.expiresAt <= new Date()) {
            throw new Error('Access token expired, refresh required');
        }
        return tokenInfo.token;
    }
    mapAccountType(accountSubType) {
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
    getNedBankFees(accountType) {
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
    mapTransactionCategory(txn) {
        const description = txn.TransactionInformation.toLowerCase();
        const code = txn.BankTransactionCode.Code;
        if (description.includes('salary') || description.includes('wage')) {
            return banking_interface_1.TransactionCategory.SALARY;
        }
        if (description.includes('groceries') || description.includes('supermarket')) {
            return banking_interface_1.TransactionCategory.GROCERIES;
        }
        if (description.includes('fuel') || description.includes('petrol')) {
            return banking_interface_1.TransactionCategory.TRANSPORT_FUEL;
        }
        if (description.includes('restaurant') || description.includes('dining')) {
            return banking_interface_1.TransactionCategory.DINING;
        }
        if (description.includes('transfer')) {
            return banking_interface_1.TransactionCategory.TRANSFER;
        }
        if (description.includes('cash') || description.includes('atm')) {
            return banking_interface_1.TransactionCategory.CASH_WITHDRAWAL;
        }
        return banking_interface_1.TransactionCategory.UNKNOWN;
    }
    mapPaymentMethod(code) {
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
    getTransactionDescription(category) {
        const descriptions = {
            [banking_interface_1.TransactionCategory.GROCERIES]: ['CHECKERS HYPER', 'PICK N PAY', 'WOOLWORTHS', 'SPAR', 'SHOPRITE'],
            [banking_interface_1.TransactionCategory.DINING]: ['MCDONALDS', 'KFC', 'NANDOS', 'STEERS', 'WIMPY'],
            [banking_interface_1.TransactionCategory.TRANSPORT_FUEL]: ['SHELL', 'BP', 'SASOL', 'ENGEN', 'TOTAL'],
            [banking_interface_1.TransactionCategory.ENTERTAINMENT]: ['STER KINEKOR', 'NU METRO', 'SPOTIFY', 'NETFLIX', 'DSTV'],
            [banking_interface_1.TransactionCategory.FREELANCE]: ['FREELANCE PROJECT', 'CONSULTING FEE', 'DESIGN WORK'],
            [banking_interface_1.TransactionCategory.OTHER_INCOME]: ['INVESTMENT RETURN', 'BONUS PAYMENT', 'REFUND'],
        };
        const categoryDescriptions = descriptions[category] || ['TRANSACTION'];
        return categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
    }
};
exports.NedBankService = NedBankService;
exports.NedBankService = NedBankService = NedBankService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        advanced_logger_service_1.AdvancedLoggerService])
], NedBankService);
//# sourceMappingURL=nedbank.service.js.map