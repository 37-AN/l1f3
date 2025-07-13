"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
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
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'sqlite',
                    database: './storage/lif3_database.sqlite',
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
                    synchronize: configService.get('NODE_ENV') !== 'production',
                    logging: configService.get('NODE_ENV') === 'development',
                    retryAttempts: 3,
                    retryDelay: 3000,
                }),
            }),
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                transaction_entity_1.Transaction,
                account_entity_1.Account,
                account_balance_entity_1.AccountBalance,
                net_worth_snapshot_entity_1.NetWorthSnapshot,
                business_metrics_entity_1.BusinessMetrics,
                goal_entity_1.Goal,
                audit_log_entity_1.AuditLog,
                security_event_entity_1.SecurityEvent,
            ]),
        ],
        exports: [typeorm_1.TypeOrmModule],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map