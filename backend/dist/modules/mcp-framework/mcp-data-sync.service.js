"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MCPDataSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPDataSyncService = void 0;
const common_1 = require("@nestjs/common");
const mcp_server_manager_service_1 = require("./mcp-server-manager.service");
const mcp_event_dispatcher_service_1 = require("./mcp-event-dispatcher.service");
let MCPDataSyncService = MCPDataSyncService_1 = class MCPDataSyncService {
    constructor(serverManager, eventDispatcher) {
        this.serverManager = serverManager;
        this.eventDispatcher = eventDispatcher;
        this.logger = new common_1.Logger(MCPDataSyncService_1.name);
        this.syncResults = new Map();
    }
    async syncIntegration(integration, server) {
        const startTime = Date.now();
        const result = {
            serverId: server.id,
            integrationId: integration.id,
            success: false,
            recordsProcessed: 0,
            recordsCreated: 0,
            recordsUpdated: 0,
            recordsDeleted: 0,
            errors: [],
            duration: 0,
            timestamp: new Date(),
        };
        try {
            this.logger.log(`Starting sync for integration: ${integration.name}`);
            const sourceData = await this.fetchSourceData(integration, server);
            result.recordsProcessed = sourceData.length;
            const transformedData = await this.transformData(sourceData, integration);
            const syncResults = await this.syncToTarget(transformedData, integration, server);
            result.recordsCreated = syncResults.created;
            result.recordsUpdated = syncResults.updated;
            result.recordsDeleted = syncResults.deleted;
            result.success = true;
            integration.lastSync = new Date();
            const syncEvent = this.eventDispatcher.createSyncEvent(server.id, integration.id, { result, sourceData: transformedData });
            await this.eventDispatcher.dispatch(syncEvent);
            this.logger.log(`Sync completed for integration: ${integration.name}`);
        }
        catch (error) {
            result.errors.push(error.message);
            this.logger.error(`Sync failed for integration ${integration.name}:`, error);
            const errorEvent = this.eventDispatcher.createErrorEvent(server.id, integration.id, error);
            await this.eventDispatcher.dispatch(errorEvent);
        }
        result.duration = Date.now() - startTime;
        this.syncResults.set(integration.id, result);
        return result;
    }
    async fetchSourceData(integration, server) {
        const message = {
            jsonrpc: '2.0',
            id: `sync_${integration.id}`,
            method: 'fetch_data',
            params: {
                integration_id: integration.id,
                config: integration.config,
            },
        };
        const response = await this.serverManager.sendMessage(server, message);
        if (response.error) {
            throw new Error(`Failed to fetch data: ${response.error.message}`);
        }
        return response.result.data || [];
    }
    async transformData(sourceData, integration) {
        const transformedData = [];
        for (const record of sourceData) {
            try {
                const transformedRecord = await this.transformRecord(record, integration);
                transformedData.push(transformedRecord);
            }
            catch (error) {
                this.logger.warn(`Failed to transform record:`, error);
                continue;
            }
        }
        return transformedData;
    }
    async transformRecord(record, integration) {
        const transformed = {};
        for (let i = 0; i < integration.mapping.sourceFields.length; i++) {
            const sourceField = integration.mapping.sourceFields[i];
            const targetField = integration.mapping.targetFields[i];
            if (sourceField && targetField && record[sourceField] !== undefined) {
                transformed[targetField] = record[sourceField];
            }
        }
        for (const transformation of integration.mapping.transformations) {
            transformed[transformation.targetField] = await this.applyTransformation(record, transformation);
        }
        return transformed;
    }
    async applyTransformation(record, transformation) {
        const sourceValue = record[transformation.sourceField];
        switch (transformation.type) {
            case 'map':
                return this.applyMapping(sourceValue, transformation.expression);
            case 'format':
                return this.applyFormatting(sourceValue, transformation.expression);
            case 'calculate':
                return this.applyCalculation(record, transformation.expression);
            case 'filter':
                return this.applyFilter(sourceValue, transformation.expression);
            default:
                return sourceValue;
        }
    }
    applyMapping(value, expression) {
        try {
            const mappingRules = JSON.parse(expression);
            return mappingRules[value] || value;
        }
        catch (error) {
            this.logger.warn(`Failed to apply mapping: ${expression}`, error);
            return value;
        }
    }
    applyFormatting(value, expression) {
        try {
            if (typeof value === 'string') {
                return expression.replace('{value}', value);
            }
            if (value instanceof Date) {
                return value.toISOString();
            }
            if (typeof value === 'number') {
                const precision = parseInt(expression) || 2;
                return value.toFixed(precision);
            }
            return value;
        }
        catch (error) {
            this.logger.warn(`Failed to apply formatting: ${expression}`, error);
            return value;
        }
    }
    applyCalculation(record, expression) {
        try {
            const sanitizedExpression = expression.replace(/[^a-zA-Z0-9+\-*/().\s]/g, '');
            let processedExpression = sanitizedExpression;
            for (const [field, value] of Object.entries(record)) {
                if (typeof value === 'number') {
                    processedExpression = processedExpression.replace(new RegExp(`\\b${field}\\b`, 'g'), value.toString());
                }
            }
            const result = new Function(`return ${processedExpression}`)();
            return result;
        }
        catch (error) {
            this.logger.warn(`Failed to apply calculation: ${expression}`, error);
            return 0;
        }
    }
    applyFilter(value, expression) {
        try {
            const filterRules = JSON.parse(expression);
            if (filterRules.operator === 'equals') {
                return value === filterRules.value;
            }
            if (filterRules.operator === 'contains') {
                return value.toString().includes(filterRules.value);
            }
            if (filterRules.operator === 'greater_than') {
                return value > filterRules.value;
            }
            if (filterRules.operator === 'less_than') {
                return value < filterRules.value;
            }
            return true;
        }
        catch (error) {
            this.logger.warn(`Failed to apply filter: ${expression}`, error);
            return true;
        }
    }
    async syncToTarget(transformedData, integration, server) {
        const message = {
            jsonrpc: '2.0',
            id: `sync_target_${integration.id}`,
            method: 'sync_to_target',
            params: {
                integration_id: integration.id,
                data: transformedData,
                config: integration.config,
            },
        };
        const response = await this.serverManager.sendMessage(server, message);
        if (response.error) {
            throw new Error(`Failed to sync to target: ${response.error.message}`);
        }
        return response.result.stats || { created: 0, updated: 0, deleted: 0 };
    }
    getSyncResult(integrationId) {
        return this.syncResults.get(integrationId);
    }
    getAllSyncResults() {
        return Array.from(this.syncResults.values());
    }
    clearSyncResults() {
        this.syncResults.clear();
    }
};
exports.MCPDataSyncService = MCPDataSyncService;
exports.MCPDataSyncService = MCPDataSyncService = MCPDataSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mcp_server_manager_service_1.MCPServerManager,
        mcp_event_dispatcher_service_1.MCPEventDispatcher])
], MCPDataSyncService);
//# sourceMappingURL=mcp-data-sync.service.js.map