import { UnifiedUser } from './unified-user.entity';
export declare enum NotificationType {
    SYSTEM = "system",
    FINANCIAL = "financial",
    BUSINESS = "business",
    ERROR = "error",
    AUTOMATION = "automation",
    GOAL_PROGRESS = "goal_progress",
    ALERT = "alert"
}
export declare enum NotificationPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent"
}
export declare enum NotificationChannel {
    DASHBOARD = "dashboard",
    EMAIL = "email",
    DISCORD = "discord",
    SLACK = "slack",
    WEBHOOK = "webhook"
}
export declare class UnifiedNotification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    priority: NotificationPriority;
    channels?: NotificationChannel[];
    read: boolean;
    readAt?: Date;
    platformId: string;
    externalId?: string;
    metadata?: {
        actionUrl?: string;
        relatedEntityId?: string;
        relatedEntityType?: string;
        financialData?: {
            amount?: number;
            currency?: string;
            goalImpact?: 'positive' | 'negative' | 'neutral';
        };
        automationContext?: {
            ruleId?: string;
            triggeredBy?: string;
            expectedAction?: string;
        };
    };
    deliveryStatus?: {
        dashboard: {
            sent: boolean;
            timestamp?: Date;
        };
        email: {
            sent: boolean;
            timestamp?: Date;
            error?: string;
        };
        discord: {
            sent: boolean;
            timestamp?: Date;
            error?: string;
        };
        slack: {
            sent: boolean;
            timestamp?: Date;
            error?: string;
        };
        webhook: {
            sent: boolean;
            timestamp?: Date;
            error?: string;
        };
    };
    scheduledFor?: Date;
    expiresAt?: Date;
    isAutomated: boolean;
    createdAt: Date;
    updatedAt: Date;
    user: UnifiedUser;
}
