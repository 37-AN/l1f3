import { Module } from '@nestjs/common';
import { MCPFrameworkService } from './mcp-framework.service';
import { MCPServerManager } from './mcp-server-manager.service';
import { MCPIntegrationController } from './mcp-integration.controller';
import { MCPEventDispatcher } from './mcp-event-dispatcher.service';
import { MCPDataSyncService } from './mcp-data-sync.service';
import { MCPInitializationService } from './mcp-initialization.service';

@Module({
  controllers: [MCPIntegrationController],
  providers: [
    MCPFrameworkService,
    MCPServerManager,
    MCPEventDispatcher,
    MCPDataSyncService,
    MCPInitializationService,
  ],
  exports: [
    MCPFrameworkService,
    MCPServerManager,
    MCPEventDispatcher,
    MCPDataSyncService,
    MCPInitializationService,
  ],
})
export class MCPFrameworkModule {}