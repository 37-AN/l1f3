import { UnifiedUser } from '../unified-user.entity';
import { UnifiedTask, TaskStatus, TaskPriority, TaskType } from '../unified-task.entity';
import { UnifiedDocument, DocumentType, DocumentStatus } from '../unified-document.entity';
import { UnifiedNotification, NotificationType, NotificationPriority } from '../unified-notification.entity';

describe('Unified Schema Basic Tests', () => {
  it('should create UnifiedUser entity', () => {
    const user = new UnifiedUser();
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
    const task = new UnifiedTask();
    task.title = '[ERROR] Database Connection Failed';
    task.description = 'Connection timeout to PostgreSQL database';
    task.status = TaskStatus.PENDING;
    task.priority = TaskPriority.HIGH;
    task.type = TaskType.ERROR;
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
    expect(task.status).toBe(TaskStatus.PENDING);
    expect(task.priority).toBe(TaskPriority.HIGH);
    expect(task.type).toBe(TaskType.ERROR);
    expect(task.metadata.tags).toContain('database');
    expect(task.metadata.errorDetails.errorCode).toBe('CONN_TIMEOUT');
  });

  it('should create UnifiedDocument entity', () => {
    const document = new UnifiedDocument();
    document.title = 'Q3 2025 Financial Report';
    document.content = 'Current net worth: R350,000';
    document.type = DocumentType.FINANCIAL_REPORT;
    document.status = DocumentStatus.PUBLISHED;
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
    expect(document.type).toBe(DocumentType.FINANCIAL_REPORT);
    expect(document.status).toBe(DocumentStatus.PUBLISHED);
    expect(document.metadata.financialData.amount).toBe(350000);
    expect(document.metadata.financialData.currency).toBe('ZAR');
  });

  it('should create UnifiedNotification entity', () => {
    const notification = new UnifiedNotification();
    notification.title = 'Goal Progress Update';
    notification.message = 'You have reached 20% of your R1,800,000 net worth target!';
    notification.type = NotificationType.GOAL_PROGRESS;
    notification.priority = NotificationPriority.HIGH;
    notification.platformId = 'lif3_system';
    notification.metadata = {
      financialData: {
        amount: 360000,
        currency: 'ZAR',
        goalImpact: 'positive',
      },
    };

    expect(notification.title).toBe('Goal Progress Update');
    expect(notification.type).toBe(NotificationType.GOAL_PROGRESS);
    expect(notification.priority).toBe(NotificationPriority.HIGH);
    expect(notification.metadata.financialData.amount).toBe(360000);
    expect(notification.metadata.financialData.goalImpact).toBe('positive');
  });

  it('should validate enum values', () => {
    expect(TaskStatus.PENDING).toBe('pending');
    expect(TaskStatus.IN_PROGRESS).toBe('in_progress');
    expect(TaskStatus.COMPLETED).toBe('completed');
    
    expect(TaskPriority.LOW).toBe('low');
    expect(TaskPriority.HIGH).toBe('high');
    
    expect(TaskType.FINANCIAL).toBe('financial');
    expect(TaskType.ERROR).toBe('error');
    
    expect(DocumentType.FINANCIAL_REPORT).toBe('financial_report');
    expect(DocumentType.GOAL_TRACKING).toBe('goal_tracking');
    
    expect(NotificationType.GOAL_PROGRESS).toBe('goal_progress');
    expect(NotificationType.FINANCIAL).toBe('financial');
  });
});