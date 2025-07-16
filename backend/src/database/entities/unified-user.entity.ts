import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { UnifiedTask } from './unified-task.entity';
import { UnifiedDocument } from './unified-document.entity';
import { UnifiedNotification } from './unified-notification.entity';

@Entity('unified_users')
@Index(['email'], { unique: true })
export class UnifiedUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ default: 'Africa/Johannesburg' })
  timezone: string;

  @Column({ type: 'json', nullable: true })
  preferences?: any;

  @Column({ type: 'json', nullable: true })
  financialTargets?: {
    netWorthTarget: number;
    dailyRevenueTarget: number;
    mrrTarget: number;
    targetDate: string;
  };

  @Column({ type: 'json', nullable: true })
  integrationSettings?: {
    sentry: { enabled: boolean; preferences: any };
    notion: { enabled: boolean; preferences: any };
    asana: { enabled: boolean; preferences: any };
    github: { enabled: boolean; preferences: any };
    slack: { enabled: boolean; preferences: any };
  };

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => UnifiedTask, task => task.user)
  tasks: UnifiedTask[];

  @OneToMany(() => UnifiedDocument, document => document.user)
  documents: UnifiedDocument[];

  @OneToMany(() => UnifiedNotification, notification => notification.user)
  notifications: UnifiedNotification[];
}