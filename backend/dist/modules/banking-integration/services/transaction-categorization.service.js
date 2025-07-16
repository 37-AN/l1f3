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
var TransactionCategorizationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionCategorizationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const advanced_logger_service_1 = require("../../../common/logger/advanced-logger.service");
const banking_interface_1 = require("../interfaces/banking.interface");
let TransactionCategorizationService = TransactionCategorizationService_1 = class TransactionCategorizationService {
    constructor(configService, advancedLogger) {
        this.configService = configService;
        this.advancedLogger = advancedLogger;
        this.logger = new common_1.Logger(TransactionCategorizationService_1.name);
        this.categoryRules = [];
        this.southAfricanMerchants = [];
        this.learningData = new Map();
    }
    async onModuleInit() {
        await this.initializeModels();
    }
    async initializeModels() {
        this.logger.log('Initializing transaction categorization models');
        try {
            this.loadCategorizationRules();
            this.loadSouthAfricanMerchants();
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
        }
        catch (error) {
            this.logger.error('Failed to initialize categorization models:', error);
            throw error;
        }
    }
    async categorizeTransaction(transaction) {
        try {
            const startTime = Date.now();
            const results = [
                await this.categorizeBySouthAfricanMerchant(transaction),
                await this.categorizeByRules(transaction),
                await this.categorizeByKeywords(transaction),
                await this.categorizeByAmount(transaction),
            ].filter(result => result.confidence > 0);
            results.sort((a, b) => b.confidence - a.confidence);
            const bestResult = results[0];
            const finalCategory = bestResult?.category || banking_interface_1.TransactionCategory.UNKNOWN;
            const confidence = bestResult?.confidence || 0;
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
        }
        catch (error) {
            this.logger.error(`Failed to categorize transaction ${transaction.id}:`, error);
            return banking_interface_1.TransactionCategory.UNKNOWN;
        }
    }
    loadCategorizationRules() {
        this.categoryRules = [
            {
                id: 'salary_rule',
                category: banking_interface_1.TransactionCategory.SALARY,
                patterns: ['SALARY', 'WAGE', 'PAY', 'PAYROLL', 'EMPL'],
                keywords: ['salary', 'wage', 'payroll', 'employment', 'employer'],
                merchantCategories: [],
                confidence: 95,
                priority: 1,
            },
            {
                id: 'business_revenue_rule',
                category: banking_interface_1.TransactionCategory.BUSINESS_REVENUE,
                patterns: ['43V3R', 'BUSINESS', 'CLIENT', 'INVOICE', 'PAYMENT RECEIVED'],
                keywords: ['43v3r', 'business', 'client', 'invoice', 'payment', 'consulting'],
                merchantCategories: [],
                confidence: 90,
                priority: 1,
            },
            {
                id: 'freelance_rule',
                category: banking_interface_1.TransactionCategory.FREELANCE,
                patterns: ['FREELANCE', 'CONTRACT', 'CONSULTING', 'PROJECT'],
                keywords: ['freelance', 'contract', 'consulting', 'project', 'gig'],
                merchantCategories: [],
                confidence: 85,
                priority: 2,
            },
            {
                id: 'rent_mortgage_rule',
                category: banking_interface_1.TransactionCategory.RENT_MORTGAGE,
                patterns: ['RENT', 'MORTGAGE', 'BOND', 'LEVY'],
                keywords: ['rent', 'mortgage', 'bond', 'levy', 'property'],
                merchantCategories: [],
                amountRanges: { min: 5000, max: 50000 },
                confidence: 95,
                priority: 1,
            },
            {
                id: 'utilities_rule',
                category: banking_interface_1.TransactionCategory.UTILITIES,
                patterns: ['ESKOM', 'MUNICIPALITY', 'WATER', 'ELECTRICITY', 'RATES'],
                keywords: ['eskom', 'electricity', 'water', 'municipality', 'rates', 'utilities'],
                merchantCategories: ['4900'],
                confidence: 90,
                priority: 1,
            },
            {
                id: 'groceries_rule',
                category: banking_interface_1.TransactionCategory.GROCERIES,
                patterns: ['CHECKERS', 'PICK N PAY', 'WOOLWORTHS', 'SPAR', 'SHOPRITE', 'DISCHEM'],
                keywords: ['groceries', 'supermarket', 'food', 'pharmacy'],
                merchantCategories: ['5411', '5912'],
                confidence: 85,
                priority: 2,
            },
            {
                id: 'transport_fuel_rule',
                category: banking_interface_1.TransactionCategory.TRANSPORT_FUEL,
                patterns: ['SHELL', 'BP', 'SASOL', 'ENGEN', 'TOTAL', 'UBER', 'BOLT', 'TAXI'],
                keywords: ['fuel', 'petrol', 'diesel', 'uber', 'bolt', 'taxi', 'transport'],
                merchantCategories: ['5542', '4121'],
                confidence: 85,
                priority: 2,
            },
            {
                id: 'dining_rule',
                category: banking_interface_1.TransactionCategory.DINING,
                patterns: ['MCDONALDS', 'KFC', 'NANDOS', 'STEERS', 'WIMPY', 'RESTAURANT'],
                keywords: ['restaurant', 'food', 'dining', 'takeaway', 'fast food'],
                merchantCategories: ['5812', '5814'],
                confidence: 80,
                priority: 2,
            },
            {
                id: 'entertainment_rule',
                category: banking_interface_1.TransactionCategory.ENTERTAINMENT,
                patterns: ['STER KINEKOR', 'NU METRO', 'SPOTIFY', 'NETFLIX', 'DSTV', 'SHOWMAX'],
                keywords: ['cinema', 'movie', 'entertainment', 'streaming', 'music', 'tv'],
                merchantCategories: ['5813', '7832'],
                confidence: 80,
                priority: 2,
            },
            {
                id: 'shopping_rule',
                category: banking_interface_1.TransactionCategory.SHOPPING,
                patterns: ['GAME', 'MAKRO', 'BUILDERS', 'MR PRICE', 'EDGARS', 'FOSCHINI'],
                keywords: ['shopping', 'retail', 'store', 'clothing', 'electronics'],
                merchantCategories: ['5311', '5651', '5732'],
                confidence: 75,
                priority: 3,
            },
            {
                id: 'savings_rule',
                category: banking_interface_1.TransactionCategory.SAVINGS,
                patterns: ['SAVINGS', 'INVEST', 'FIXED DEPOSIT', 'MONEY MARKET'],
                keywords: ['savings', 'investment', 'deposit', 'money market'],
                merchantCategories: [],
                confidence: 90,
                priority: 1,
            },
            {
                id: 'loan_payment_rule',
                category: banking_interface_1.TransactionCategory.LOAN_PAYMENT,
                patterns: ['LOAN', 'CREDIT', 'INSTALMENT', 'DEBT'],
                keywords: ['loan', 'credit', 'instalment', 'debt', 'repayment'],
                merchantCategories: [],
                confidence: 85,
                priority: 2,
            },
            {
                id: 'transfer_rule',
                category: banking_interface_1.TransactionCategory.TRANSFER,
                patterns: ['TRANSFER', 'FT', 'EFT', 'INTERNET TRANSFER'],
                keywords: ['transfer', 'eft', 'internet banking', 'payment'],
                merchantCategories: [],
                confidence: 70,
                priority: 4,
            },
            {
                id: 'cash_withdrawal_rule',
                category: banking_interface_1.TransactionCategory.CASH_WITHDRAWAL,
                patterns: ['ATM', 'CASH', 'WITHDRAWAL', 'TELLER'],
                keywords: ['atm', 'cash', 'withdrawal', 'teller'],
                merchantCategories: ['6011'],
                confidence: 95,
                priority: 1,
            },
        ];
        this.logger.log(`Loaded ${this.categoryRules.length} categorization rules`);
    }
    loadSouthAfricanMerchants() {
        this.southAfricanMerchants = [
            { name: 'CHECKERS', aliases: ['CHECKERS HYPER', 'CHECKERS SIXTY60'], category: banking_interface_1.TransactionCategory.GROCERIES, confidence: 95 },
            { name: 'PICK N PAY', aliases: ['PNP', 'PICK N PAY HYPER'], category: banking_interface_1.TransactionCategory.GROCERIES, confidence: 95 },
            { name: 'WOOLWORTHS', aliases: ['WOOLIES', 'WW'], category: banking_interface_1.TransactionCategory.GROCERIES, confidence: 95 },
            { name: 'SPAR', aliases: ['SUPERSPAR', 'KWIKSPAR'], category: banking_interface_1.TransactionCategory.GROCERIES, confidence: 95 },
            { name: 'SHOPRITE', aliases: ['SHOPRITE CHECKERS'], category: banking_interface_1.TransactionCategory.GROCERIES, confidence: 95 },
            { name: 'DISCHEM', aliases: ['DIS-CHEM', 'DISCHEM PHARMACY'], category: banking_interface_1.TransactionCategory.MEDICAL, confidence: 90 },
            { name: 'MCDONALDS', aliases: ['MCD', 'MCDONALD\'S'], category: banking_interface_1.TransactionCategory.DINING, confidence: 95 },
            { name: 'KFC', aliases: ['KENTUCKY'], category: banking_interface_1.TransactionCategory.DINING, confidence: 95 },
            { name: 'NANDOS', aliases: ['NANDO\'S'], category: banking_interface_1.TransactionCategory.DINING, confidence: 95 },
            { name: 'STEERS', aliases: [], category: banking_interface_1.TransactionCategory.DINING, confidence: 95 },
            { name: 'WIMPY', aliases: [], category: banking_interface_1.TransactionCategory.DINING, confidence: 95 },
            { name: 'BURGER KING', aliases: ['BK'], category: banking_interface_1.TransactionCategory.DINING, confidence: 95 },
            { name: 'SHELL', aliases: ['SHELL SA'], category: banking_interface_1.TransactionCategory.TRANSPORT_FUEL, confidence: 95 },
            { name: 'BP', aliases: ['BP SOUTH AFRICA'], category: banking_interface_1.TransactionCategory.TRANSPORT_FUEL, confidence: 95 },
            { name: 'SASOL', aliases: [], category: banking_interface_1.TransactionCategory.TRANSPORT_FUEL, confidence: 95 },
            { name: 'ENGEN', aliases: [], category: banking_interface_1.TransactionCategory.TRANSPORT_FUEL, confidence: 95 },
            { name: 'TOTAL', aliases: ['TOTAL SA'], category: banking_interface_1.TransactionCategory.TRANSPORT_FUEL, confidence: 95 },
            { name: 'UBER', aliases: ['UBER TRIP'], category: banking_interface_1.TransactionCategory.TRANSPORT_FUEL, confidence: 90 },
            { name: 'BOLT', aliases: ['BOLT RIDE'], category: banking_interface_1.TransactionCategory.TRANSPORT_FUEL, confidence: 90 },
            { name: 'STER KINEKOR', aliases: ['STER-KINEKOR'], category: banking_interface_1.TransactionCategory.ENTERTAINMENT, confidence: 95 },
            { name: 'NU METRO', aliases: ['NUMETRO'], category: banking_interface_1.TransactionCategory.ENTERTAINMENT, confidence: 95 },
            { name: 'NETFLIX', aliases: [], category: banking_interface_1.TransactionCategory.ENTERTAINMENT, confidence: 95 },
            { name: 'SPOTIFY', aliases: [], category: banking_interface_1.TransactionCategory.ENTERTAINMENT, confidence: 95 },
            { name: 'DSTV', aliases: ['MULTICHOICE'], category: banking_interface_1.TransactionCategory.ENTERTAINMENT, confidence: 95 },
            { name: 'SHOWMAX', aliases: [], category: banking_interface_1.TransactionCategory.ENTERTAINMENT, confidence: 95 },
            { name: 'ESKOM', aliases: ['ESKOM HOLDINGS'], category: banking_interface_1.TransactionCategory.UTILITIES, confidence: 95 },
            { name: 'CITY OF CAPE TOWN', aliases: ['COCT'], category: banking_interface_1.TransactionCategory.UTILITIES, confidence: 95 },
            { name: 'CITY OF JOHANNESBURG', aliases: ['COJ'], category: banking_interface_1.TransactionCategory.UTILITIES, confidence: 95 },
            { name: 'VODACOM', aliases: ['VDC'], category: banking_interface_1.TransactionCategory.UTILITIES, confidence: 90 },
            { name: 'MTN', aliases: ['MTN SA'], category: banking_interface_1.TransactionCategory.UTILITIES, confidence: 90 },
            { name: 'TELKOM', aliases: ['TELKOM SA'], category: banking_interface_1.TransactionCategory.UTILITIES, confidence: 90 },
            { name: 'GAME', aliases: ['GAME STORES'], category: banking_interface_1.TransactionCategory.SHOPPING, confidence: 90 },
            { name: 'MAKRO', aliases: [], category: banking_interface_1.TransactionCategory.SHOPPING, confidence: 90 },
            { name: 'BUILDERS WAREHOUSE', aliases: ['BUILDERS'], category: banking_interface_1.TransactionCategory.SHOPPING, confidence: 90 },
            { name: 'MR PRICE', aliases: ['MRP'], category: banking_interface_1.TransactionCategory.SHOPPING, confidence: 90 },
            { name: 'EDGARS', aliases: [], category: banking_interface_1.TransactionCategory.SHOPPING, confidence: 90 },
            { name: 'FOSCHINI', aliases: ['TFG'], category: banking_interface_1.TransactionCategory.SHOPPING, confidence: 90 },
            { name: '43V3R', aliases: ['43V3R BUSINESS', '43V3R CONSULTING'], category: banking_interface_1.TransactionCategory.BUSINESS_REVENUE, confidence: 100 },
            { name: 'PAYPAL', aliases: ['PAYPAL SA'], category: banking_interface_1.TransactionCategory.BUSINESS_REVENUE, confidence: 80 },
            { name: 'STRIPE', aliases: ['STRIPE PAYMENTS'], category: banking_interface_1.TransactionCategory.BUSINESS_REVENUE, confidence: 80 },
        ];
        this.logger.log(`Loaded ${this.southAfricanMerchants.length} South African merchants`);
    }
    async initializeMLModels() {
        this.logger.log('ML models initialized (simplified implementation)');
    }
    async categorizeBySouthAfricanMerchant(transaction) {
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
            category: banking_interface_1.TransactionCategory.UNKNOWN,
            confidence: 0,
            method: 'merchant_lookup',
        };
    }
    async categorizeByRules(transaction) {
        const description = transaction.description.toUpperCase();
        const amount = Math.abs(transaction.amount);
        const sortedRules = [...this.categoryRules].sort((a, b) => a.priority - b.priority);
        for (const rule of sortedRules) {
            let matches = 0;
            let totalChecks = 0;
            if (rule.patterns.length > 0) {
                totalChecks++;
                for (const pattern of rule.patterns) {
                    if (description.includes(pattern.toUpperCase())) {
                        matches++;
                        break;
                    }
                }
            }
            if (rule.amountRanges) {
                totalChecks++;
                const { min, max } = rule.amountRanges;
                if ((!min || amount >= min) && (!max || amount <= max)) {
                    matches++;
                }
            }
            if (rule.merchantCategories.length > 0 && transaction.merchant?.mcc) {
                totalChecks++;
                if (rule.merchantCategories.includes(transaction.merchant.mcc)) {
                    matches++;
                }
            }
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
            category: banking_interface_1.TransactionCategory.UNKNOWN,
            confidence: 0,
            method: 'rule_based',
        };
    }
    async categorizeByKeywords(transaction) {
        const description = transaction.description.toLowerCase();
        const reference = transaction.reference.toLowerCase();
        const fullText = `${description} ${reference}`;
        for (const rule of this.categoryRules) {
            for (const keyword of rule.keywords) {
                if (fullText.includes(keyword.toLowerCase())) {
                    return {
                        category: rule.category,
                        confidence: Math.max(60, rule.confidence * 0.7),
                        method: 'keyword_match',
                        matchedRule: rule.id,
                    };
                }
            }
        }
        return {
            category: banking_interface_1.TransactionCategory.UNKNOWN,
            confidence: 0,
            method: 'keyword_match',
        };
    }
    async categorizeByAmount(transaction) {
        const amount = Math.abs(transaction.amount);
        if (amount >= 25000 && amount <= 50000 && transaction.type === 'credit') {
            return {
                category: banking_interface_1.TransactionCategory.SALARY,
                confidence: 60,
                method: 'ml_prediction',
            };
        }
        if (amount >= 5000 && amount <= 15000 && transaction.type === 'debit') {
            return {
                category: banking_interface_1.TransactionCategory.RENT_MORTGAGE,
                confidence: 50,
                method: 'ml_prediction',
            };
        }
        if (amount <= 100 && transaction.type === 'debit') {
            return {
                category: banking_interface_1.TransactionCategory.TRANSPORT_FUEL,
                confidence: 40,
                method: 'ml_prediction',
            };
        }
        return {
            category: banking_interface_1.TransactionCategory.UNKNOWN,
            confidence: 0,
            method: 'ml_prediction',
        };
    }
    updateLearningData(description, category) {
        const key = description.toLowerCase().trim();
        const existing = this.learningData.get(key);
        if (existing) {
            if (existing.category === category) {
                existing.frequency++;
            }
        }
        else {
            this.learningData.set(key, { category, frequency: 1 });
        }
    }
    async getCategorySuggestions(transaction) {
        try {
            const results = [
                await this.categorizeBySouthAfricanMerchant(transaction),
                await this.categorizeByRules(transaction),
                await this.categorizeByKeywords(transaction),
                await this.categorizeByAmount(transaction),
            ].filter(result => result.confidence > 30);
            const uniqueCategories = [...new Set(results.map(r => r.category))];
            return uniqueCategories.slice(0, 3);
        }
        catch (error) {
            this.logger.error('Failed to generate category suggestions:', error);
            return [banking_interface_1.TransactionCategory.UNKNOWN];
        }
    }
    async learnFromCorrection(transaction, correctCategory) {
        try {
            this.updateLearningData(transaction.description, correctCategory);
            if (correctCategory !== banking_interface_1.TransactionCategory.UNKNOWN && transaction.merchant) {
                const existingMerchant = this.southAfricanMerchants.find(m => m.name.toUpperCase() === transaction.merchant.name.toUpperCase());
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
        }
        catch (error) {
            this.logger.error('Failed to learn from correction:', error);
        }
    }
    getCategorizationStats() {
        const categoryCount = new Map();
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
    exportLearningData() {
        return Array.from(this.learningData.entries()).map(([description, data]) => ({
            description,
            category: data.category,
            frequency: data.frequency,
        }));
    }
};
exports.TransactionCategorizationService = TransactionCategorizationService;
exports.TransactionCategorizationService = TransactionCategorizationService = TransactionCategorizationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        advanced_logger_service_1.AdvancedLoggerService])
], TransactionCategorizationService);
//# sourceMappingURL=transaction-categorization.service.js.map