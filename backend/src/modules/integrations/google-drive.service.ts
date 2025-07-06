import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { LoggerService } from '../../common/logger/logger.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as path from 'path';
import * as fs from 'fs/promises';

export interface GoogleDriveConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  folderId: string; // 1dD8C1e1hkcCPdtlqA3nsxJYWVvilV5Io
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

@Injectable()
export class GoogleDriveService {
  private drive: any;
  private readonly targetFolderId = '1dD8C1e1hkcCPdtlqA3nsxJYWVvilV5Io';

  constructor(private readonly logger: LoggerService) {
    this.initializeGoogleDrive();
  }

  private async initializeGoogleDrive() {
    try {
      const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      auth.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      });

      this.drive = google.drive({ version: 'v3', auth });

      this.logger.logIntegration({
        service: 'GOOGLE_DRIVE',
        action: 'CONNECT',
        status: 'SUCCESS',
        timestamp: new Date(),
        metadata: {
          folderId: this.targetFolderId,
          initialized: true
        }
      });

      this.logger.log('Google Drive service initialized successfully', 'GoogleDriveService');
    } catch (error) {
      this.logger.error(`Failed to initialize Google Drive: ${error.message}`, error.stack, 'GoogleDriveService');
      
      this.logger.logIntegration({
        service: 'GOOGLE_DRIVE',
        action: 'CONNECT',
        status: 'FAILED',
        errorMessage: error.message,
        timestamp: new Date(),
        metadata: {
          folderId: this.targetFolderId,
          initialized: false
        }
      });
    }
  }

  async createDailyBriefing(briefingData: DailyBriefingData): Promise<FileOperationResult> {
    const startTime = Date.now();
    
    try {
      const briefingContent = this.generateDailyBriefingContent(briefingData);
      const fileName = `Daily_Briefing_${briefingData.date.replace(/-/g, '_')}.md`;

      const fileMetadata = {
        name: fileName,
        parents: [this.targetFolderId],
        mimeType: 'text/markdown'
      };

      const media = {
        mimeType: 'text/markdown',
        body: briefingContent
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id,name,createdTime,size'
      });

      const duration = Date.now() - startTime;

      this.logger.logIntegration({
        service: 'GOOGLE_DRIVE',
        action: 'SYNC',
        status: 'SUCCESS',
        duration,
        recordsProcessed: 1,
        timestamp: new Date(),
        metadata: {
          operation: 'CREATE_DAILY_BRIEFING',
          fileId: response.data.id,
          fileName,
          size: response.data.size,
          folderId: this.targetFolderId
        }
      });

      this.logger.log(`Daily briefing created successfully: ${fileName}`, 'GoogleDriveService');

      return {
        success: true,
        fileId: response.data.id,
        fileName,
        metadata: response.data
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.logger.error(`Failed to create daily briefing: ${error.message}`, error.stack, 'GoogleDriveService');
      
      this.logger.logIntegration({
        service: 'GOOGLE_DRIVE',
        action: 'SYNC',
        status: 'FAILED',
        duration,
        errorMessage: error.message,
        timestamp: new Date(),
        metadata: {
          operation: 'CREATE_DAILY_BRIEFING',
          date: briefingData.date
        }
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  async saveFinancialReport(reportData: any, reportType: string): Promise<FileOperationResult> {
    const startTime = Date.now();
    
    try {
      const reportContent = JSON.stringify(reportData, null, 2);
      const fileName = `Financial_Report_${reportType}_${new Date().toISOString().split('T')[0]}.json`;

      const fileMetadata = {
        name: fileName,
        parents: [this.targetFolderId],
        mimeType: 'application/json'
      };

      const media = {
        mimeType: 'application/json',
        body: reportContent
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id,name,createdTime,size'
      });

      const duration = Date.now() - startTime;

      this.logger.logIntegration({
        service: 'GOOGLE_DRIVE',
        action: 'SYNC',
        status: 'SUCCESS',
        duration,
        recordsProcessed: 1,
        timestamp: new Date(),
        metadata: {
          operation: 'SAVE_FINANCIAL_REPORT',
          fileId: response.data.id,
          fileName,
          reportType,
          size: response.data.size,
          folderId: this.targetFolderId
        }
      });

      this.logger.log(`Financial report saved successfully: ${fileName}`, 'GoogleDriveService');

      return {
        success: true,
        fileId: response.data.id,
        fileName,
        metadata: response.data
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.logger.error(`Failed to save financial report: ${error.message}`, error.stack, 'GoogleDriveService');
      
      this.logger.logIntegration({
        service: 'GOOGLE_DRIVE',
        action: 'SYNC',
        status: 'FAILED',
        duration,
        errorMessage: error.message,
        timestamp: new Date(),
        metadata: {
          operation: 'SAVE_FINANCIAL_REPORT',
          reportType
        }
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  async save43V3RMetrics(metricsData: any): Promise<FileOperationResult> {
    const startTime = Date.now();
    
    try {
      const metricsContent = JSON.stringify(metricsData, null, 2);
      const fileName = `43V3R_Metrics_${new Date().toISOString().split('T')[0]}.json`;

      const fileMetadata = {
        name: fileName,
        parents: [this.targetFolderId],
        mimeType: 'application/json'
      };

      const media = {
        mimeType: 'application/json',
        body: metricsContent
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id,name,createdTime,size'
      });

      const duration = Date.now() - startTime;

      this.logger.logIntegration({
        service: 'GOOGLE_DRIVE',
        action: 'SYNC',
        status: 'SUCCESS',
        duration,
        recordsProcessed: 1,
        timestamp: new Date(),
        metadata: {
          operation: 'SAVE_43V3R_METRICS',
          fileId: response.data.id,
          fileName,
          size: response.data.size,
          folderId: this.targetFolderId
        }
      });

      this.logger.log(`43V3R metrics saved successfully: ${fileName}`, 'GoogleDriveService');

      return {
        success: true,
        fileId: response.data.id,
        fileName,
        metadata: response.data
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.logger.error(`Failed to save 43V3R metrics: ${error.message}`, error.stack, 'GoogleDriveService');
      
      this.logger.logIntegration({
        service: 'GOOGLE_DRIVE',
        action: 'SYNC',
        status: 'FAILED',
        duration,
        errorMessage: error.message,
        timestamp: new Date(),
        metadata: {
          operation: 'SAVE_43V3R_METRICS'
        }
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  async backupFinancialData(backupData: any): Promise<FileOperationResult> {
    const startTime = Date.now();
    
    try {
      const backupContent = JSON.stringify(backupData, null, 2);
      const fileName = `LIF3_Backup_${new Date().toISOString().replace(/[:.]/g, '_')}.json`;

      const fileMetadata = {
        name: fileName,
        parents: [this.targetFolderId],
        mimeType: 'application/json'
      };

      const media = {
        mimeType: 'application/json',
        body: backupContent
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id,name,createdTime,size'
      });

      const duration = Date.now() - startTime;

      this.logger.logIntegration({
        service: 'GOOGLE_DRIVE',
        action: 'SYNC',
        status: 'SUCCESS',
        duration,
        recordsProcessed: 1,
        timestamp: new Date(),
        metadata: {
          operation: 'BACKUP_FINANCIAL_DATA',
          fileId: response.data.id,
          fileName,
          size: response.data.size,
          folderId: this.targetFolderId,
          backupType: 'AUTOMATED'
        }
      });

      this.logger.log(`Financial data backup created successfully: ${fileName}`, 'GoogleDriveService');

      return {
        success: true,
        fileId: response.data.id,
        fileName,
        metadata: response.data
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.logger.error(`Failed to backup financial data: ${error.message}`, error.stack, 'GoogleDriveService');
      
      this.logger.logIntegration({
        service: 'GOOGLE_DRIVE',
        action: 'SYNC',
        status: 'FAILED',
        duration,
        errorMessage: error.message,
        timestamp: new Date(),
        metadata: {
          operation: 'BACKUP_FINANCIAL_DATA'
        }
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  async listFiles(folderId?: string): Promise<any[]> {
    const startTime = Date.now();
    
    try {
      const response = await this.drive.files.list({
        q: `'${folderId || this.targetFolderId}' in parents`,
        fields: 'files(id,name,createdTime,modifiedTime,size,mimeType)',
        orderBy: 'createdTime desc'
      });

      const duration = Date.now() - startTime;

      this.logger.logIntegration({
        service: 'GOOGLE_DRIVE',
        action: 'SYNC',
        status: 'SUCCESS',
        duration,
        recordsProcessed: response.data.files.length,
        timestamp: new Date(),
        metadata: {
          operation: 'LIST_FILES',
          folderId: folderId || this.targetFolderId,
          fileCount: response.data.files.length
        }
      });

      return response.data.files;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.logger.error(`Failed to list files: ${error.message}`, error.stack, 'GoogleDriveService');
      
      this.logger.logIntegration({
        service: 'GOOGLE_DRIVE',
        action: 'SYNC',
        status: 'FAILED',
        duration,
        errorMessage: error.message,
        timestamp: new Date(),
        metadata: {
          operation: 'LIST_FILES',
          folderId: folderId || this.targetFolderId
        }
      });

      return [];
    }
  }

  async downloadFile(fileId: string): Promise<any> {
    const startTime = Date.now();
    
    try {
      const response = await this.drive.files.get({
        fileId,
        alt: 'media'
      });

      const duration = Date.now() - startTime;

      this.logger.logIntegration({
        service: 'GOOGLE_DRIVE',
        action: 'SYNC',
        status: 'SUCCESS',
        duration,
        recordsProcessed: 1,
        timestamp: new Date(),
        metadata: {
          operation: 'DOWNLOAD_FILE',
          fileId,
          size: response.data.length || 0
        }
      });

      return response.data;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.logger.error(`Failed to download file: ${error.message}`, error.stack, 'GoogleDriveService');
      
      this.logger.logIntegration({
        service: 'GOOGLE_DRIVE',
        action: 'SYNC',
        status: 'FAILED',
        duration,
        errorMessage: error.message,
        timestamp: new Date(),
        metadata: {
          operation: 'DOWNLOAD_FILE',
          fileId
        }
      });

      throw error;
    }
  }

  async deleteFile(fileId: string): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      await this.drive.files.delete({
        fileId
      });

      const duration = Date.now() - startTime;

      this.logger.logIntegration({
        service: 'GOOGLE_DRIVE',
        action: 'SYNC',
        status: 'SUCCESS',
        duration,
        recordsProcessed: 1,
        timestamp: new Date(),
        metadata: {
          operation: 'DELETE_FILE',
          fileId
        }
      });

      this.logger.log(`File deleted successfully: ${fileId}`, 'GoogleDriveService');

      return true;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.logger.error(`Failed to delete file: ${error.message}`, error.stack, 'GoogleDriveService');
      
      this.logger.logIntegration({
        service: 'GOOGLE_DRIVE',
        action: 'SYNC',
        status: 'FAILED',
        duration,
        errorMessage: error.message,
        timestamp: new Date(),
        metadata: {
          operation: 'DELETE_FILE',
          fileId
        }
      });

      return false;
    }
  }

  async syncFinancialData(financialData: any): Promise<FileOperationResult> {
    const startTime = Date.now();
    
    try {
      const operations = [
        this.createDailyBriefing({
          date: new Date().toISOString().split('T')[0],
          netWorth: financialData.netWorth,
          dailyRevenue: financialData.dailyRevenue,
          goalProgress: financialData.goalProgress,
          transactions: financialData.transactions,
          businessMetrics: financialData.businessMetrics
        }),
        this.saveFinancialReport(financialData, 'DAILY'),
        this.save43V3RMetrics(financialData.businessMetrics)
      ];

      const results = await Promise.allSettled(operations);
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failureCount = results.filter(r => r.status === 'rejected').length;

      const duration = Date.now() - startTime;

      this.logger.logIntegration({
        service: 'GOOGLE_DRIVE',
        action: 'SYNC',
        status: failureCount === 0 ? 'SUCCESS' : 'PARTIAL',
        duration,
        recordsProcessed: successCount,
        timestamp: new Date(),
        metadata: {
          operation: 'SYNC_FINANCIAL_DATA',
          successCount,
          failureCount,
          totalOperations: operations.length
        }
      });

      this.logger.log(`Financial data sync completed: ${successCount}/${operations.length} operations successful`, 'GoogleDriveService');

      return {
        success: failureCount === 0,
        metadata: {
          successCount,
          failureCount,
          totalOperations: operations.length,
          results
        }
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.logger.error(`Failed to sync financial data: ${error.message}`, error.stack, 'GoogleDriveService');
      
      this.logger.logIntegration({
        service: 'GOOGLE_DRIVE',
        action: 'SYNC',
        status: 'FAILED',
        duration,
        errorMessage: error.message,
        timestamp: new Date(),
        metadata: {
          operation: 'SYNC_FINANCIAL_DATA'
        }
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  // Automated daily briefing at 8:00 AM CAT (6:00 AM UTC)
  @Cron('0 6 * * *')
  async automatedDailyBriefing() {
    try {
      this.logger.log('Starting automated daily briefing generation', 'GoogleDriveService');
      
      // Get current financial data
      const currentData = await this.getCurrentFinancialData();
      
      const briefingData: DailyBriefingData = {
        date: new Date().toISOString().split('T')[0],
        netWorth: currentData.netWorth || 239625,
        dailyRevenue: currentData.dailyRevenue || 0,
        goalProgress: ((currentData.netWorth || 239625) / 1800000 * 100),
        transactions: currentData.transactions || [],
        businessMetrics: currentData.businessMetrics || {
          dailyRevenue: 0,
          mrr: 0,
          weeklyTarget: 34167,
          monthlyTarget: 147917
        }
      };

      const result = await this.createDailyBriefing(briefingData);
      
      if (result.success) {
        this.logger.log('Automated daily briefing created successfully', 'GoogleDriveService');
      } else {
        this.logger.error('Failed to create automated daily briefing', result.error, 'GoogleDriveService');
      }
      
    } catch (error) {
      this.logger.error(`Automated daily briefing failed: ${error.message}`, error.stack, 'GoogleDriveService');
    }
  }

  // Weekly backup every Sunday at 11:00 PM CAT (9:00 PM UTC)
  @Cron('0 21 * * 0')
  async automatedWeeklyBackup() {
    try {
      this.logger.log('Starting automated weekly backup', 'GoogleDriveService');
      
      const financialData = await this.getCurrentFinancialData();
      const result = await this.backupFinancialData({
        ...financialData,
        backupType: 'WEEKLY_AUTOMATED',
        timestamp: new Date().toISOString()
      });
      
      if (result.success) {
        this.logger.log('Automated weekly backup completed successfully', 'GoogleDriveService');
      } else {
        this.logger.error('Failed to create automated weekly backup', result.error, 'GoogleDriveService');
      }
      
    } catch (error) {
      this.logger.error(`Automated weekly backup failed: ${error.message}`, error.stack, 'GoogleDriveService');
    }
  }

  async createLIF3FolderStructure(): Promise<boolean> {
    try {
      this.logger.log('Creating LIF3 folder structure in Google Drive', 'GoogleDriveService');
      
      const folderStructure = [
        { name: 'AI_Automation', parent: this.targetFolderId },
        { name: '01_Daily_Briefings', parent: 'AI_Automation' },
        { name: '02_Financial_Reports', parent: 'AI_Automation' },
        { name: '03_Business_Metrics', parent: 'AI_Automation' },
        { name: '04_Goal_Tracking', parent: 'AI_Automation' },
        { name: 'Financial_Documents', parent: this.targetFolderId },
        { name: 'Receipts', parent: 'Financial_Documents' },
        { name: 'Statements', parent: 'Financial_Documents' },
        { name: 'Tax_Documents', parent: 'Financial_Documents' },
        { name: 'Business_Reports', parent: this.targetFolderId },
        { name: '43V3R_Metrics', parent: 'Business_Reports' },
        { name: 'Revenue_Tracking', parent: 'Business_Reports' },
        { name: 'Client_Reports', parent: 'Business_Reports' },
        { name: 'Automated_Backups', parent: this.targetFolderId }
      ];

      const createdFolders = new Map<string, string>();
      createdFolders.set(this.targetFolderId, this.targetFolderId);

      for (const folder of folderStructure) {
        const parentId = createdFolders.get(folder.parent) || this.targetFolderId;
        
        const folderMetadata = {
          name: folder.name,
          parents: [parentId],
          mimeType: 'application/vnd.google-apps.folder'
        };

        const response = await this.drive.files.create({
          resource: folderMetadata,
          fields: 'id,name'
        });

        createdFolders.set(folder.name, response.data.id);
        
        this.logger.log(`Created folder: ${folder.name} (${response.data.id})`, 'GoogleDriveService');
      }

      this.logger.logIntegration({
        service: 'GOOGLE_DRIVE',
        action: 'SYNC',
        status: 'SUCCESS',
        timestamp: new Date(),
        metadata: {
          operation: 'CREATE_FOLDER_STRUCTURE',
          foldersCreated: folderStructure.length,
          rootFolderId: this.targetFolderId
        }
      });

      this.logger.log('LIF3 folder structure created successfully', 'GoogleDriveService');
      return true;

    } catch (error) {
      this.logger.error(`Failed to create folder structure: ${error.message}`, error.stack, 'GoogleDriveService');
      
      this.logger.logIntegration({
        service: 'GOOGLE_DRIVE',
        action: 'SYNC',
        status: 'FAILED',
        errorMessage: error.message,
        timestamp: new Date(),
        metadata: {
          operation: 'CREATE_FOLDER_STRUCTURE'
        }
      });

      return false;
    }
  }

  async getSyncStatus(): Promise<any> {
    try {
      const files = await this.listFiles();
      const lastSync = new Date().toISOString();
      
      return {
        isConnected: !!this.drive,
        lastSync,
        fileCount: files.length,
        folderId: this.targetFolderId,
        status: 'HEALTHY',
        recentFiles: files.slice(0, 5)
      };
      
    } catch (error) {
      return {
        isConnected: false,
        lastSync: null,
        fileCount: 0,
        folderId: this.targetFolderId,
        status: 'ERROR',
        error: error.message
      };
    }
  }

  private async getCurrentFinancialData(): Promise<any> {
    // This would integrate with your financial service
    // For now, returning mock data with current targets
    return {
      netWorth: 239625,
      dailyRevenue: 0,
      monthlyIncome: 85000,
      monthlyExpenses: 45000,
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
  }

  private generateDailyBriefingContent(data: DailyBriefingData): string {
    const capeTownTime = new Intl.DateTimeFormat('en-ZA', {
      timeZone: 'Africa/Johannesburg',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date());

    return `# 🎯 LIF3 Daily Command Center - ${data.date}

*Generated: ${capeTownTime} (Cape Town Time)*

## 💰 Financial Overview
- **Current Net Worth**: R${data.netWorth.toLocaleString()}
- **Goal Target**: R1,800,000
- **Progress**: ${data.goalProgress.toFixed(1)}% (${((data.netWorth / 1800000) * 100).toFixed(1)}% to goal)
- **Remaining**: R${(1800000 - data.netWorth).toLocaleString()}
- **Daily Revenue**: R${data.dailyRevenue.toLocaleString()}

## 🚀 43V3R Business Metrics
- **Daily Revenue**: R${data.businessMetrics?.dailyRevenue || 0}
- **Daily Target**: R4,881
- **Progress to Target**: ${((data.businessMetrics?.dailyRevenue || 0) / 4881 * 100).toFixed(1)}%
- **Monthly Recurring Revenue**: R${data.businessMetrics?.mrr || 0}
- **MRR Target**: R147,917
- **Business Focus**: AI + Web3 + Crypto (Cape Town, SA)

## 📊 Today's Key Metrics
- **Savings Rate**: ${(((data.netWorth / 1800000) * 100) / 30).toFixed(2)}% monthly progress needed
- **Daily Savings Required**: R${Math.round((1800000 - data.netWorth) / 365)} (assuming 1-year goal)
- **43V3R Revenue Gap**: R${(4881 - (data.businessMetrics?.dailyRevenue || 0)).toLocaleString()}

## 💸 Recent Transactions
${data.transactions?.length > 0 
  ? data.transactions.slice(0, 5).map(tx => `- **${tx.description}**: R${Math.abs(tx.amount).toLocaleString()} (${tx.amount > 0 ? '💚 Income' : '💸 Expense'})`).join('\n')
  : '- No recent transactions recorded'
}

## 🎯 Goal Progress Analysis
- **Net Worth Journey**: R239,625 → R1,800,000
- **Growth Required**: R${(1800000 - data.netWorth).toLocaleString()}
- **Monthly Growth Needed**: R${Math.round((1800000 - data.netWorth) / 12).toLocaleString()}
- **Current Monthly Capacity**: ~R40,000 (based on income - expenses)

## 🔥 Action Items for Today
1. **43V3R Revenue Focus**: Target R4,881 daily revenue
2. **Investment Optimization**: Review portfolio allocation
3. **Expense Review**: Identify optimization opportunities
4. **Business Development**: AI + Web3 + Crypto opportunities
5. **Network Growth**: Connect with potential clients/partners

## 📈 Performance Indicators
- **Financial Health**: ${data.goalProgress > 20 ? '🟢 Strong' : data.goalProgress > 10 ? '🟡 Moderate' : '🔴 Building'}
- **Business Momentum**: ${(data.businessMetrics?.dailyRevenue || 0) > 2400 ? '🚀 Accelerating' : (data.businessMetrics?.dailyRevenue || 0) > 500 ? '📈 Growing' : '🌱 Starting'}
- **Goal Trajectory**: ${data.goalProgress > 15 ? '⚡ Ahead of Schedule' : '🎯 On Track'}

## 🌍 Market Context (South Africa)
- **Currency**: ZAR (South African Rand)
- **Location**: Cape Town, South Africa
- **Industry Focus**: AI, Web3, Cryptocurrency
- **Economic Climate**: Tech innovation hub

---

### 🤖 AI Insights
*Based on current progress and market conditions:*

${data.goalProgress < 15 
  ? '💡 **Recommendation**: Accelerate 43V3R revenue generation. Focus on high-value AI consulting services.'
  : '✨ **Excellent Progress**: Maintain current momentum while exploring investment diversification.'
}

---

*🏗️ Generated automatically by LIF3 Financial Dashboard*  
*📧 For Ethan Barnes - ethan@43v3r.ai*  
*🏢 43V3R AI Startup - Cape Town, South Africa*  
*⏰ ${new Date().toISOString()}*

---

### 📱 Quick Actions
- [View Dashboard](http://localhost:3000/dashboard)
- [Update Goals](http://localhost:3000/goals)
- [Business Metrics](http://localhost:3000/business)
- [Financial Reports](http://localhost:3000/reports)
`;
  }
}