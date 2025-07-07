import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { Transaction } from './entities/transaction.entity';
import { Account } from './entities/account.entity';
import { AccountBalance } from './entities/account-balance.entity';
import { NetWorthSnapshot } from './entities/net-worth-snapshot.entity';
import { BusinessMetrics } from './entities/business-metrics.entity';
import { Goal } from './entities/goal.entity';
import { AuditLog } from './entities/audit-log.entity';
import { SecurityEvent } from './entities/security-event.entity';

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'ccladysmith',
  password: 'password123',
  database: 'lif3_db',
  entities: [
    User,
    Transaction,
    Account,
    AccountBalance,
    NetWorthSnapshot,
    BusinessMetrics,
    Goal,
    AuditLog,
    SecurityEvent,
  ],
  synchronize: true,
  logging: true,
});