"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedFreshStart = seedFreshStart;
const user_entity_1 = require("../entities/user.entity");
const account_entity_1 = require("../entities/account.entity");
const goal_entity_1 = require("../entities/goal.entity");
const business_metrics_entity_1 = require("../entities/business-metrics.entity");
const net_worth_snapshot_entity_1 = require("../entities/net-worth-snapshot.entity");
const enums_1 = require("../entities/enums");
const bcrypt = __importStar(require("bcryptjs"));
async function seedFreshStart(dataSource) {
    console.log('🌱 Starting LIF3 Fresh Start Database Seeding...');
    const userRepository = dataSource.getRepository(user_entity_1.User);
    const accountRepository = dataSource.getRepository(account_entity_1.Account);
    const goalRepository = dataSource.getRepository(goal_entity_1.Goal);
    const businessMetricsRepository = dataSource.getRepository(business_metrics_entity_1.BusinessMetrics);
    const netWorthSnapshotRepository = dataSource.getRepository(net_worth_snapshot_entity_1.NetWorthSnapshot);
    await businessMetricsRepository.clear();
    await netWorthSnapshotRepository.clear();
    await goalRepository.clear();
    await accountRepository.clear();
    await userRepository.clear();
    console.log('🔄 Cleared existing data for fresh start');
    const hashedPassword = await bcrypt.hash('lif3_secure_pass', 10);
    const user = userRepository.create({
        email: 'ethan@43v3r.ai',
        firstName: 'Ethan',
        lastName: 'Barnes',
        password: hashedPassword,
        role: enums_1.UserRole.ADMIN,
        isActive: true,
        netWorth: 0,
        liquidCash: 0,
        investments: 0,
        businessEquity: 0,
        targetNetWorth: 1800000,
        preferences: {
            currency: enums_1.Currency.ZAR,
            theme: enums_1.Theme.DARK,
            notifications: true,
            timezone: 'Africa/Johannesburg',
        },
    });
    const savedUser = await userRepository.save(user);
    console.log('👤 Created Ethan Barnes user with R0 starting values');
    const accounts = [
        {
            name: 'FNB Cheque Account',
            type: enums_1.AccountType.CHECKING,
            provider: enums_1.AccountProvider.FNB,
            accountNumber: '1234567890',
            currency: enums_1.Currency.ZAR,
            currentBalance: 0,
            availableBalance: 0,
            isActive: true,
            isConnected: false,
            userId: savedUser.id,
        },
        {
            name: 'FNB Savings Account',
            type: enums_1.AccountType.SAVINGS,
            provider: enums_1.AccountProvider.FNB,
            accountNumber: '0987654321',
            currency: enums_1.Currency.ZAR,
            currentBalance: 0,
            availableBalance: 0,
            isActive: true,
            isConnected: false,
            userId: savedUser.id,
        },
        {
            name: 'Easy Equities',
            type: enums_1.AccountType.INVESTMENT,
            provider: enums_1.AccountProvider.EASY_EQUITIES,
            currency: enums_1.Currency.ZAR,
            currentBalance: 0,
            availableBalance: 0,
            isActive: true,
            isConnected: false,
            userId: savedUser.id,
        },
        {
            name: '43V3R Business Account',
            type: enums_1.AccountType.BUSINESS,
            provider: enums_1.AccountProvider.MANUAL,
            currency: enums_1.Currency.ZAR,
            currentBalance: 0,
            availableBalance: 0,
            isActive: true,
            isConnected: false,
            userId: savedUser.id,
        },
    ];
    const savedAccounts = await accountRepository.save(accounts);
    console.log('🏦 Created 4 accounts with R0 balances');
    const goals = [
        {
            name: 'Net Worth R1.8M Goal',
            description: 'Fresh start journey from R0 to R1,800,000 net worth in 18 months',
            type: goal_entity_1.GoalType.NET_WORTH,
            targetAmount: 1800000,
            currentAmount: 0,
            currency: enums_1.Currency.ZAR,
            deadline: new Date('2026-12-31'),
            status: goal_entity_1.GoalStatus.ACTIVE,
            priority: goal_entity_1.GoalPriority.CRITICAL,
            monthlyTarget: 100000,
            weeklyTarget: 25000,
            dailyTarget: 3571,
            userId: savedUser.id,
            notes: 'Ultimate 18-month wealth building goal starting from absolute zero',
        },
        {
            name: 'Emergency Fund R50,000',
            description: 'First major milestone - Emergency fund of R50,000',
            type: goal_entity_1.GoalType.EMERGENCY_FUND,
            targetAmount: 50000,
            currentAmount: 0,
            currency: enums_1.Currency.ZAR,
            deadline: new Date('2025-10-06'),
            status: goal_entity_1.GoalStatus.ACTIVE,
            priority: goal_entity_1.GoalPriority.HIGH,
            monthlyTarget: 16667,
            weeklyTarget: 4167,
            dailyTarget: 595,
            userId: savedUser.id,
            notes: 'Critical first milestone - financial security foundation',
        },
        {
            name: '43V3R Daily Revenue R4,881',
            description: '43V3R business daily revenue target',
            type: goal_entity_1.GoalType.BUSINESS_REVENUE,
            targetAmount: 4881,
            currentAmount: 0,
            currency: enums_1.Currency.ZAR,
            deadline: new Date('2025-12-31'),
            status: goal_entity_1.GoalStatus.ACTIVE,
            priority: goal_entity_1.GoalPriority.HIGH,
            monthlyTarget: 147917,
            weeklyTarget: 34167,
            dailyTarget: 4881,
            userId: savedUser.id,
            notes: 'AI + Web3 + Crypto + Quantum business daily revenue target',
        },
        {
            name: 'Investment Portfolio R200,000',
            description: 'Build diversified investment portfolio',
            type: goal_entity_1.GoalType.INVESTMENT,
            targetAmount: 200000,
            currentAmount: 0,
            currency: enums_1.Currency.ZAR,
            deadline: new Date('2026-06-30'),
            status: goal_entity_1.GoalStatus.ACTIVE,
            priority: goal_entity_1.GoalPriority.MEDIUM,
            monthlyTarget: 18182,
            weeklyTarget: 4545,
            dailyTarget: 649,
            userId: savedUser.id,
            notes: 'Long-term wealth building through diversified investments',
        },
    ];
    const savedGoals = await goalRepository.save(goals);
    console.log('🎯 Created 4 fresh start goals');
    const businessMetrics = businessMetricsRepository.create({
        businessName: '43V3R',
        date: new Date(),
        dailyRevenue: 0,
        monthlyRecurringRevenue: 0,
        pipelineValue: 0,
        activeUsers: 0,
        activeClients: 0,
        monthlyExpenses: 0,
        netProfit: 0,
        targetDailyRevenue: 4881,
        targetMonthlyRevenue: 147917,
        stage: business_metrics_entity_1.BusinessStage.FOUNDATION,
        currency: enums_1.Currency.ZAR,
        metrics: {
            conversionRate: 0,
            customerAcquisitionCost: 0,
            lifetimeValue: 0,
            churnRate: 0,
            growthRate: 0,
            burnRate: 0,
            runway: 0,
        },
        serviceBreakdown: {
            ai: 0,
            web3: 0,
            crypto: 0,
            quantum: 0,
            consulting: 0,
            other: 0,
        },
        userId: savedUser.id,
        notes: 'Day 1 - Foundation building phase for 43V3R AI business',
    });
    const savedBusinessMetrics = await businessMetricsRepository.save(businessMetrics);
    console.log('📊 Created 43V3R business metrics starting from R0');
    const netWorthSnapshot = netWorthSnapshotRepository.create({
        netWorth: 0,
        liquidCash: 0,
        investments: 0,
        businessEquity: 0,
        totalAssets: 0,
        totalLiabilities: 0,
        targetNetWorth: 1800000,
        progressPercentage: 0,
        currency: enums_1.Currency.ZAR,
        breakdown: {
            accounts: savedAccounts.map(account => ({
                accountId: account.id,
                accountName: account.name,
                balance: 0,
            })),
            investments: [],
            business: {
                dailyRevenue: 0,
                mrr: 0,
                valuation: 0,
            },
        },
        userId: savedUser.id,
        notes: 'Fresh start baseline - beginning the journey from R0 to R1,800,000',
    });
    const savedSnapshot = await netWorthSnapshotRepository.save(netWorthSnapshot);
    console.log('📈 Created initial net worth snapshot: R0 baseline');
    console.log('✅ Fresh Start Database Seeding Complete!');
    console.log('🎯 Ready to track journey from R0 → R1,800,000');
    console.log('🚀 43V3R business tracking initialized');
    console.log('📊 All automation systems ready for fresh start');
    return {
        user: savedUser,
        accounts: savedAccounts,
        goals: savedGoals,
        businessMetrics: savedBusinessMetrics,
        netWorthSnapshot: savedSnapshot,
    };
}
//# sourceMappingURL=fresh-start.seed.js.map