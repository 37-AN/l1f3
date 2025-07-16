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
var BankingIntegrationController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankingIntegrationController = exports.CreatePaymentDto = exports.UpdateTransactionCategoryDto = exports.ConnectBankDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const banking_integration_service_1 = require("./banking-integration.service");
const transaction_categorization_service_1 = require("./services/transaction-categorization.service");
const fraud_detection_service_1 = require("./services/fraud-detection.service");
const banking_insights_service_1 = require("./services/banking-insights.service");
const payment_service_1 = require("./services/payment.service");
const advanced_logger_service_1 = require("../../common/logger/advanced-logger.service");
class ConnectBankDto {
}
exports.ConnectBankDto = ConnectBankDto;
class UpdateTransactionCategoryDto {
}
exports.UpdateTransactionCategoryDto = UpdateTransactionCategoryDto;
class CreatePaymentDto {
}
exports.CreatePaymentDto = CreatePaymentDto;
let BankingIntegrationController = BankingIntegrationController_1 = class BankingIntegrationController {
    constructor(bankingService, categorizationService, fraudDetectionService, insightsService, paymentService, advancedLogger) {
        this.bankingService = bankingService;
        this.categorizationService = categorizationService;
        this.fraudDetectionService = fraudDetectionService;
        this.insightsService = insightsService;
        this.paymentService = paymentService;
        this.advancedLogger = advancedLogger;
        this.logger = new common_1.Logger(BankingIntegrationController_1.name);
    }
    async getSupportedBanks() {
        try {
            const banks = this.bankingService.getSouthAfricanBanks();
            return {
                success: true,
                data: banks,
                count: banks.length,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Failed to get supported banks:', error);
            throw new common_1.HttpException('Failed to retrieve supported banks', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async connectBank(dto, userId) {
        try {
            if (!userId) {
                throw new common_1.HttpException('User ID is required', common_1.HttpStatus.BAD_REQUEST);
            }
            const connection = await this.bankingService.connectBank(userId, dto.bankId, dto.connectionMethod || 'okra');
            this.advancedLogger.logFinancial(`Bank connection initiated: ${dto.bankId}`, {
                operation: 'bank_connection_api',
                userId,
                metadata: { bankId: dto.bankId, connectionMethod: dto.connectionMethod },
            });
            return {
                success: true,
                data: connection,
                message: 'Bank connection initiated successfully',
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Failed to connect bank:', error);
            throw new common_1.HttpException(error.message || 'Failed to connect bank', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getConnections(userId) {
        try {
            const connections = this.bankingService.getConnections();
            const userConnections = userId
                ? connections.filter(conn => conn.userId === userId)
                : connections;
            return {
                success: true,
                data: userConnections,
                count: userConnections.length,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Failed to get connections:', error);
            throw new common_1.HttpException('Failed to retrieve connections', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async syncAccountData(connectionId) {
        try {
            const results = await this.bankingService.syncAccountData(connectionId);
            return {
                success: true,
                data: results,
                message: 'Account data synced successfully',
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error(`Failed to sync account data for ${connectionId}:`, error);
            throw new common_1.HttpException('Failed to sync account data', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAccounts(userId) {
        try {
            const accounts = this.bankingService.getAccounts(userId);
            return {
                success: true,
                data: accounts,
                count: accounts.length,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Failed to get accounts:', error);
            throw new common_1.HttpException('Failed to retrieve accounts', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAccountTransactions(accountId, limit = '50', offset = '0') {
        try {
            const allTransactions = this.bankingService.getTransactions(accountId);
            const limitNum = parseInt(limit);
            const offsetNum = parseInt(offset);
            const transactions = allTransactions.slice(offsetNum, offsetNum + limitNum);
            return {
                success: true,
                data: transactions,
                pagination: {
                    total: allTransactions.length,
                    limit: limitNum,
                    offset: offsetNum,
                    hasMore: offsetNum + limitNum < allTransactions.length,
                },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error(`Failed to get transactions for account ${accountId}:`, error);
            throw new common_1.HttpException('Failed to retrieve transactions', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getBankingDashboard(userId) {
        try {
            if (!userId) {
                throw new common_1.HttpException('User ID is required', common_1.HttpStatus.BAD_REQUEST);
            }
            const dashboard = await this.bankingService.getBankingDashboard(userId);
            return {
                success: true,
                data: dashboard,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Failed to get banking dashboard:', error);
            throw new common_1.HttpException('Failed to retrieve dashboard', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateTransactionCategory(transactionId, dto) {
        try {
            this.advancedLogger.logFinancial(`Transaction category updated: ${transactionId}`, {
                operation: 'transaction_category_update',
                metadata: {
                    transactionId,
                    newCategory: dto.category,
                },
            });
            return {
                success: true,
                message: 'Transaction category updated successfully',
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error(`Failed to update transaction category ${transactionId}:`, error);
            throw new common_1.HttpException('Failed to update transaction category', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getCategorizationStats() {
        try {
            const stats = this.categorizationService.getCategorizationStats();
            return {
                success: true,
                data: stats,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Failed to get categorization stats:', error);
            throw new common_1.HttpException('Failed to retrieve categorization stats', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getFraudAlerts(userId, accountId) {
        try {
            if (accountId) {
                const alerts = await this.fraudDetectionService.getAccountAlerts(accountId);
                return {
                    success: true,
                    data: alerts,
                    count: alerts.length,
                    timestamp: new Date().toISOString(),
                };
            }
            const alertCount = await this.fraudDetectionService.getActiveAlertsCount(userId);
            return {
                success: true,
                data: { activeAlerts: alertCount },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Failed to get fraud alerts:', error);
            throw new common_1.HttpException('Failed to retrieve fraud alerts', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async resolveFraudAlert(alertId, body) {
        try {
            await this.fraudDetectionService.resolveAlert(alertId, body.resolution);
            return {
                success: true,
                message: 'Fraud alert resolved successfully',
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error(`Failed to resolve fraud alert ${alertId}:`, error);
            throw new common_1.HttpException('Failed to resolve fraud alert', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getFraudRules() {
        try {
            const rules = this.fraudDetectionService.getFraudRules();
            return {
                success: true,
                data: rules,
                count: rules.length,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Failed to get fraud rules:', error);
            throw new common_1.HttpException('Failed to retrieve fraud rules', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getBankingInsights(userId) {
        try {
            if (!userId) {
                throw new common_1.HttpException('User ID is required', common_1.HttpStatus.BAD_REQUEST);
            }
            const accounts = this.bankingService.getAccounts(userId);
            const allTransactions = accounts.flatMap(acc => this.bankingService.getTransactions(acc.id));
            const insights = await this.insightsService.generateInsights(userId, accounts, allTransactions);
            return {
                success: true,
                data: insights,
                count: insights.length,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Failed to get banking insights:', error);
            throw new common_1.HttpException('Failed to retrieve banking insights', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createPayment(dto) {
        try {
            const payment = await this.paymentService.createPayment({
                ...dto,
                scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : undefined,
                beneficiaryVerified: false,
                requiresOTP: true,
                fees: 7.50,
            });
            return {
                success: true,
                data: payment,
                message: 'Payment instruction created successfully',
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Failed to create payment:', error);
            throw new common_1.HttpException('Failed to create payment', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getPayments() {
        try {
            const payments = await this.paymentService.getAllPayments();
            return {
                success: true,
                data: payments,
                count: payments.length,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Failed to get payments:', error);
            throw new common_1.HttpException('Failed to retrieve payments', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getPayment(paymentId) {
        try {
            const payment = await this.paymentService.getPayment(paymentId);
            if (!payment) {
                throw new common_1.HttpException('Payment instruction not found', common_1.HttpStatus.NOT_FOUND);
            }
            return {
                success: true,
                data: payment,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error(`Failed to get payment ${paymentId}:`, error);
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException('Failed to retrieve payment', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async disconnectBank(connectionId) {
        try {
            await this.bankingService.disconnectBank(connectionId);
            return {
                success: true,
                message: 'Bank disconnected successfully',
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error(`Failed to disconnect bank ${connectionId}:`, error);
            throw new common_1.HttpException('Failed to disconnect bank', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getConnectionStatus(connectionId) {
        try {
            const connection = await this.bankingService.getConnectionStatus(connectionId);
            if (!connection) {
                throw new common_1.HttpException('Connection not found', common_1.HttpStatus.NOT_FOUND);
            }
            return {
                success: true,
                data: {
                    id: connection.id,
                    status: connection.status,
                    lastSyncAt: connection.lastSyncAt,
                    errorMessage: connection.errorMessage,
                },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error(`Failed to get connection status ${connectionId}:`, error);
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException('Failed to retrieve connection status', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.BankingIntegrationController = BankingIntegrationController;
__decorate([
    (0, common_1.Get)('banks'),
    (0, swagger_1.ApiOperation)({ summary: 'Get supported South African banks' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Banks retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BankingIntegrationController.prototype, "getSupportedBanks", null);
__decorate([
    (0, common_1.Post)('connect'),
    (0, swagger_1.ApiOperation)({ summary: 'Connect to a bank account' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bank connected successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ConnectBankDto, String]),
    __metadata("design:returntype", Promise)
], BankingIntegrationController.prototype, "connectBank", null);
__decorate([
    (0, common_1.Get)('connections'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user bank connections' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Connections retrieved successfully' }),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BankingIntegrationController.prototype, "getConnections", null);
__decorate([
    (0, common_1.Post)('sync/:connectionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Sync account data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Account data synced successfully' }),
    __param(0, (0, common_1.Param)('connectionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BankingIntegrationController.prototype, "syncAccountData", null);
__decorate([
    (0, common_1.Get)('accounts'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user bank accounts' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Accounts retrieved successfully' }),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BankingIntegrationController.prototype, "getAccounts", null);
__decorate([
    (0, common_1.Get)('accounts/:accountId/transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get account transactions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transactions retrieved successfully' }),
    __param(0, (0, common_1.Param)('accountId')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], BankingIntegrationController.prototype, "getAccountTransactions", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get banking dashboard' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard data retrieved successfully' }),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BankingIntegrationController.prototype, "getBankingDashboard", null);
__decorate([
    (0, common_1.Put)('transactions/:transactionId/category'),
    (0, swagger_1.ApiOperation)({ summary: 'Update transaction category' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction category updated successfully' }),
    __param(0, (0, common_1.Param)('transactionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateTransactionCategoryDto]),
    __metadata("design:returntype", Promise)
], BankingIntegrationController.prototype, "updateTransactionCategory", null);
__decorate([
    (0, common_1.Get)('categorization/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get categorization statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Categorization stats retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BankingIntegrationController.prototype, "getCategorizationStats", null);
__decorate([
    (0, common_1.Get)('fraud/alerts'),
    (0, swagger_1.ApiOperation)({ summary: 'Get fraud alerts' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fraud alerts retrieved successfully' }),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('accountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BankingIntegrationController.prototype, "getFraudAlerts", null);
__decorate([
    (0, common_1.Put)('fraud/alerts/:alertId/resolve'),
    (0, swagger_1.ApiOperation)({ summary: 'Resolve fraud alert' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fraud alert resolved successfully' }),
    __param(0, (0, common_1.Param)('alertId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BankingIntegrationController.prototype, "resolveFraudAlert", null);
__decorate([
    (0, common_1.Get)('fraud/rules'),
    (0, swagger_1.ApiOperation)({ summary: 'Get fraud detection rules' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fraud rules retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BankingIntegrationController.prototype, "getFraudRules", null);
__decorate([
    (0, common_1.Get)('insights'),
    (0, swagger_1.ApiOperation)({ summary: 'Get banking insights' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Banking insights retrieved successfully' }),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BankingIntegrationController.prototype, "getBankingInsights", null);
__decorate([
    (0, common_1.Post)('payments'),
    (0, swagger_1.ApiOperation)({ summary: 'Create payment instruction' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Payment instruction created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreatePaymentDto]),
    __metadata("design:returntype", Promise)
], BankingIntegrationController.prototype, "createPayment", null);
__decorate([
    (0, common_1.Get)('payments'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payment instructions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment instructions retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BankingIntegrationController.prototype, "getPayments", null);
__decorate([
    (0, common_1.Get)('payments/:paymentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payment instruction details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment instruction retrieved successfully' }),
    __param(0, (0, common_1.Param)('paymentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BankingIntegrationController.prototype, "getPayment", null);
__decorate([
    (0, common_1.Post)('disconnect/:connectionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Disconnect bank connection' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bank disconnected successfully' }),
    __param(0, (0, common_1.Param)('connectionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BankingIntegrationController.prototype, "disconnectBank", null);
__decorate([
    (0, common_1.Get)('connections/:connectionId/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get connection status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Connection status retrieved successfully' }),
    __param(0, (0, common_1.Param)('connectionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BankingIntegrationController.prototype, "getConnectionStatus", null);
exports.BankingIntegrationController = BankingIntegrationController = BankingIntegrationController_1 = __decorate([
    (0, swagger_1.ApiTags)('Banking Integration'),
    (0, common_1.Controller)('api/banking'),
    __metadata("design:paramtypes", [banking_integration_service_1.BankingIntegrationService,
        transaction_categorization_service_1.TransactionCategorizationService,
        fraud_detection_service_1.FraudDetectionService,
        banking_insights_service_1.BankingInsightsService,
        payment_service_1.PaymentService,
        advanced_logger_service_1.AdvancedLoggerService])
], BankingIntegrationController);
//# sourceMappingURL=banking-integration.controller.js.map