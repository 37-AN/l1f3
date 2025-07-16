"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unified_user_entity_1 = require("../unified-user.entity");
const unified_task_entity_1 = require("../unified-task.entity");
const unified_document_entity_1 = require("../unified-document.entity");
const unified_notification_entity_1 = require("../unified-notification.entity");
describe('Unified Schema Basic Tests', () => {
    it('should create UnifiedUser entity', () => {
        const user = new unified_user_entity_1.UnifiedUser();
        user.email = 'test@example.com';
        user.name = 'Test User';
        user.financialTargets = {
            netWorthTarget: 1800000,
            dailyRevenueTarget: 4881,
            mrrTarget: 147917,
            targetDate: '2025-12-31',
        };
        expect(user.email).toBe('test@example.com');
        expect(user.name).toBe('Test User');
        expect(user.financialTargets.netWorthTarget).toBe(1800000);
        expect(user.financialTargets.dailyRevenueTarget).toBe(4881);
        expect(user.financialTargets.mrrTarget).toBe(147917);
    });
    it('should create UnifiedTask entity', () => {
        const task = new unified_task_entity_1.UnifiedTask();
        task.title = '[ERROR] Database Connection Failed';
        task.description = 'Connection timeout to PostgreSQL database';
        task.status = unified_task_entity_1.TaskStatus.PENDING;
        task.priority = unified_task_entity_1.TaskPriority.HIGH;
        task.type = unified_task_entity_1.TaskType.ERROR;
        task.platformId = 'sentry_server';
        task.externalId = 'sentry_issue_123';
        task.metadata = {
            tags: ['database', 'error'],
            errorDetails: {
                errorCode: 'CONN_TIMEOUT',
                stack: 'Error: Connection timeout...',
            },
        };
        expect(task.title).toBe('[ERROR] Database Connection Failed');
        expect(task.status).toBe(unified_task_entity_1.TaskStatus.PENDING);
        expect(task.priority).toBe(unified_task_entity_1.TaskPriority.HIGH);
        expect(task.type).toBe(unified_task_entity_1.TaskType.ERROR);
        expect(task.metadata.tags).toContain('database');
        expect(task.metadata.errorDetails.errorCode).toBe('CONN_TIMEOUT');
    });
    it('should create UnifiedDocument entity', () => {
        const document = new unified_document_entity_1.UnifiedDocument();
        document.title = 'Q3 2025 Financial Report';
        document.content = 'Current net worth: R350,000';
        document.type = unified_document_entity_1.DocumentType.FINANCIAL_REPORT;
        document.status = unified_document_entity_1.DocumentStatus.PUBLISHED;
        document.platformId = 'notion_server';
        document.metadata = {
            tags: ['financial', 'report'],
            financialData: {
                amount: 350000,
                currency: 'ZAR',
                goalRelated: true,
            },
        };
        expect(document.title).toBe('Q3 2025 Financial Report');
        expect(document.type).toBe(unified_document_entity_1.DocumentType.FINANCIAL_REPORT);
        expect(document.status).toBe(unified_document_entity_1.DocumentStatus.PUBLISHED);
        expect(document.metadata.financialData.amount).toBe(350000);
        expect(document.metadata.financialData.currency).toBe('ZAR');
    });
    it('should create UnifiedNotification entity', () => {
        const notification = new unified_notification_entity_1.UnifiedNotification();
        notification.title = 'Goal Progress Update';
        notification.message = 'You have reached 20% of your R1,800,000 net worth target!';
        notification.type = unified_notification_entity_1.NotificationType.GOAL_PROGRESS;
        notification.priority = unified_notification_entity_1.NotificationPriority.HIGH;
        notification.platformId = 'lif3_system';
        notification.metadata = {
            financialData: {
                amount: 360000,
                currency: 'ZAR',
                goalImpact: 'positive',
            },
        };
        expect(notification.title).toBe('Goal Progress Update');
        expect(notification.type).toBe(unified_notification_entity_1.NotificationType.GOAL_PROGRESS);
        expect(notification.priority).toBe(unified_notification_entity_1.NotificationPriority.HIGH);
        expect(notification.metadata.financialData.amount).toBe(360000);
        expect(notification.metadata.financialData.goalImpact).toBe('positive');
    });
    it('should validate enum values', () => {
        expect(unified_task_entity_1.TaskStatus.PENDING).toBe('pending');
        expect(unified_task_entity_1.TaskStatus.IN_PROGRESS).toBe('in_progress');
        expect(unified_task_entity_1.TaskStatus.COMPLETED).toBe('completed');
        expect(unified_task_entity_1.TaskPriority.LOW).toBe('low');
        expect(unified_task_entity_1.TaskPriority.HIGH).toBe('high');
        expect(unified_task_entity_1.TaskType.FINANCIAL).toBe('financial');
        expect(unified_task_entity_1.TaskType.ERROR).toBe('error');
        expect(unified_document_entity_1.DocumentType.FINANCIAL_REPORT).toBe('financial_report');
        expect(unified_document_entity_1.DocumentType.GOAL_TRACKING).toBe('goal_tracking');
        expect(unified_notification_entity_1.NotificationType.GOAL_PROGRESS).toBe('goal_progress');
        expect(unified_notification_entity_1.NotificationType.FINANCIAL).toBe('financial');
    });
});
//# sourceMappingURL=unified-schema-basic.test.js.map