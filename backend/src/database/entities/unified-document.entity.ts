import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { UnifiedUser } from './unified-user.entity';

export enum DocumentType {
  FINANCIAL_REPORT = 'financial_report',
  BUSINESS_PLAN = 'business_plan',
  GOAL_TRACKING = 'goal_tracking',
  SYSTEM_DOCUMENTATION = 'system_documentation',
  ERROR_REPORT = 'error_report',
  AUTOMATION_LOG = 'automation_log',
  GENERAL = 'general'
}

export enum DocumentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  DELETED = 'deleted'
}

@Entity('unified_documents')
@Index(['userId', 'type'])
@Index(['platformId', 'externalId'], { unique: true })
export class UnifiedDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ type: 'enum', enum: DocumentType, default: DocumentType.GENERAL })
  @Index()
  type: DocumentType;

  @Column({ type: 'enum', enum: DocumentStatus, default: DocumentStatus.DRAFT })
  @Index()
  status: DocumentStatus;

  @Column({ nullable: true })
  url?: string;

  @Column({ type: 'bigint', nullable: true })
  size?: number;

  @Column({ nullable: true })
  mimeType?: string;

  @Column()
  @Index()
  platformId: string;

  @Column({ nullable: true })
  externalId?: string;

  @Column({ type: 'json', nullable: true })
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

  @Column({ type: 'json', nullable: true })
  syncStatus?: {
    lastSync: Date;
    syncErrors: string[];
    needsSync: boolean;
  };

  @Column({ type: 'json', nullable: true })
  aiAnalysis?: {
    summary?: string;
    insights?: string[];
    recommendations?: string[];
    sentiment?: 'positive' | 'negative' | 'neutral';
    keywords?: string[];
  };

  @Column({ default: false })
  isAutomated: boolean;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastAccessedAt?: Date;

  // Relations
  @ManyToOne(() => UnifiedUser, user => user.documents)
  @JoinColumn({ name: 'userId' })
  user: UnifiedUser;
}