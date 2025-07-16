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
var FraudDetectionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FraudDetectionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const advanced_logger_service_1 = require("../../../common/logger/advanced-logger.service");
let FraudDetectionService = FraudDetectionService_1 = class FraudDetectionService {
    constructor(configService, advancedLogger) {
        this.configService = configService;
        this.advancedLogger = advancedLogger;
        this.logger = new common_1.Logger(FraudDetectionService_1.name);
        this.fraudRules = [];
        this.activeAlerts = new Map();
        this.userProfiles = new Map();
        this.blacklistedMerchants = [];
        this.highRiskLocations = [];
    }
    async initializeFraudRules() {
        this.logger.log('Initializing fraud detection rules');
        try {
            this.loadFraudRules();
            this.loadBlacklistedMerchants();
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
        }
        catch (error) {
            this.logger.error('Failed to initialize fraud detection:', error);
            throw error;
        }
    }
    async analyzeTransaction(transaction, account) {
        try {
            const startTime = Date.now();
            const context = await this.buildFraudContext(transaction, account);
            const fraudScore = await this.calculateFraudScore(context);
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
            if (fraudScore > 70) {
                await this.createFraudAlert(transaction, account, fraudScore, context);
            }
            return fraudScore;
        }
        catch (error) {
            this.logger.error(`Failed to analyze transaction ${transaction.id}:`, error);
            return 0;
        }
    }
    loadFraudRules() {
        this.fraudRules = [
            {
                id: 'unusual_amount',
                name: 'Unusual Transaction Amount',
                type: 'amount',
                enabled: true,
                threshold: 3.0,
                severity: 'medium',
                description: 'Transaction amount significantly higher than usual',
                weight: 25,
            },
            {
                id: 'velocity_check',
                name: 'High Transaction Velocity',
                type: 'velocity',
                enabled: true,
                threshold: 5,
                severity: 'high',
                description: 'Too many transactions in short time period',
                weight: 30,
            },
            {
                id: 'off_hours_transaction',
                name: 'Off-Hours Transaction',
                type: 'time',
                enabled: true,
                threshold: 0.1,
                severity: 'low',
                description: 'Transaction at unusual time',
                weight: 10,
            },
            {
                id: 'unusual_location',
                name: 'Unusual Transaction Location',
                type: 'location',
                enabled: true,
                threshold: 100,
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
                threshold: 0.95,
                severity: 'high',
                description: 'Very similar transaction detected recently',
                weight: 35,
            },
            {
                id: 'round_amount_pattern',
                name: 'Round Amount Pattern',
                type: 'pattern',
                enabled: true,
                threshold: 3,
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
                threshold: 1000,
                severity: 'low',
                description: 'Large online/phone transaction',
                weight: 12,
            },
            {
                id: 'spending_surge',
                name: 'Sudden Spending Surge',
                type: 'pattern',
                enabled: true,
                threshold: 5.0,
                severity: 'high',
                description: 'Daily spending much higher than normal',
                weight: 28,
            },
        ];
        this.logger.log(`Loaded ${this.fraudRules.length} fraud detection rules`);
    }
    loadBlacklistedMerchants() {
        this.blacklistedMerchants = [
            'FRAUDULENT MERCHANT',
            'SCAM COMPANY',
            'FAKE STORE',
            'PHISHING SITE',
        ];
        this.logger.log(`Loaded ${this.blacklistedMerchants.length} blacklisted merchants`);
    }
    loadHighRiskLocations() {
        this.highRiskLocations = [
            {
                city: 'Unknown',
                province: 'Unknown',
                country: 'Nigeria',
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
        ];
        this.logger.log(`Loaded ${this.highRiskLocations.length} high-risk locations`);
    }
    async buildFraudContext(transaction, account) {
        const recentTransactions = await this.getRecentTransactions(account.id, 30);
        const userProfile = this.buildUserProfile(account.id.split('_')[0], recentTransactions);
        return {
            transaction,
            account,
            recentTransactions,
            userProfile,
        };
    }
    async calculateFraudScore(context) {
        let totalScore = 0;
        let totalWeight = 0;
        const ruleResults = {};
        for (const rule of this.fraudRules) {
            if (!rule.enabled)
                continue;
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
        const normalizedScore = totalWeight > 0 ? Math.min(100, (totalScore / totalWeight)) : 0;
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
    async checkAmountAnomaly(context, rule) {
        const { transaction, userProfile } = context;
        const amount = Math.abs(transaction.amount);
        const avgAmount = userProfile.averageTransactionAmount || 0;
        if (avgAmount === 0)
            return 0;
        const recentAmounts = context.recentTransactions.map(t => Math.abs(t.amount));
        const variance = recentAmounts.reduce((sum, amt) => sum + Math.pow(amt - avgAmount, 2), 0) / recentAmounts.length;
        const stdDev = Math.sqrt(variance);
        if (stdDev === 0)
            return 0;
        const zScore = (amount - avgAmount) / stdDev;
        if (zScore > rule.threshold) {
            return Math.min(100, (zScore / rule.threshold) * 100);
        }
        return 0;
    }
    async checkVelocityAnomaly(context, rule) {
        const { transaction, recentTransactions } = context;
        const now = transaction.date;
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const recentHourTransactions = recentTransactions.filter(t => t.date >= oneHourAgo);
        if (recentHourTransactions.length >= rule.threshold) {
            return 100;
        }
        const totalAmount = recentHourTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        if (totalAmount > 10000) {
            return 80;
        }
        return 0;
    }
    async checkTimeAnomaly(context, rule) {
        const { transaction, userProfile } = context;
        const hour = transaction.date.getHours();
        const typicalHours = userProfile.typicalTransactionTimes || [];
        if (typicalHours.length === 0)
            return 0;
        const isTypicalTime = typicalHours.some(typicalHour => Math.abs(hour - typicalHour) <= 2);
        if (!isTypicalTime) {
            if (hour >= 2 && hour <= 6) {
                return 70;
            }
            return 30;
        }
        return 0;
    }
    async checkLocationAnomaly(context, rule) {
        const { transaction, userProfile } = context;
        if (!transaction.location)
            return 0;
        if (transaction.location.country !== 'South Africa') {
            const riskLocation = this.highRiskLocations.find(loc => loc.country === transaction.location.country);
            if (riskLocation) {
                return riskLocation.riskScore;
            }
            return 50;
        }
        const commonLocations = userProfile.commonLocations || [];
        const isKnownLocation = commonLocations.some(loc => loc.toLowerCase().includes(transaction.location.city.toLowerCase()));
        if (!isKnownLocation) {
            return 40;
        }
        return 0;
    }
    async checkMerchantRisk(context, rule) {
        const { transaction } = context;
        if (!transaction.merchant)
            return 0;
        const isBlacklisted = this.blacklistedMerchants.some(merchant => transaction.merchant.name.toLowerCase().includes(merchant.toLowerCase()));
        if (isBlacklisted) {
            return 100;
        }
        const merchantName = transaction.merchant.name.toLowerCase();
        const suspiciousPatterns = ['test', 'temp', 'xxx', '123', 'fake', 'scam'];
        const hasSuspiciousPattern = suspiciousPatterns.some(pattern => merchantName.includes(pattern));
        if (hasSuspiciousPattern) {
            return 60;
        }
        return 0;
    }
    async checkPatternAnomaly(context, rule) {
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
    checkDuplicateTransaction(transaction, recentTransactions) {
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
    checkRoundAmountPattern(transaction, recentTransactions) {
        const amount = Math.abs(transaction.amount);
        if (amount % 100 !== 0)
            return 0;
        const recentRoundAmounts = recentTransactions
            .slice(0, 5)
            .filter(t => Math.abs(t.amount) % 100 === 0);
        if (recentRoundAmounts.length >= 3) {
            return 50;
        }
        return 0;
    }
    checkCardNotPresent(transaction, rule) {
        if (transaction.paymentMethod === 'online' && Math.abs(transaction.amount) > rule.threshold) {
            return 40;
        }
        return 0;
    }
    checkSpendingSurge(transaction, recentTransactions) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTransactions = recentTransactions.filter(t => {
            const txnDate = new Date(t.date);
            txnDate.setHours(0, 0, 0, 0);
            return txnDate.getTime() === today.getTime() && t.type === 'debit';
        });
        const todaySpending = todayTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const last30Days = recentTransactions.filter(t => t.date >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && t.type === 'debit');
        if (last30Days.length === 0)
            return 0;
        const avgDailySpending = last30Days.reduce((sum, t) => sum + Math.abs(t.amount), 0) / 30;
        if (avgDailySpending > 0 && todaySpending > avgDailySpending * 5) {
            return 80;
        }
        return 0;
    }
    async createFraudAlert(transaction, account, fraudScore, context) {
        const alert = {
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
    async getRecentTransactions(accountId, days) {
        return [];
    }
    buildUserProfile(userId, recentTransactions) {
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
        const merchantCounts = new Map();
        const locationCounts = new Map();
        const hourCounts = new Map();
        const categorySpending = new Map();
        for (const txn of recentTransactions) {
            if (txn.merchant) {
                const count = merchantCounts.get(txn.merchant.name) || 0;
                merchantCounts.set(txn.merchant.name, count + 1);
            }
            if (txn.location) {
                const location = `${txn.location.city}, ${txn.location.province}`;
                const count = locationCounts.get(location) || 0;
                locationCounts.set(location, count + 1);
            }
            const hour = txn.date.getHours();
            const count = hourCounts.get(hour) || 0;
            hourCounts.set(hour, count + 1);
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
    determineFraudType(context) {
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
    determineSeverity(fraudScore) {
        if (fraudScore >= 90)
            return 'critical';
        if (fraudScore >= 80)
            return 'high';
        if (fraudScore >= 60)
            return 'medium';
        return 'low';
    }
    getTriggeredRules(context) {
        return ['high_fraud_score'];
    }
    async getActiveAlertsCount(userId) {
        let totalAlerts = 0;
        for (const alerts of this.activeAlerts.values()) {
            totalAlerts += alerts.filter(alert => alert.status === 'open').length;
        }
        return totalAlerts;
    }
    async getAccountAlerts(accountId) {
        return this.activeAlerts.get(accountId) || [];
    }
    async resolveAlert(alertId, resolution) {
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
    getFraudRules() {
        return this.fraudRules;
    }
    async updateFraudRule(ruleId, updates) {
        const rule = this.fraudRules.find(r => r.id === ruleId);
        if (rule) {
            Object.assign(rule, updates);
            this.advancedLogger.logSecurity(`Fraud rule updated: ${ruleId}`, {
                operation: 'fraud_rule_update',
                metadata: { ruleId, updates },
            });
        }
    }
};
exports.FraudDetectionService = FraudDetectionService;
exports.FraudDetectionService = FraudDetectionService = FraudDetectionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        advanced_logger_service_1.AdvancedLoggerService])
], FraudDetectionService);
//# sourceMappingURL=fraud-detection.service.js.map