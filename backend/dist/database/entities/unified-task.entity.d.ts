import { UnifiedUser } from './unified-user.entity';
export declare enum TaskStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    ON_HOLD = "on_hold"
}
export declare enum TaskPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent"
}
export declare enum TaskType {
    GENERAL = "general",
    FINANCIAL = "financial",
    BUSINESS = "business",
    ERROR = "error",
    AUTOMATION = "automation"
}
export declare class UnifiedTask {
    id: string;
    userId: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    type: TaskType;
    dueDate?: Date;
    assigneeId?: string;
    platformId: string;
    externalId?: string;
    metadata?: {
        tags?: string[];
        labels?: string[];
        estimatedHours?: number;
        actualHours?: number;
        errorDetails?: any;
        automationTrigger?: string;
    };
    syncStatus?: {
        lastSync: Date;
        syncErrors: string[];
        needsSync: boolean;
    };
    isAutomated: boolean;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
    user: UnifiedUser;
}
