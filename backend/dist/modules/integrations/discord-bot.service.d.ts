import { LoggerService } from '../../common/logger/logger.service';
export interface DiscordBotConfig {
    token: string;
    guildId: string;
    channelId: string;
}
export interface FinancialCommandData {
    userId: string;
    command: string;
    parameters: any;
    discordUserId: string;
    guildId: string;
    channelId: string;
}
export declare class DiscordBotService {
    private readonly logger;
    private client;
    private isConnected;
    private commandExecutionCount;
    private dailyCommandLimits;
    constructor(logger: LoggerService);
    private initializeBot;
    private setupEventHandlers;
    private registerSlashCommands;
    private handleCommand;
    private handleBalanceCommand;
    private handleTransactionCommand;
    private handleGoalProgressCommand;
    private handleSavingsRateCommand;
    private handleNetWorthCommand;
    private handleRevenueCommand;
    private handleMRRStatusCommand;
    private handleBusinessMetricsCommand;
    private handleWeeklyReportCommand;
    private handlePipelineValueCommand;
    private handleDailyBriefingCommand;
    private handleHelpCommand;
    sendDailyBriefing(): Promise<void>;
    sendEndOfDaySummary(): Promise<void>;
    sendWeeklyReport(): Promise<void>;
    private createProgressBar;
    private checkRateLimit;
    private getRegisteredCommandCount;
    sendLargeTransactionAlert(amount: number, description: string): Promise<void>;
    sendMilestoneNotification(milestone: string, value: number): Promise<void>;
    getConnectionStatus(): boolean;
    getCommandExecutionCount(): number;
}
