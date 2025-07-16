import { Repository } from "typeorm";
import { Goal } from "../../database/entities/goal.entity";
import { Transaction } from "../../database/entities/transaction.entity";
import { BusinessMetrics } from "../../database/entities/business-metrics.entity";
import { GoogleDriveService } from "../integrations/google-drive.service";
export interface DailyBriefing {
    date: string;
    netWorthProgress: {
        current: number;
        target: number;
        progress: number;
        required_monthly_growth: number;
    };
    businessMetrics: {
        daily_revenue: number;
        daily_target: number;
        monthly_progress: number;
    };
    todaysPriorities: string[];
    insights: string[];
    alerts: string[];
}
export declare class AIAgentService {
    private goalRepository;
    private transactionRepository;
    private businessMetricsRepository;
    private googleDriveService;
    private readonly logger;
    private anthropic;
    constructor(goalRepository: Repository<Goal>, transactionRepository: Repository<Transaction>, businessMetricsRepository: Repository<BusinessMetrics>, googleDriveService: GoogleDriveService);
    getFinancialContext(): Promise<string>;
    generateDailyBriefing(): Promise<string>;
    analyzeGoalProgress(goalId?: string): Promise<string>;
    generateBusinessStrategy(): Promise<string>;
    scheduledDailyBriefing(): Promise<void>;
    monitorGoalProgress(): Promise<void>;
    updateNetWorth(newAmount: number): Promise<{
        success: boolean;
        analysis: string;
    }>;
    logBusinessRevenue(amount: number, description?: string): Promise<boolean>;
}
