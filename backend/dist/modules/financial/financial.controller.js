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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessController = exports.FinancialController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const financial_service_1 = require("./financial.service");
const logging_interceptor_1 = require("../../common/interceptors/logging.interceptor");
const audit_log_guard_1 = require("../../common/guards/audit-log.guard");
const audit_log_decorator_1 = require("../../common/decorators/audit-log.decorator");
let FinancialController = class FinancialController {
    constructor(financialService) {
        this.financialService = financialService;
    }
    async getDashboard(req) {
        const userId = req.user?.id || 'ethan_barnes';
        const netWorth = await this.financialService.calculateNetWorth(userId);
        return {
            user: {
                id: userId,
                name: 'Ethan Barnes',
                email: 'ethan@43v3r.ai'
            },
            netWorth,
            summary: {
                totalNetWorth: netWorth.current,
                targetNetWorth: netWorth.target,
                progressPercent: netWorth.progress,
                remainingToTarget: netWorth.target - netWorth.current,
                monthsToTarget: Math.ceil((netWorth.target - netWorth.current) / 15000)
            },
            accounts: [
                { id: 'liquid', name: 'Liquid Cash', balance: netWorth.liquidCash, currency: 'ZAR' },
                { id: 'investments', name: 'Investments', balance: netWorth.investments, currency: 'ZAR' },
                { id: 'business', name: '43V3R Business Equity', balance: netWorth.businessEquity, currency: 'ZAR' }
            ],
            businessMetrics: {
                dailyRevenueTarget: 4881,
                currentDailyRevenue: 0,
                mrrTarget: 147917,
                currentMRR: 0,
                revenueProgress: 0
            },
            goals: [
                {
                    id: 'net_worth_goal',
                    name: 'Net Worth Target',
                    target: netWorth.target,
                    current: netWorth.current,
                    progress: netWorth.progress,
                    deadline: '2025-12-31'
                }
            ]
        };
    }
    async createTransaction(dto, req) {
        const userId = req.user?.id || 'ethan_barnes';
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];
        return await this.financialService.createTransaction(userId, dto, ipAddress, userAgent);
    }
    async updateAccountBalance(accountId, dto, req) {
        const userId = req.user?.id || 'ethan_barnes';
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];
        return await this.financialService.updateAccountBalance(userId, { ...dto, accountId }, ipAddress, userAgent);
    }
    async getNetWorth(req) {
        const userId = req.user?.id || 'ethan_barnes';
        return await this.financialService.calculateNetWorth(userId);
    }
    async getGoals(req) {
        const userId = req.user?.id || 'ethan_barnes';
        const netWorth = await this.financialService.calculateNetWorth(userId);
        return [
            {
                id: 'net_worth_goal',
                name: 'Net Worth Target - R1.8M',
                type: 'NET_WORTH',
                target: netWorth.target,
                current: netWorth.current,
                progress: netWorth.progress,
                deadline: '2025-12-31',
                priority: 'HIGH'
            },
            {
                id: 'daily_revenue_goal',
                name: '43V3R Daily Revenue - R4,881',
                type: 'BUSINESS_REVENUE',
                target: 4881,
                current: 0,
                progress: 0,
                deadline: '2025-01-31',
                priority: 'HIGH'
            },
            {
                id: 'mrr_goal',
                name: '43V3R Monthly Recurring Revenue - R147,917',
                type: 'BUSINESS_MRR',
                target: 147917,
                current: 0,
                progress: 0,
                deadline: '2025-06-30',
                priority: 'HIGH'
            }
        ];
    }
    async getNetWorthTrend(req) {
        const userId = req.user?.id || 'ethan_barnes';
        return {
            trend: 'POSITIVE',
            averageMonthlyGrowth: 15000,
            projectedTargetDate: '2025-12-31',
            milestones: [
                { amount: 500000, date: '2025-03-31', achieved: false },
                { amount: 1000000, date: '2025-08-31', achieved: false },
                { amount: 1500000, date: '2025-11-30', achieved: false },
                { amount: 1800000, date: '2025-12-31', achieved: false }
            ]
        };
    }
    async get43V3RMetrics(req) {
        return {
            revenue: {
                daily: { current: 0, target: 4881, progress: 0 },
                monthly: { current: 0, target: 147917, progress: 0 },
                quarterly: { current: 0, target: 443751, progress: 0 }
            },
            customers: {
                total: 0,
                active: 0,
                churn: 0,
                acquisition: 0
            },
            pipeline: {
                value: 0,
                deals: 0,
                conversion: 0
            },
            growth: {
                rate: 0,
                projection: 'AGGRESSIVE',
                targetAchievement: 0
            }
        };
    }
};
exports.FinancialController = FinancialController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get complete financial overview in ZAR' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Financial dashboard data' }),
    (0, common_1.UseGuards)(audit_log_guard_1.AuditLogGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Post)('transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new transaction' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Transaction created successfully' }),
    (0, common_1.UseGuards)(audit_log_guard_1.AuditLogGuard),
    (0, audit_log_decorator_1.LogFinancialTransaction)('New financial transaction created'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "createTransaction", null);
__decorate([
    (0, common_1.Put)('accounts/:id/balance'),
    (0, swagger_1.ApiOperation)({ summary: 'Update account balance' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Account balance updated successfully' }),
    (0, common_1.UseGuards)(audit_log_guard_1.AuditLogGuard),
    (0, audit_log_decorator_1.LogAccountUpdate)('Account balance updated'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "updateAccountBalance", null);
__decorate([
    (0, common_1.Get)('net-worth'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate current net worth' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Net worth calculation' }),
    (0, common_1.UseGuards)(audit_log_guard_1.AuditLogGuard),
    (0, audit_log_decorator_1.LogGoalProgress)('Net worth calculation requested'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "getNetWorth", null);
__decorate([
    (0, common_1.Get)('goals'),
    (0, swagger_1.ApiOperation)({ summary: 'List personal and business goals' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Goals list' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "getGoals", null);
__decorate([
    (0, common_1.Get)('analytics/net-worth-trend'),
    (0, swagger_1.ApiOperation)({ summary: 'Net worth progression analysis' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Net worth trend data' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "getNetWorthTrend", null);
__decorate([
    (0, common_1.Get)('analytics/43v3r-metrics'),
    (0, swagger_1.ApiOperation)({ summary: '43V3R business performance metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Business metrics data' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "get43V3RMetrics", null);
exports.FinancialController = FinancialController = __decorate([
    (0, swagger_1.ApiTags)('Financial'),
    (0, common_1.Controller)('financial'),
    (0, common_1.UseInterceptors)(logging_interceptor_1.LoggingInterceptor),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [financial_service_1.FinancialService])
], FinancialController);
let BusinessController = class BusinessController {
    constructor(financialService) {
        this.financialService = financialService;
    }
    async logRevenue(dto) {
        return await this.financialService.log43V3RRevenue(dto.amount, dto.source, dto.description);
    }
    async updateMRR(dto) {
        return await this.financialService.updateMRRProgress(dto.currentMRR);
    }
    async getMetrics() {
        return {
            company: '43V3R',
            metrics: {
                dailyRevenue: { current: 0, target: 4881, progress: 0 },
                mrr: { current: 0, target: 147917, progress: 0 },
                customers: { total: 0, active: 0, churn: 0 },
                pipeline: { value: 0, deals: 0, conversion: 0 }
            },
            goals: [
                { metric: 'Daily Revenue', target: 4881, current: 0, priority: 'HIGH' },
                { metric: 'MRR', target: 147917, current: 0, priority: 'HIGH' },
                { metric: 'Customer Acquisition', target: 100, current: 0, priority: 'MEDIUM' }
            ]
        };
    }
};
exports.BusinessController = BusinessController;
__decorate([
    (0, common_1.Post)('revenue'),
    (0, swagger_1.ApiOperation)({ summary: 'Log 43V3R business revenue' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Revenue logged successfully' }),
    (0, common_1.UseGuards)(audit_log_guard_1.AuditLogGuard),
    (0, audit_log_decorator_1.LogBusinessMetric)('43V3R revenue logged'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "logRevenue", null);
__decorate([
    (0, common_1.Put)('mrr'),
    (0, swagger_1.ApiOperation)({ summary: 'Update Monthly Recurring Revenue' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'MRR updated successfully' }),
    (0, common_1.UseGuards)(audit_log_guard_1.AuditLogGuard),
    (0, audit_log_decorator_1.LogBusinessMetric)('43V3R MRR updated'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "updateMRR", null);
__decorate([
    (0, common_1.Get)('metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get 43V3R business KPIs' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Business metrics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "getMetrics", null);
exports.BusinessController = BusinessController = __decorate([
    (0, common_1.Controller)('business'),
    (0, common_1.UseInterceptors)(logging_interceptor_1.LoggingInterceptor),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [financial_service_1.FinancialService])
], BusinessController);
//# sourceMappingURL=financial.controller.js.map