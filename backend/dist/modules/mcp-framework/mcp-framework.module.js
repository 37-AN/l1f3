"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPFrameworkModule = void 0;
const common_1 = require("@nestjs/common");
const mcp_framework_service_1 = require("./mcp-framework.service");
const mcp_server_manager_service_1 = require("./mcp-server-manager.service");
const mcp_integration_controller_1 = require("./mcp-integration.controller");
const mcp_event_dispatcher_service_1 = require("./mcp-event-dispatcher.service");
const mcp_data_sync_service_1 = require("./mcp-data-sync.service");
const mcp_initialization_service_1 = require("./mcp-initialization.service");
let MCPFrameworkModule = class MCPFrameworkModule {
};
exports.MCPFrameworkModule = MCPFrameworkModule;
exports.MCPFrameworkModule = MCPFrameworkModule = __decorate([
    (0, common_1.Module)({
        controllers: [mcp_integration_controller_1.MCPIntegrationController],
        providers: [
            mcp_framework_service_1.MCPFrameworkService,
            mcp_server_manager_service_1.MCPServerManager,
            mcp_event_dispatcher_service_1.MCPEventDispatcher,
            mcp_data_sync_service_1.MCPDataSyncService,
            mcp_initialization_service_1.MCPInitializationService,
        ],
        exports: [
            mcp_framework_service_1.MCPFrameworkService,
            mcp_server_manager_service_1.MCPServerManager,
            mcp_event_dispatcher_service_1.MCPEventDispatcher,
            mcp_data_sync_service_1.MCPDataSyncService,
            mcp_initialization_service_1.MCPInitializationService,
        ],
    })
], MCPFrameworkModule);
//# sourceMappingURL=mcp-framework.module.js.map