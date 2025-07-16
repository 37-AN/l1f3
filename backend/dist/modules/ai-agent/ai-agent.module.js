"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAgentModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const ai_agent_service_1 = require("./ai-agent.service");
const ai_agent_controller_1 = require("./ai-agent.controller");
const goal_entity_1 = require("../../database/entities/goal.entity");
const transaction_entity_1 = require("../../database/entities/transaction.entity");
const business_metrics_entity_1 = require("../../database/entities/business-metrics.entity");
const google_drive_service_1 = require("../integrations/google-drive.service");
const logger_module_1 = require("../../common/logger/logger.module");
let AIAgentModule = class AIAgentModule {
};
exports.AIAgentModule = AIAgentModule;
exports.AIAgentModule = AIAgentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([goal_entity_1.Goal, transaction_entity_1.Transaction, business_metrics_entity_1.BusinessMetrics]),
            schedule_1.ScheduleModule.forRoot(),
            logger_module_1.LoggerModule,
        ],
        controllers: [ai_agent_controller_1.AIAgentController],
        providers: [ai_agent_service_1.AIAgentService, google_drive_service_1.GoogleDriveService],
        exports: [ai_agent_service_1.AIAgentService],
    })
], AIAgentModule);
//# sourceMappingURL=ai-agent.module.js.map