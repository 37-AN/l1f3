import { UnifiedTask } from './unified-task.entity';
import { UnifiedDocument } from './unified-document.entity';
import { UnifiedNotification } from './unified-notification.entity';
export declare class UnifiedUser {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    timezone: string;
    preferences?: any;
    financialTargets?: {
        netWorthTarget: number;
        dailyRevenueTarget: number;
        mrrTarget: number;
        targetDate: string;
    };
    integrationSettings?: {
        sentry: {
            enabled: boolean;
            preferences: any;
        };
        notion: {
            enabled: boolean;
            preferences: any;
        };
        asana: {
            enabled: boolean;
            preferences: any;
        };
        github: {
            enabled: boolean;
            preferences: any;
        };
        slack: {
            enabled: boolean;
            preferences: any;
        };
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    tasks: UnifiedTask[];
    documents: UnifiedDocument[];
    notifications: UnifiedNotification[];
}
