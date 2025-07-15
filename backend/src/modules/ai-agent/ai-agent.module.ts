import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScheduleModule } from "@nestjs/schedule";
import { AIAgentService } from "./ai-agent.service";
import { AIAgentController } from "./ai-agent.controller";
import { Goal } from "../../database/entities/goal.entity";
import { Transaction } from "../../database/entities/transaction.entity";
import { BusinessMetrics } from "../../database/entities/business-metrics.entity";
import { GoogleDriveService } from "../integrations/google-drive.service";
import { LoggerModule } from "../../common/logger/logger.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Goal, Transaction, BusinessMetrics]),
    ScheduleModule.forRoot(),
    LoggerModule,
  ],
  controllers: [AIAgentController],
  providers: [AIAgentService, GoogleDriveService],
  exports: [AIAgentService],
})
export class AIAgentModule {}
