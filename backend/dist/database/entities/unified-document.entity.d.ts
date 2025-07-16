import { UnifiedUser } from './unified-user.entity';
export declare enum DocumentType {
    FINANCIAL_REPORT = "financial_report",
    BUSINESS_PLAN = "business_plan",
    GOAL_TRACKING = "goal_tracking",
    SYSTEM_DOCUMENTATION = "system_documentation",
    ERROR_REPORT = "error_report",
    AUTOMATION_LOG = "automation_log",
    GENERAL = "general"
}
export declare enum DocumentStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    ARCHIVED = "archived",
    DELETED = "deleted"
}
export declare class UnifiedDocument {
    id: string;
    userId: string;
    title: string;
    content?: string;
    type: DocumentType;
    status: DocumentStatus;
    url?: string;
    size?: number;
    mimeType?: string;
    platformId: string;
    externalId?: string;
    metadata?: {
        tags?: string[];
        categories?: string[];
        version?: string;
        checksum?: string;
        financialData?: {
            amount?: number;
            currency?: string;
            goalRelated?: boolean;
        };
    };
    syncStatus?: {
        lastSync: Date;
        syncErrors: string[];
        needsSync: boolean;
    };
    aiAnalysis?: {
        summary?: string;
        insights?: string[];
        recommendations?: string[];
        sentiment?: 'positive' | 'negative' | 'neutral';
        keywords?: string[];
    };
    isAutomated: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastAccessedAt?: Date;
    user: UnifiedUser;
}
