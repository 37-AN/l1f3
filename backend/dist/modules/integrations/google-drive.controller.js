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
exports.GoogleDriveController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const google_drive_service_1 = require("./google-drive.service");
const logging_interceptor_1 = require("../../common/interceptors/logging.interceptor");
const audit_log_guard_1 = require("../../common/guards/audit-log.guard");
const audit_log_decorator_1 = require("../../common/decorators/audit-log.decorator");
let GoogleDriveController = class GoogleDriveController {
    constructor(googleDriveService) {
        this.googleDriveService = googleDriveService;
    }
    async syncFinancialData(financialData) {
        return await this.googleDriveService.syncFinancialData(financialData);
    }
    async getSyncStatus() {
        return await this.googleDriveService.getSyncStatus();
    }
    async createDailyBriefing(briefingData) {
        return await this.googleDriveService.createDailyBriefing(briefingData);
    }
    async listFiles() {
        return await this.googleDriveService.listFiles();
    }
    async createFolderStructure() {
        const success = await this.googleDriveService.createLIF3FreshStartFolderStructure();
        return { success };
    }
    async createBackup(backupData) {
        return await this.googleDriveService.backupFinancialData({
            ...backupData,
            backupType: 'MANUAL',
            timestamp: new Date().toISOString()
        });
    }
    async saveFinancialReport(reportData) {
        return await this.googleDriveService.saveFinancialReport(reportData.data, reportData.type);
    }
    async save43V3RMetrics(metricsData) {
        return await this.googleDriveService.save43V3RMetrics(metricsData);
    }
    async downloadFile(fileId) {
        return await this.googleDriveService.downloadFile(fileId);
    }
    async testDailyBriefing() {
        const testData = {
            date: new Date().toISOString().split('T')[0],
            netWorth: 239625,
            dailyRevenue: 0,
            goalProgress: (239625 / 1800000) * 100,
            transactions: [
                { description: 'Salary', amount: 85000, type: 'CREDIT', date: new Date() },
                { description: 'Rent', amount: -18000, type: 'DEBIT', date: new Date() },
                { description: 'Groceries', amount: -3200, type: 'DEBIT', date: new Date() }
            ],
            businessMetrics: {
                dailyRevenue: 0,
                mrr: 0,
                weeklyTarget: 34167,
                monthlyTarget: 147917,
                businessName: '43V3R',
                industry: 'AI_WEB3_CRYPTO',
                location: 'CAPE_TOWN_SA'
            }
        };
        return await this.googleDriveService.createDailyBriefing(testData);
    }
};
exports.GoogleDriveController = GoogleDriveController;
__decorate([
    (0, common_1.Post)('sync'),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger manual financial data sync to Google Drive' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sync completed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Sync failed' }),
    (0, common_1.UseGuards)(audit_log_guard_1.AuditLogGuard),
    (0, audit_log_decorator_1.LogIntegrationEvent)('Manual Google Drive sync triggered'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GoogleDriveController.prototype, "syncFinancialData", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Google Drive connection and sync status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Status retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GoogleDriveController.prototype, "getSyncStatus", null);
__decorate([
    (0, common_1.Post)('create-briefing'),
    (0, swagger_1.ApiOperation)({ summary: 'Create daily briefing document in Google Drive' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Daily briefing created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Briefing creation failed' }),
    (0, common_1.UseGuards)(audit_log_guard_1.AuditLogGuard),
    (0, audit_log_decorator_1.LogIntegrationEvent)('Manual daily briefing creation'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GoogleDriveController.prototype, "createDailyBriefing", null);
__decorate([
    (0, common_1.Get)('files'),
    (0, swagger_1.ApiOperation)({ summary: 'List all files in the LIF3 Google Drive folder' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Files listed successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GoogleDriveController.prototype, "listFiles", null);
__decorate([
    (0, common_1.Post)('create-folders'),
    (0, swagger_1.ApiOperation)({ summary: 'Create LIF3 folder structure in Google Drive' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Folder structure created successfully' }),
    (0, common_1.UseGuards)(audit_log_guard_1.AuditLogGuard),
    (0, audit_log_decorator_1.LogIntegrationEvent)('LIF3 folder structure creation'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GoogleDriveController.prototype, "createFolderStructure", null);
__decorate([
    (0, common_1.Post)('backup'),
    (0, swagger_1.ApiOperation)({ summary: 'Create manual backup of financial data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Backup created successfully' }),
    (0, common_1.UseGuards)(audit_log_guard_1.AuditLogGuard),
    (0, audit_log_decorator_1.LogIntegrationEvent)('Manual financial data backup'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GoogleDriveController.prototype, "createBackup", null);
__decorate([
    (0, common_1.Post)('save-report'),
    (0, swagger_1.ApiOperation)({ summary: 'Save financial report to Google Drive' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Report saved successfully' }),
    (0, common_1.UseGuards)(audit_log_guard_1.AuditLogGuard),
    (0, audit_log_decorator_1.LogIntegrationEvent)('Financial report saved to Google Drive'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GoogleDriveController.prototype, "saveFinancialReport", null);
__decorate([
    (0, common_1.Post)('save-43v3r-metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Save 43V3R business metrics to Google Drive' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '43V3R metrics saved successfully' }),
    (0, common_1.UseGuards)(audit_log_guard_1.AuditLogGuard),
    (0, audit_log_decorator_1.LogIntegrationEvent)('43V3R metrics saved to Google Drive'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GoogleDriveController.prototype, "save43V3RMetrics", null);
__decorate([
    (0, common_1.Get)('download/:fileId'),
    (0, swagger_1.ApiOperation)({ summary: 'Download file from Google Drive by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File downloaded successfully' }),
    __param(0, (0, common_1.Param)('fileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GoogleDriveController.prototype, "downloadFile", null);
__decorate([
    (0, common_1.Post)('test-briefing'),
    (0, swagger_1.ApiOperation)({ summary: 'Test daily briefing generation with current data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Test briefing created successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GoogleDriveController.prototype, "testDailyBriefing", null);
exports.GoogleDriveController = GoogleDriveController = __decorate([
    (0, swagger_1.ApiTags)('Google Drive Integration'),
    (0, common_1.Controller)('integrations/google-drive'),
    (0, common_1.UseInterceptors)(logging_interceptor_1.LoggingInterceptor),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [google_drive_service_1.GoogleDriveService])
], GoogleDriveController);
//# sourceMappingURL=google-drive.controller.js.map