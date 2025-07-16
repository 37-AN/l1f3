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
var OkraService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OkraService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const advanced_logger_service_1 = require("../../../common/logger/advanced-logger.service");
const banking_interface_1 = require("../interfaces/banking.interface");
let OkraService = OkraService_1 = class OkraService {
    constructor(configService, advancedLogger) {
        this.configService = configService;
        this.advancedLogger = advancedLogger;
        this.logger = new common_1.Logger(OkraService_1.name);
        this.customerTokens = new Map();
        this.supportedBanks = [
            { id: 'standardbank', name: 'Standard Bank', code: '051001' },
            { id: 'absa', name: 'Absa Bank', code: '632005' },
            { id: 'fnb', name: 'First National Bank', code: '250655' },
            { id: 'nedbank', name: 'Nedbank', code: '198765' },
            { id: 'capitecbank', name: 'Capitec Bank', code: '470010' },
            { id: 'investec', name: 'Investec Bank', code: '580105' },
            { id: 'discovery', name: 'Discovery Bank', code: '679000' },
            { id: 'tymebank', name: 'TymeBank', code: '678910' },
        ];
        this.loadConfiguration();
    }
    loadConfiguration() {
        this.config = {
            apiKey: this.configService.get('OKRA_API_KEY', 'sandbox_api_key'),
            secretKey: this.configService.get('OKRA_SECRET_KEY', 'sandbox_secret_key'),
            baseUrl: this.configService.get('OKRA_BASE_URL', 'https://api.okra.ng/sandbox/v1'),
            environment: this.configService.get('OKRA_ENVIRONMENT', 'sandbox'),
            version: 'v1',
        };
    }
    async initialize() {
        this.logger.log('Initializing Okra multi-bank integration');
        if (this.config.environment === 'sandbox') {
            this.logger.warn('Okra integration running in SANDBOX mode');
        }
        await this.validateCredentials();
        this.advancedLogger.logFinancial('Okra service initialized', {
            operation: 'okra_initialization',
            metadata: {
                environment: this.config.environment,
                supportedBanks: this.supportedBanks.length,
                baseUrl: this.config.baseUrl,
            },
        });
    }
    async validateCredentials() {
        try {
            const response = await this.makeOkraRequest('/auth/banks', 'GET');
            if (response.status !== 'success') {
                throw new Error('Invalid Okra credentials');
            }
            this.logger.log('Okra credentials validated successfully');
        }
        catch (error) {
            this.logger.error('Okra credential validation failed:', error);
            throw new Error('Failed to validate Okra credentials');
        }
    }
    async connectBank(userId, bankId) {
        try {
            this.advancedLogger.logFinancial(`Initiating Okra bank connection: ${bankId}`, {
                operation: 'okra_connection_start',
                userId,
                metadata: { bankId },
            });
            if (this.config.environment === 'sandbox') {
                return this.createSandboxConnection(userId, bankId);
            }
            const widgetUrl = this.generateWidgetUrl(userId, bankId);
            throw new Error(`Please complete Okra widget flow: ${widgetUrl}`);
        }
        catch (error) {
            this.advancedLogger.error(`Okra bank connection failed: ${bankId}`, error, {
                operation: 'okra_connection_error',
                userId,
                metadata: { bankId },
            });
            throw error;
        }
    }
    createSandboxConnection(userId, bankId) {
        const connectionId = `okra_${bankId}_${userId}_${Date.now()}`;
        const customerId = `okra_customer_${userId}`;
        const connection = {
            id: connectionId,
            userId,
            providerId: 'okra',
            bankId,
            status: 'active',
            accessToken: 'sandbox_okra_token',
            refreshToken: 'sandbox_okra_refresh',
            tokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            accounts: [`okra_${bankId}_acc_1`, `okra_${bankId}_acc_2`],
            metadata: {
                connectedAt: new Date(),
                lastActiveAt: new Date(),
                syncFrequency: 'hourly',
                autoSync: true,
            },
        };
        this.customerTokens.set(connectionId, {
            customerId,
            accessToken: 'sandbox_okra_token',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
        this.logger.log(`Sandbox Okra connection created: ${connectionId}`);
        return connection;
    }
    generateWidgetUrl(userId, bankId) {
        const params = new URLSearchParams({
            client_name: 'LIF3 Financial Dashboard',
            auth_method: 'internet_banking',
            callback_url: `${this.configService.get('APP_BASE_URL')}/auth/okra/callback`,
            webhook_url: `${this.configService.get('APP_BASE_URL')}/webhooks/okra`,
            bank_id: bankId,
            customer_id: userId,
            environment: this.config.environment,
            version: this.config.version,
        });
        return `https://widget.okra.ng?${params.toString()}`;
    }
    async handleWidgetCallback(customerId, token, bankId) {
        try {
            const authResponse = await this.makeOkraRequest('/auth/verify', 'POST', {
                token,
                customer_id: customerId,
            });
            if (authResponse.status !== 'success') {
                throw new Error('Invalid Okra token');
            }
            const authData = authResponse;
            const connectionId = `okra_${bankId}_${customerId}_${Date.now()}`;
            const connection = {
                id: connectionId,
                userId: customerId,
                providerId: 'okra',
                bankId,
                status: 'active',
                accessToken: authData.data.auth.access_token,
                refreshToken: authData.data.auth.refresh_token,
                tokenExpiresAt: new Date(Date.now() + authData.data.auth.expires_in * 1000),
                accounts: [],
                metadata: {
                    connectedAt: new Date(),
                    lastActiveAt: new Date(),
                    syncFrequency: 'hourly',
                    autoSync: true,
                },
            };
            this.customerTokens.set(connectionId, {
                customerId: authData.data.customer_id,
                accessToken: authData.data.auth.access_token,
                expiresAt: new Date(Date.now() + authData.data.auth.expires_in * 1000),
            });
            this.advancedLogger.logFinancial(`Okra connection established: ${connectionId}`, {
                operation: 'okra_connection_complete',
                userId: customerId,
                metadata: { connectionId, bankId },
            });
            return connection;
        }
        catch (error) {
            this.advancedLogger.error('Okra widget callback failed', error, {
                operation: 'okra_callback_error',
                metadata: { customerId, bankId },
            });
            throw error;
        }
    }
    async getAccounts(connection) {
        try {
            if (this.config.environment === 'sandbox') {
                return this.getSandboxAccounts(connection);
            }
            const tokenInfo = this.customerTokens.get(connection.id);
            if (!tokenInfo) {
                throw new Error('No token found for connection');
            }
            const response = await this.makeOkraRequest('/accounts', 'GET', null, tokenInfo.accessToken);
            const accountsData = response;
            const accounts = accountsData.data.accounts.map(acc => ({
                id: acc._id,
                accountNumber: acc.number,
                accountType: this.mapOkraAccountType(acc.type),
                bankId: connection.bankId,
                bankName: acc.bank.name,
                branchCode: this.getBankBranchCode(connection.bankId),
                accountName: acc.name,
                currency: acc.currency,
                balance: acc.balance.current,
                availableBalance: acc.balance.available,
                overdraftLimit: acc.balance.limit > acc.balance.current ? acc.balance.limit - acc.balance.current : undefined,
                fees: this.getBankFees(connection.bankId),
                isActive: true,
                lastSyncAt: new Date(),
                metadata: {
                    productType: acc.type,
                    accountOpenDate: new Date(acc.created_at),
                    lastTransactionDate: new Date(acc.last_updated),
                    monthlyLimit: 50000,
                    dailyLimit: 10000,
                },
            }));
            this.advancedLogger.logFinancial(`Retrieved ${accounts.length} accounts via Okra`, {
                operation: 'okra_accounts_retrieved',
                metadata: {
                    connectionId: connection.id,
                    bankId: connection.bankId,
                    accountCount: accounts.length,
                },
            });
            return accounts;
        }
        catch (error) {
            this.advancedLogger.error('Failed to retrieve Okra accounts', error, {
                operation: 'okra_accounts_error',
                metadata: { connectionId: connection.id },
            });
            throw error;
        }
    }
    async getTransactions(connection) {
        try {
            if (this.config.environment === 'sandbox') {
                return this.getSandboxTransactions(connection);
            }
            const tokenInfo = this.customerTokens.get(connection.id);
            if (!tokenInfo) {
                throw new Error('No token found for connection');
            }
            const transactions = {};
            for (const accountId of connection.accounts) {
                const response = await this.makeOkraRequest(`/transactions/${accountId}`, 'GET', null, tokenInfo.accessToken);
                const transactionsData = response;
                const accountTransactions = transactionsData.data.transactions.map(txn => ({
                    id: txn._id,
                    accountId: txn.account,
                    externalId: txn._id,
                    type: txn.type,
                    amount: Math.abs(txn.amount),
                    currency: txn.currency,
                    description: txn.description,
                    reference: txn.reference,
                    category: this.mapOkraCategory(txn.category),
                    date: new Date(txn.date),
                    valueDate: new Date(txn.date),
                    balance: txn.balance,
                    location: txn.location ? {
                        city: txn.location.city,
                        province: txn.location.state,
                        country: txn.location.country,
                        coordinates: {
                            latitude: txn.location.lat,
                            longitude: txn.location.lng,
                        },
                    } : undefined,
                    merchant: txn.merchant ? {
                        name: txn.merchant.name,
                        category: txn.merchant.category,
                        mcc: txn.merchant.mcc,
                    } : undefined,
                    paymentMethod: this.mapOkraChannel(txn.channel),
                    status: 'completed',
                    tags: [],
                    isRecurring: false,
                    isReviewed: false,
                    metadata: {
                        importedAt: new Date(),
                        lastUpdated: new Date(txn.last_updated),
                        confidence: 100,
                        enrichmentVersion: '1.0',
                    },
                }));
                transactions[accountId] = accountTransactions;
            }
            const totalTransactions = Object.values(transactions).reduce((sum, txns) => sum + txns.length, 0);
            this.advancedLogger.logFinancial(`Retrieved ${totalTransactions} transactions via Okra`, {
                operation: 'okra_transactions_retrieved',
                metadata: {
                    connectionId: connection.id,
                    bankId: connection.bankId,
                    accountCount: connection.accounts.length,
                    totalTransactions,
                },
            });
            return transactions;
        }
        catch (error) {
            this.advancedLogger.error('Failed to retrieve Okra transactions', error, {
                operation: 'okra_transactions_error',
                metadata: { connectionId: connection.id },
            });
            throw error;
        }
    }
    async makeOkraRequest(endpoint, method, body, token) {
        const url = `${this.config.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
        };
        if (token) {
            headers['X-Okra-Token'] = token;
        }
        const requestOptions = {
            method,
            headers,
        };
        if (body && method === 'POST') {
            requestOptions.body = JSON.stringify(body);
        }
        const response = await fetch(url, requestOptions);
        if (!response.ok) {
            throw new Error(`Okra API request failed: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    }
    getSandboxAccounts(connection) {
        const bankInfo = this.supportedBanks.find(b => b.id === connection.bankId);
        const bankName = bankInfo?.name || 'Unknown Bank';
        return [
            {
                id: `okra_${connection.bankId}_acc_1`,
                accountNumber: `1${connection.bankId.substring(0, 9).padEnd(9, '0')}`,
                accountType: 'current',
                bankId: connection.bankId,
                bankName,
                branchCode: bankInfo?.code || '000000',
                accountName: `${bankName} Current Account`,
                currency: 'ZAR',
                balance: 15000.00 + Math.random() * 20000,
                availableBalance: 12000.00 + Math.random() * 18000,
                overdraftLimit: 5000.00,
                fees: this.getBankFees(connection.bankId),
                isActive: true,
                lastSyncAt: new Date(),
                metadata: {
                    productType: 'Current Account',
                    accountOpenDate: new Date('2022-03-01'),
                    lastTransactionDate: new Date(),
                    monthlyLimit: 50000,
                    dailyLimit: 10000,
                },
            },
            {
                id: `okra_${connection.bankId}_acc_2`,
                accountNumber: `2${connection.bankId.substring(0, 9).padEnd(9, '0')}`,
                accountType: 'savings',
                bankId: connection.bankId,
                bankName,
                branchCode: bankInfo?.code || '000000',
                accountName: `${bankName} Savings Account`,
                currency: 'ZAR',
                balance: 50000.00 + Math.random() * 100000,
                availableBalance: 50000.00 + Math.random() * 100000,
                interestRate: 0.035 + Math.random() * 0.02,
                fees: this.getBankFees(connection.bankId, 'savings'),
                isActive: true,
                lastSyncAt: new Date(),
                metadata: {
                    productType: 'Savings Account',
                    accountOpenDate: new Date('2022-03-01'),
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
            for (let day = 0; day < 45; day++) {
                const transactionDate = new Date();
                transactionDate.setDate(transactionDate.getDate() - day);
                if (transactionDate.getDate() === 25 && i === 0) {
                    accountTransactions.push({
                        id: `okra_sal_${day}`,
                        accountId,
                        externalId: `SAL${transactionDate.getTime()}`,
                        type: 'credit',
                        amount: 32000.00 + Math.random() * 8000,
                        currency: 'ZAR',
                        description: 'SALARY DEPOSIT',
                        reference: `SAL${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
                        category: banking_interface_1.TransactionCategory.SALARY,
                        date: transactionDate,
                        valueDate: transactionDate,
                        balance: 15000 + 32000,
                        paymentMethod: 'eft',
                        status: 'completed',
                        tags: ['income', 'salary'],
                        isRecurring: true,
                        isReviewed: true,
                        metadata: {
                            importedAt: new Date(),
                            lastUpdated: new Date(),
                            confidence: 100,
                            enrichmentVersion: '1.0',
                        },
                    });
                }
                if (Math.random() > 0.7 && i === 0) {
                    accountTransactions.push({
                        id: `okra_biz_${day}_${Math.random()}`,
                        accountId,
                        externalId: `BIZ${transactionDate.getTime()}${Math.floor(Math.random() * 1000)}`,
                        type: 'credit',
                        amount: 500 + Math.random() * 3000,
                        currency: 'ZAR',
                        description: '43V3R BUSINESS PAYMENT',
                        reference: `43V3R${Math.floor(Math.random() * 10000)}`,
                        category: banking_interface_1.TransactionCategory.BUSINESS_REVENUE,
                        date: transactionDate,
                        valueDate: transactionDate,
                        balance: 15000,
                        paymentMethod: 'eft',
                        status: 'completed',
                        tags: ['business', '43v3r'],
                        isRecurring: false,
                        isReviewed: false,
                        metadata: {
                            importedAt: new Date(),
                            lastUpdated: new Date(),
                            confidence: 100,
                            enrichmentVersion: '1.0',
                        },
                    });
                }
                if (Math.random() > 0.4) {
                    const isExpense = Math.random() > 0.25;
                    const categories = isExpense
                        ? [banking_interface_1.TransactionCategory.GROCERIES, banking_interface_1.TransactionCategory.DINING, banking_interface_1.TransactionCategory.TRANSPORT_FUEL,
                            banking_interface_1.TransactionCategory.UTILITIES, banking_interface_1.TransactionCategory.ENTERTAINMENT, banking_interface_1.TransactionCategory.SHOPPING]
                        : [banking_interface_1.TransactionCategory.FREELANCE, banking_interface_1.TransactionCategory.OTHER_INCOME];
                    const category = categories[Math.floor(Math.random() * categories.length)];
                    const amount = isExpense
                        ? Math.random() * 800 + 25
                        : Math.random() * 1500 + 100;
                    accountTransactions.push({
                        id: `okra_txn_${day}_${Math.random()}`,
                        accountId,
                        externalId: `TXN${transactionDate.getTime()}${Math.floor(Math.random() * 1000)}`,
                        type: isExpense ? 'debit' : 'credit',
                        amount: Math.round(amount * 100) / 100,
                        currency: 'ZAR',
                        description: this.getOkraTransactionDescription(category, connection.bankId),
                        reference: `REF${Math.floor(Math.random() * 100000)}`,
                        category,
                        date: transactionDate,
                        valueDate: transactionDate,
                        balance: 15000,
                        location: Math.random() > 0.5 ? {
                            city: this.getRandomSACity(),
                            province: 'Gauteng',
                            country: 'South Africa',
                        } : undefined,
                        paymentMethod: Math.random() > 0.6 ? 'card' : 'eft',
                        status: 'completed',
                        tags: [],
                        isRecurring: false,
                        isReviewed: false,
                        metadata: {
                            importedAt: new Date(),
                            lastUpdated: new Date(),
                            confidence: 90 + Math.random() * 10,
                            enrichmentVersion: '1.0',
                        },
                    });
                }
            }
            transactions[accountId] = accountTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());
        }
        return transactions;
    }
    mapOkraAccountType(okraType) {
        switch (okraType.toLowerCase()) {
            case 'savings':
                return 'savings';
            case 'current':
            case 'checking':
                return 'current';
            case 'credit':
            case 'credit_card':
                return 'credit';
            case 'investment':
            case 'fixed_deposit':
                return 'investment';
            case 'loan':
                return 'loan';
            default:
                return 'current';
        }
    }
    mapOkraCategory(okraCategory) {
        const categoryMap = {
            'food_and_drink': banking_interface_1.TransactionCategory.DINING,
            'groceries': banking_interface_1.TransactionCategory.GROCERIES,
            'transport': banking_interface_1.TransactionCategory.TRANSPORT_FUEL,
            'utilities': banking_interface_1.TransactionCategory.UTILITIES,
            'entertainment': banking_interface_1.TransactionCategory.ENTERTAINMENT,
            'shopping': banking_interface_1.TransactionCategory.SHOPPING,
            'healthcare': banking_interface_1.TransactionCategory.MEDICAL,
            'salary': banking_interface_1.TransactionCategory.SALARY,
            'transfer': banking_interface_1.TransactionCategory.TRANSFER,
            'cash': banking_interface_1.TransactionCategory.CASH_WITHDRAWAL,
            'investment': banking_interface_1.TransactionCategory.INVESTMENTS,
            'business': banking_interface_1.TransactionCategory.BUSINESS_EXPENSE,
        };
        return categoryMap[okraCategory.toLowerCase()] || banking_interface_1.TransactionCategory.UNKNOWN;
    }
    mapOkraChannel(channel) {
        switch (channel.toLowerCase()) {
            case 'pos':
            case 'card':
                return 'card';
            case 'atm':
                return 'cash';
            case 'online':
            case 'internet':
                return 'online';
            case 'mobile':
                return 'mobile';
            case 'branch':
            case 'teller':
                return 'eft';
            default:
                return 'eft';
        }
    }
    getBankBranchCode(bankId) {
        const bank = this.supportedBanks.find(b => b.id === bankId);
        return bank?.code || '000000';
    }
    getBankFees(bankId, accountType = 'current') {
        const feeStructures = {
            standardbank: {
                monthlyFee: accountType === 'savings' ? 20.00 : 85.00,
                transactionFees: {
                    eft: 8.00,
                    debitOrder: 5.50,
                    cashWithdrawal: 9.00,
                    cardPurchase: 3.00,
                    onlinePurchase: 1.50,
                },
            },
            absa: {
                monthlyFee: accountType === 'savings' ? 25.00 : 99.00,
                transactionFees: {
                    eft: 7.95,
                    debitOrder: 5.25,
                    cashWithdrawal: 8.95,
                    cardPurchase: 2.95,
                    onlinePurchase: 1.50,
                },
            },
            fnb: {
                monthlyFee: accountType === 'savings' ? 15.00 : 89.00,
                transactionFees: {
                    eft: 7.50,
                    debitOrder: 4.50,
                    cashWithdrawal: 8.00,
                    cardPurchase: 2.00,
                    onlinePurchase: 1.00,
                },
            },
            capitecbank: {
                monthlyFee: accountType === 'savings' ? 5.50 : 5.50,
                transactionFees: {
                    eft: 3.50,
                    debitOrder: 2.50,
                    cashWithdrawal: 4.00,
                    cardPurchase: 1.00,
                    onlinePurchase: 0.50,
                },
            },
            tymebank: {
                monthlyFee: 0.00,
                transactionFees: {
                    eft: 1.50,
                    debitOrder: 1.00,
                    cashWithdrawal: 2.00,
                    cardPurchase: 0.00,
                    onlinePurchase: 0.00,
                },
            },
        };
        return feeStructures[bankId] || feeStructures.standardbank;
    }
    getOkraTransactionDescription(category, bankId) {
        const descriptions = {
            [banking_interface_1.TransactionCategory.GROCERIES]: ['CHECKERS', 'PICK N PAY', 'WOOLWORTHS', 'SPAR', 'SHOPRITE', 'DISCHEM'],
            [banking_interface_1.TransactionCategory.DINING]: ['MCDONALDS', 'KFC', 'NANDOS', 'STEERS', 'WIMPY', 'BURGER KING', 'PIZZA HUT'],
            [banking_interface_1.TransactionCategory.TRANSPORT_FUEL]: ['SHELL', 'BP', 'SASOL', 'ENGEN', 'TOTAL', 'UBER', 'BOLT'],
            [banking_interface_1.TransactionCategory.UTILITIES]: ['ESKOM', 'CITY OF CAPE TOWN', 'VODACOM', 'MTN', 'TELKOM', 'RAIN'],
            [banking_interface_1.TransactionCategory.ENTERTAINMENT]: ['STER KINEKOR', 'NU METRO', 'SPOTIFY', 'NETFLIX', 'DSTV', 'SHOWMAX'],
            [banking_interface_1.TransactionCategory.SHOPPING]: ['GAME', 'MAKRO', 'BUILDERS WAREHOUSE', 'MR PRICE', 'EDGARS', 'FOSCHINI'],
            [banking_interface_1.TransactionCategory.FREELANCE]: ['FREELANCE PROJECT', 'CONSULTING FEE', 'DESIGN WORK', 'DEVELOPMENT WORK'],
            [banking_interface_1.TransactionCategory.OTHER_INCOME]: ['INVESTMENT RETURN', 'DIVIDEND', 'RENTAL INCOME', 'BONUS'],
        };
        const categoryDescriptions = descriptions[category] || ['GENERAL TRANSACTION'];
        return categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
    }
    getRandomSACity() {
        const cities = ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'East London', 'Pietermaritzburg'];
        return cities[Math.floor(Math.random() * cities.length)];
    }
    getSupportedBanks() {
        return this.supportedBanks;
    }
    async refreshToken(connectionId) {
        const tokenInfo = this.customerTokens.get(connectionId);
        if (!tokenInfo) {
            throw new Error('No token found for connection');
        }
        this.logger.log(`Token refresh not implemented for connection: ${connectionId}`);
    }
};
exports.OkraService = OkraService;
exports.OkraService = OkraService = OkraService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        advanced_logger_service_1.AdvancedLoggerService])
], OkraService);
//# sourceMappingURL=okra.service.js.map