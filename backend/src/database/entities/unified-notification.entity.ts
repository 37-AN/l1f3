import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { UnifiedUser } from './unified-user.entity';

export enum NotificationType {
  SYSTEM = 'system',
  FINANCIAL = 'financial',
  BUSINESS = 'business',
  ERROR = 'error',
  AUTOMATION = 'automation',
  GOAL_PROGRESS = 'goal_progress',
  ALERT = 'alert'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum NotificationChannel {
  DASHBOARD = 'dashboard',
  EMAIL = 'email',
  DISCORD = 'discord',
  SLACK = 'slack',
  WEBHOOK = 'webhook'
}

@Entity('unified_notifications')
@Index(['userId', 'read'])
@Index(['platformId', 'externalId'], { unique: true })
export class UnifiedNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: NotificationType, default: NotificationType.SYSTEM })
  @Index()
  type: NotificationType;

  @Column({ type: 'enum', enum: NotificationPriority, default: NotificationPriority.MEDIUM })
  @Index()
  priority: NotificationPriority;

  @Column({ type: 'simple-array', nullable: true })
  channels?: NotificationChannel[];

  @Column({ default: false })
  @Index()
  read: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt?: Date;

  @Column()
  @Index()
  platformId: string;

  @Column({ nullable: true })
  externalId?: string;

  @Column({ type: 'json', nullable: true })
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

  @Column({ type: 'json', nullable: true })
  deliveryStatus?: {
    dashboard: { sent: boolean; timestamp?: Date };
    email: { sent: boolean; timestamp?: Date; error?: string };
    discord: { sent: boolean; timestamp?: Date; error?: string };
    slack: { sent: boolean; timestamp?: Date; error?: string };
    webhook: { sent: boolean; timestamp?: Date; error?: string };
  };

  @Column({ type: 'timestamp', nullable: true })
  scheduledFor?: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ default: false })
  isAutomated: boolean;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => UnifiedUser, user => user.notifications)
  @JoinColumn({ name: 'userId' })
  user: UnifiedUser;
}