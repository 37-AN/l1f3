import { GoogleDriveService, DailyBriefingData, FileOperationResult } from './google-drive.service';
export declare class GoogleDriveController {
    private readonly googleDriveService;
    constructor(googleDriveService: GoogleDriveService);
    syncFinancialData(financialData: any): Promise<FileOperationResult>;
    getSyncStatus(): Promise<any>;
    createDailyBriefing(briefingData: DailyBriefingData): Promise<FileOperationResult>;
    listFiles(): Promise<any[]>;
    createFolderStructure(): Promise<{
        success: boolean;
    }>;
    createBackup(backupData: any): Promise<FileOperationResult>;
    saveFinancialReport(reportData: {
        data: any;
        type: string;
    }): Promise<FileOperationResult>;
    save43V3RMetrics(metricsData: any): Promise<FileOperationResult>;
    downloadFile(fileId: string): Promise<any>;
    testDailyBriefing(): Promise<FileOperationResult>;
}
