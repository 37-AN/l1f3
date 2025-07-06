import { LoggerService } from '../../common/logger/logger.service';
export interface GoogleDriveConfig {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    folderId: string;
}
export interface FileOperationResult {
    success: boolean;
    fileId?: string;
    fileName?: string;
    error?: string;
    metadata?: any;
}
export interface DailyBriefingData {
    date: string;
    netWorth: number;
    dailyRevenue: number;
    goalProgress: number;
    transactions: any[];
    businessMetrics: any;
}
export declare class GoogleDriveService {
    private readonly logger;
    private drive;
    private readonly targetFolderId;
    constructor(logger: LoggerService);
    private initializeGoogleDrive;
    createDailyBriefing(briefingData: DailyBriefingData): Promise<FileOperationResult>;
    saveFinancialReport(reportData: any, reportType: string): Promise<FileOperationResult>;
    save43V3RMetrics(metricsData: any): Promise<FileOperationResult>;
    backupFinancialData(backupData: any): Promise<FileOperationResult>;
    listFiles(folderId?: string): Promise<any[]>;
    downloadFile(fileId: string): Promise<any>;
    deleteFile(fileId: string): Promise<boolean>;
    syncFinancialData(financialData: any): Promise<FileOperationResult>;
    automatedDailyBriefing(): Promise<void>;
    automatedWeeklyBackup(): Promise<void>;
    createLIF3FolderStructure(): Promise<boolean>;
    getSyncStatus(): Promise<any>;
    private getCurrentFinancialData;
    private generateDailyBriefingContent;
}
