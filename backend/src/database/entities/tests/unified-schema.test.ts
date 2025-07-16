import { DataSource } from 'typeorm';
import { UnifiedUser } from '../unified-user.entity';
import { UnifiedTask, TaskStatus, TaskPriority, TaskType } from '../unified-task.entity';
import { UnifiedDocument, DocumentType, DocumentStatus } from '../unified-document.entity';
import { UnifiedNotification, NotificationType, NotificationPriority } from '../unified-notification.entity';

describe('Unified Data Schema', () => {
  let dataSource: DataSource;
  let userRepo: any;
  let taskRepo: any;
  let documentRepo: any;
  let notificationRepo: any;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'sqlite',
      database: ':memory:',
      entities: [UnifiedUser, UnifiedTask, UnifiedDocument, UnifiedNotification],
      synchronize: true,
      logging: false,
    });

    await dataSource.initialize();
    userRepo = dataSource.getRepository(UnifiedUser);
    taskRepo = dataSource.getRepository(UnifiedTask);
    documentRepo = dataSource.getRepository(UnifiedDocument);
    notificationRepo = dataSource.getRepository(UnifiedNotification);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    await userRepo.clear();
    await taskRepo.clear();
    await documentRepo.clear();
    await notificationRepo.clear();
  });

  describe('UnifiedUser Entity', () => {
    it('should create user with financial targets', async () => {
      const user = userRepo.create({
        email: 'ethan@43v3r.com',
        name: 'Ethan Barnes',
        timezone: 'Africa/Johannesburg',
        financialTargets: {
          netWorthTarget: 1800000,
          dailyRevenueTarget: 4881,
          mrrTarget: 147917,
          targetDate: '2025-12-31',
        },
        integrationSettings: {
          sentry: { enabled: true, preferences: { autoCreateTasks: true } },
          notion: { enabled: true, preferences: { autoSync: true } },
          asana: { enabled: true, preferences: { projectId: 'test-project' } },
          github: { enabled: false, preferences: {} },
          slack: { enabled: true, preferences: { channel: '#lif3' } },
        },
      });

      const savedUser = await userRepo.save(user);

      expect(savedUser.id).toBeDefined();
      expect(savedUser.email).toBe('ethan@43v3r.com');
      expect(savedUser.financialTargets.netWorthTarget).toBe(1800000);
      expect(savedUser.integrationSettings.sentry.enabled).toBe(true);
      expect(savedUser.isActive).toBe(true);
      expect(savedUser.createdAt).toBeDefined();
    });

    it('should enforce email uniqueness', async () => {
      const user1 = userRepo.create({
        email: 'test@example.com',
        name: 'Test User 1',
      });

      const user2 = userRepo.create({
        email: 'test@example.com',
        name: 'Test User 2',
      });

      await userRepo.save(user1);
      
      await expect(userRepo.save(user2)).rejects.toThrow();
    });
  });

  describe('UnifiedTask Entity', () => {
    let testUser: UnifiedUser;

    beforeEach(async () => {
      testUser = await userRepo.save({
        email: 'test@example.com',
        name: 'Test User',
      });
    });

    it('should create task with all properties', async () => {
      const task = taskRepo.create({
        userId: testUser.id,
        title: '[ERROR] Database Connection Failed',
        description: 'Connection timeout to PostgreSQL database',
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
        type: TaskType.ERROR,
        dueDate: new Date('2025-07-20'),
        platformId: 'sentry_server',
        externalId: 'sentry_issue_123',
        metadata: {
          tags: ['database', 'error', 'urgent'],
          errorDetails: {
            errorCode: 'CONN_TIMEOUT',
            stack: 'Error: Connection timeout...',
          },
          automationTrigger: 'sentry_webhook',
        },
        isAutomated: true,
      });

      const savedTask = await taskRepo.save(task);

      expect(savedTask.id).toBeDefined();
      expect(savedTask.title).toBe('[ERROR] Database Connection Failed');
      expect(savedTask.status).toBe(TaskStatus.PENDING);
      expect(savedTask.priority).toBe(TaskPriority.HIGH);
      expect(savedTask.type).toBe(TaskType.ERROR);
      expect(savedTask.isAutomated).toBe(true);
      expect(savedTask.metadata.tags).toContain('database');
      expect(savedTask.metadata.errorDetails.errorCode).toBe('CONN_TIMEOUT');
    });

    it('should enforce unique platform and external ID combination', async () => {
      const task1 = taskRepo.create({
        userId: testUser.id,
        title: 'Task 1',
        platformId: 'asana_server',
        externalId: 'task_123',
      });

      const task2 = taskRepo.create({
        userId: testUser.id,
        title: 'Task 2',
        platformId: 'asana_server',
        externalId: 'task_123',
      });

      await taskRepo.save(task1);
      
      await expect(taskRepo.save(task2)).rejects.toThrow();
    });

    it('should handle task completion workflow', async () => {
      const task = taskRepo.create({
        userId: testUser.id,
        title: 'Financial Goal Review',
        type: TaskType.FINANCIAL,
        status: TaskStatus.IN_PROGRESS,
        platformId: 'notion_server',
      });

      const savedTask = await taskRepo.save(task);
      
      // Complete the task
      savedTask.status = TaskStatus.COMPLETED;
      savedTask.completedAt = new Date();
      
      const completedTask = await taskRepo.save(savedTask);

      expect(completedTask.status).toBe(TaskStatus.COMPLETED);
      expect(completedTask.completedAt).toBeDefined();
    });
  });

  describe('UnifiedDocument Entity', () => {
    let testUser: UnifiedUser;

    beforeEach(async () => {
      testUser = await userRepo.save({
        email: 'test@example.com',
        name: 'Test User',
      });
    });

    it('should create financial report document', async () => {
      const document = documentRepo.create({
        userId: testUser.id,
        title: 'Q3 2025 Financial Report',
        content: 'Current net worth: R350,000. Progress: 19.4% toward R1,800,000 target.',
        type: DocumentType.FINANCIAL_REPORT,
        status: DocumentStatus.PUBLISHED,
        platformId: 'notion_server',
        externalId: 'notion_page_abc123',
        metadata: {
          tags: ['financial', 'report', 'q3'],
          categories: ['reports', 'finance'],
          financialData: {
            amount: 350000,
            currency: 'ZAR',
            goalRelated: true,
          },
        },
        aiAnalysis: {
          summary: 'Strong progress toward net worth goal with 19.4% completion.',
          insights: [
            'Monthly savings rate increased by 15%',
            'Investment portfolio showing 12% growth',
            'Expense reduction of 8% achieved',
          ],
          recommendations: [
            'Increase monthly savings by additional R5,000',
            'Consider diversifying investment portfolio',
            'Review and optimize recurring expenses',
          ],
          sentiment: 'positive',
          keywords: ['net worth', 'savings', 'investment', 'growth'],
        },
        isAutomated: true,
      });

      const savedDocument = await documentRepo.save(document);

      expect(savedDocument.id).toBeDefined();
      expect(savedDocument.type).toBe(DocumentType.FINANCIAL_REPORT);
      expect(savedDocument.metadata.financialData.amount).toBe(350000);
      expect(savedDocument.aiAnalysis.sentiment).toBe('positive');
      expect(savedDocument.aiAnalysis.insights).toHaveLength(3);
      expect(savedDocument.isAutomated).toBe(true);
    });

    it('should handle document versioning and updates', async () => {
      const document = documentRepo.create({
        userId: testUser.id,
        title: 'Business Plan 2025',
        type: DocumentType.BUSINESS_PLAN,
        platformId: 'notion_server',
        metadata: {
          version: '1.0',
        },
      });

      const savedDocument = await documentRepo.save(document);
      
      // Update document version
      savedDocument.metadata.version = '1.1';
      savedDocument.lastAccessedAt = new Date();
      
      const updatedDocument = await documentRepo.save(savedDocument);

      expect(updatedDocument.metadata.version).toBe('1.1');
      expect(updatedDocument.lastAccessedAt).toBeDefined();
    });
  });

  describe('UnifiedNotification Entity', () => {
    let testUser: UnifiedUser;

    beforeEach(async () => {
      testUser = await userRepo.save({
        email: 'test@example.com',
        name: 'Test User',
      });
    });

    it('should create goal progress notification', async () => {
      const notification = notificationRepo.create({
        userId: testUser.id,
        title: 'Goal Progress Update',
        message: 'You have reached 20% of your R1,800,000 net worth target!',
        type: NotificationType.GOAL_PROGRESS,
        priority: NotificationPriority.HIGH,
        channels: ['dashboard', 'email', 'discord'],
        platformId: 'lif3_system',
        metadata: {
          financialData: {
            amount: 360000,
            currency: 'ZAR',
            goalImpact: 'positive',
          },
          automationContext: {
            ruleId: 'goal_tracking_rule',
            triggeredBy: 'monthly_calculation',
            expectedAction: 'celebrate_milestone',
          },
        },
        deliveryStatus: {
          dashboard: { sent: true, timestamp: new Date() },
          email: { sent: true, timestamp: new Date() },
          discord: { sent: false, error: 'Channel not configured' },
          slack: { sent: false },
          webhook: { sent: false },
        },
        isAutomated: true,
      });

      const savedNotification = await notificationRepo.save(notification);

      expect(savedNotification.id).toBeDefined();
      expect(savedNotification.type).toBe(NotificationType.GOAL_PROGRESS);
      expect(savedNotification.priority).toBe(NotificationPriority.HIGH);
      expect(savedNotification.channels).toContain('dashboard');
      expect(savedNotification.metadata.financialData.amount).toBe(360000);
      expect(savedNotification.deliveryStatus.dashboard.sent).toBe(true);
      expect(savedNotification.deliveryStatus.discord.sent).toBe(false);
      expect(savedNotification.isAutomated).toBe(true);
    });

    it('should handle notification read status', async () => {
      const notification = notificationRepo.create({
        userId: testUser.id,
        title: 'System Alert',
        message: 'Database backup completed successfully',
        type: NotificationType.SYSTEM,
        platformId: 'lif3_system',
        read: false,
      });

      const savedNotification = await notificationRepo.save(notification);
      
      // Mark as read
      savedNotification.read = true;
      savedNotification.readAt = new Date();
      
      const readNotification = await notificationRepo.save(savedNotification);

      expect(readNotification.read).toBe(true);
      expect(readNotification.readAt).toBeDefined();
    });

    it('should handle scheduled notifications', async () => {
      const scheduledTime = new Date(Date.now() + 3600000); // 1 hour from now
      const expiryTime = new Date(Date.now() + 86400000); // 24 hours from now

      const notification = notificationRepo.create({
        userId: testUser.id,
        title: 'Daily Revenue Check',
        message: 'Time to review today\'s revenue progress toward R4,881 target',
        type: NotificationType.BUSINESS,
        priority: NotificationPriority.MEDIUM,
        platformId: 'lif3_system',
        scheduledFor: scheduledTime,
        expiresAt: expiryTime,
        isAutomated: true,
      });

      const savedNotification = await notificationRepo.save(notification);

      expect(savedNotification.scheduledFor).toEqual(scheduledTime);
      expect(savedNotification.expiresAt).toEqual(expiryTime);
      expect(savedNotification.isAutomated).toBe(true);
    });
  });

  describe('Cross-Entity Relations', () => {
    let testUser: UnifiedUser;

    beforeEach(async () => {
      testUser = await userRepo.save({
        email: 'test@example.com',
        name: 'Test User',
        financialTargets: {
          netWorthTarget: 1800000,
          dailyRevenueTarget: 4881,
          mrrTarget: 147917,
          targetDate: '2025-12-31',
        },
      });
    });

    it('should link tasks, documents, and notifications to user', async () => {
      // Create task
      const task = await taskRepo.save({
        userId: testUser.id,
        title: 'Review Monthly Expenses',
        type: TaskType.FINANCIAL,
        platformId: 'asana_server',
      });

      // Create document
      const document = await documentRepo.save({
        userId: testUser.id,
        title: 'Monthly Expense Report',
        type: DocumentType.FINANCIAL_REPORT,
        platformId: 'notion_server',
      });

      // Create notification
      const notification = await notificationRepo.save({
        userId: testUser.id,
        title: 'Expense Review Complete',
        message: 'Monthly expense analysis has been completed',
        type: NotificationType.FINANCIAL,
        platformId: 'lif3_system',
      });

      // Verify relationships
      const userWithRelations = await userRepo.findOne({
        where: { id: testUser.id },
        relations: ['tasks', 'documents', 'notifications'],
      });

      expect(userWithRelations.tasks).toHaveLength(1);
      expect(userWithRelations.documents).toHaveLength(1);
      expect(userWithRelations.notifications).toHaveLength(1);
      expect(userWithRelations.tasks[0].title).toBe('Review Monthly Expenses');
      expect(userWithRelations.documents[0].title).toBe('Monthly Expense Report');
      expect(userWithRelations.notifications[0].title).toBe('Expense Review Complete');
    });
  });

  describe('Performance and Indexing', () => {
    let testUser: UnifiedUser;

    beforeEach(async () => {
      testUser = await userRepo.save({
        email: 'test@example.com',
        name: 'Test User',
      });
    });

    it('should efficiently query tasks by status', async () => {
      // Create multiple tasks with different statuses
      const tasks = await Promise.all([
        taskRepo.save({
          userId: testUser.id,
          title: 'Task 1',
          status: TaskStatus.PENDING,
          platformId: 'asana_server',
        }),
        taskRepo.save({
          userId: testUser.id,
          title: 'Task 2',
          status: TaskStatus.IN_PROGRESS,
          platformId: 'asana_server',
        }),
        taskRepo.save({
          userId: testUser.id,
          title: 'Task 3',
          status: TaskStatus.COMPLETED,
          platformId: 'asana_server',
        }),
      ]);

      // Query by status (should use index)
      const pendingTasks = await taskRepo.find({
        where: { status: TaskStatus.PENDING },
      });

      const completedTasks = await taskRepo.find({
        where: { status: TaskStatus.COMPLETED },
      });

      expect(pendingTasks).toHaveLength(1);
      expect(completedTasks).toHaveLength(1);
      expect(pendingTasks[0].title).toBe('Task 1');
      expect(completedTasks[0].title).toBe('Task 3');
    });

    it('should efficiently query documents by type', async () => {
      // Create documents of different types
      await Promise.all([
        documentRepo.save({
          userId: testUser.id,
          title: 'Financial Report',
          type: DocumentType.FINANCIAL_REPORT,
          platformId: 'notion_server',
        }),
        documentRepo.save({
          userId: testUser.id,
          title: 'Business Plan',
          type: DocumentType.BUSINESS_PLAN,
          platformId: 'notion_server',
        }),
        documentRepo.save({
          userId: testUser.id,
          title: 'Goal Tracker',
          type: DocumentType.GOAL_TRACKING,
          platformId: 'notion_server',
        }),
      ]);

      // Query by type (should use index)
      const financialDocs = await documentRepo.find({
        where: { type: DocumentType.FINANCIAL_REPORT },
      });

      expect(financialDocs).toHaveLength(1);
      expect(financialDocs[0].title).toBe('Financial Report');
    });
  });
});