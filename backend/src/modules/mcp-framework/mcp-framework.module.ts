import { Module } from '@nestjs/common';
import { MCPFrameworkService } from './mcp-framework.service';
import { MCPServerManager } from './mcp-server-manager.service';
import { MCPIntegrationController } from './mcp-integration.controller';
import { MCPEventDispatcher } from './mcp-event-dispatcher.service';
import { MCPDataSyncService } from './mcp-data-sync.service';

@Module({
  controllers: [MCPIntegrationController],
  providers: [
    MCPFrameworkService,
    MCPServerManager,
    MCPEventDispatcher,
    MCPDataSyncService,
  ],
  exports: [
    MCPFrameworkService,
    MCPServerManager,
    MCPEventDispatcher,
    MCPDataSyncService,
  ],
})
export class MCPFrameworkModule {}