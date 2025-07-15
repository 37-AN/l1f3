import { Injectable, Logger } from '@nestjs/common';
import { MCPIntegration, MCPServer, MCPSyncResult, MCPMessage, MCPTransformation } from './interfaces/mcp.interface';
import { MCPServerManager } from './mcp-server-manager.service';
import { MCPEventDispatcher } from './mcp-event-dispatcher.service';

@Injectable()
export class MCPDataSyncService {
  private readonly logger = new Logger(MCPDataSyncService.name);
  private readonly syncResults = new Map<string, MCPSyncResult>();

  constructor(
    private readonly serverManager: MCPServerManager,
    private readonly eventDispatcher: MCPEventDispatcher,
  ) {}

  /**
   * Sync data for a specific integration
   */
  async syncIntegration(integration: MCPIntegration, server: MCPServer): Promise<MCPSyncResult> {
    const startTime = Date.now();
    const result: MCPSyncResult = {
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

      // Get data from source
      const sourceData = await this.fetchSourceData(integration, server);
      result.recordsProcessed = sourceData.length;

      // Transform data according to mapping
      const transformedData = await this.transformData(sourceData, integration);

      // Sync to target system
      const syncResults = await this.syncToTarget(transformedData, integration, server);
      
      result.recordsCreated = syncResults.created;
      result.recordsUpdated = syncResults.updated;
      result.recordsDeleted = syncResults.deleted;
      result.success = true;

      // Update last sync time
      integration.lastSync = new Date();

      // Dispatch sync event
      const syncEvent = this.eventDispatcher.createSyncEvent(
        server.id,
        integration.id,
        { result, sourceData: transformedData }
      );
      await this.eventDispatcher.dispatch(syncEvent);

      this.logger.log(`Sync completed for integration: ${integration.name}`);
      
    } catch (error) {
      result.errors.push(error.message);
      this.logger.error(`Sync failed for integration ${integration.name}:`, error);

      // Dispatch error event
      const errorEvent = this.eventDispatcher.createErrorEvent(
        server.id,
        integration.id,
        error
      );
      await this.eventDispatcher.dispatch(errorEvent);
    }

    result.duration = Date.now() - startTime;
    this.syncResults.set(integration.id, result);
    
    return result;
  }

  /**
   * Fetch data from source system
   */
  private async fetchSourceData(integration: MCPIntegration, server: MCPServer): Promise<any[]> {
    const message: MCPMessage = {
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

  /**
   * Transform data according to mapping configuration
   */
  private async transformData(sourceData: any[], integration: MCPIntegration): Promise<any[]> {
    const transformedData: any[] = [];

    for (const record of sourceData) {
      try {
        const transformedRecord = await this.transformRecord(record, integration);
        transformedData.push(transformedRecord);
      } catch (error) {
        this.logger.warn(`Failed to transform record:`, error);
        continue;
      }
    }

    return transformedData;
  }

  /**
   * Transform individual record
   */
  private async transformRecord(record: any, integration: MCPIntegration): Promise<any> {
    const transformed: any = {};

    // Apply field mappings
    for (let i = 0; i < integration.mapping.sourceFields.length; i++) {
      const sourceField = integration.mapping.sourceFields[i];
      const targetField = integration.mapping.targetFields[i];
      
      if (sourceField && targetField && record[sourceField] !== undefined) {
        transformed[targetField] = record[sourceField];
      }
    }

    // Apply transformations
    for (const transformation of integration.mapping.transformations) {
      transformed[transformation.targetField] = await this.applyTransformation(
        record,
        transformation
      );
    }

    return transformed;
  }

  /**
   * Apply individual transformation
   */
  private async applyTransformation(record: any, transformation: MCPTransformation): Promise<any> {
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

  /**
   * Apply value mapping
   */
  private applyMapping(value: any, expression: string): any {
    try {
      const mappingRules = JSON.parse(expression);
      return mappingRules[value] || value;
    } catch (error) {
      this.logger.warn(`Failed to apply mapping: ${expression}`, error);
      return value;
    }
  }

  /**
   * Apply formatting
   */
  private applyFormatting(value: any, expression: string): any {
    try {
      // Simple string formatting
      if (typeof value === 'string') {
        return expression.replace('{value}', value);
      }
      
      // Date formatting
      if (value instanceof Date) {
        return value.toISOString();
      }
      
      // Number formatting
      if (typeof value === 'number') {
        const precision = parseInt(expression) || 2;
        return value.toFixed(precision);
      }
      
      return value;
    } catch (error) {
      this.logger.warn(`Failed to apply formatting: ${expression}`, error);
      return value;
    }
  }

  /**
   * Apply calculation
   */
  private applyCalculation(record: any, expression: string): any {
    try {
      // Simple mathematical expressions
      // Warning: This is a simplified implementation - use a proper expression parser in production
      const sanitizedExpression = expression.replace(/[^a-zA-Z0-9+\-*/().\s]/g, '');
      
      // Replace field references with values
      let processedExpression = sanitizedExpression;
      for (const [field, value] of Object.entries(record)) {
        if (typeof value === 'number') {
          processedExpression = processedExpression.replace(
            new RegExp(`\\b${field}\\b`, 'g'),
            value.toString()
          );
        }
      }
      
      // Use Function constructor for safer evaluation
      const result = new Function(`return ${processedExpression}`)();
      return result;
    } catch (error) {
      this.logger.warn(`Failed to apply calculation: ${expression}`, error);
      return 0;
    }
  }

  /**
   * Apply filter
   */
  private applyFilter(value: any, expression: string): boolean {
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
    } catch (error) {
      this.logger.warn(`Failed to apply filter: ${expression}`, error);
      return true;
    }
  }

  /**
   * Sync transformed data to target system
   */
  private async syncToTarget(
    transformedData: any[],
    integration: MCPIntegration,
    server: MCPServer
  ): Promise<{ created: number; updated: number; deleted: number }> {
    const message: MCPMessage = {
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

  /**
   * Get sync result for integration
   */
  getSyncResult(integrationId: string): MCPSyncResult | undefined {
    return this.syncResults.get(integrationId);
  }

  /**
   * Get all sync results
   */
  getAllSyncResults(): MCPSyncResult[] {
    return Array.from(this.syncResults.values());
  }

  /**
   * Clear sync results
   */
  clearSyncResults(): void {
    this.syncResults.clear();
  }
}