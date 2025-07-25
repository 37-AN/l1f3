"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const config_1 = require("@nestjs/config");
const user_entity_1 = require("./entities/user.entity");
const transaction_entity_1 = require("./entities/transaction.entity");
const account_entity_1 = require("./entities/account.entity");
const account_balance_entity_1 = require("./entities/account-balance.entity");
const net_worth_snapshot_entity_1 = require("./entities/net-worth-snapshot.entity");
const business_metrics_entity_1 = require("./entities/business-metrics.entity");
const goal_entity_1 = require("./entities/goal.entity");
const audit_log_entity_1 = require("./entities/audit-log.entity");
const security_event_entity_1 = require("./entities/security-event.entity");
const configService = new config_1.ConfigService();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'ccladysmith',
    password: 'password123',
    database: 'lif3_db',
    entities: [
        user_entity_1.User,
        transaction_entity_1.Transaction,
        account_entity_1.Account,
        account_balance_entity_1.AccountBalance,
        net_worth_snapshot_entity_1.NetWorthSnapshot,
        business_metrics_entity_1.BusinessMetrics,
        goal_entity_1.Goal,
        audit_log_entity_1.AuditLog,
        security_event_entity_1.SecurityEvent,
    ],
    synchronize: true,
    logging: true,
});
//# sourceMappingURL=data-source.js.map