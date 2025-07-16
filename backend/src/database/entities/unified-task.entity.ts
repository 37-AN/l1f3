import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { UnifiedUser } from './unified-user.entity';

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum TaskType {
  GENERAL = 'general',
  FINANCIAL = 'financial',
  BUSINESS = 'business',
  ERROR = 'error',
  AUTOMATION = 'automation'
}

@Entity('unified_tasks')
@Index(['userId', 'status'])
@Index(['platformId', 'externalId'], { unique: true })
export class UnifiedTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDING })
  @Index()
  status: TaskStatus;

  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Column({ type: 'enum', enum: TaskType, default: TaskType.GENERAL })
  @Index()
  type: TaskType;

  @Column({ type: 'timestamp', nullable: true })
  dueDate?: Date;

  @Column({ nullable: true })
  assigneeId?: string;

  @Column()
  @Index()
  platformId: string;

  @Column({ nullable: true })
  externalId?: string;

  @Column({ type: 'json', nullable: true })
  metadata?: {
    tags?: string[];
    labels?: string[];
    estimatedHours?: number;
    actualHours?: number;
    errorDetails?: any;
    automationTrigger?: string;
  };

  @Column({ type: 'json', nullable: true })
  syncStatus?: {
    lastSync: Date;
    syncErrors: string[];
    needsSync: boolean;
  };

  @Column({ default: false })
  isAutomated: boolean;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  // Relations
  @ManyToOne(() => UnifiedUser, user => user.tasks)
  @JoinColumn({ name: 'userId' })
  user: UnifiedUser;
}