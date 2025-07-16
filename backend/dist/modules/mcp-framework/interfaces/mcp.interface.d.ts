export interface MCPMessage {
    jsonrpc: '2.0';
    id?: string | number;
    method?: string;
    params?: any;
    result?: any;
    error?: MCPError;
}
export interface MCPError {
    code: number;
    message: string;
    data?: any;
}
export interface MCPServer {
    id: string;
    name: string;
    description: string;
    version: string;
    capabilities: MCPCapability[];
    endpoints: MCPEndpoint[];
    status: 'connected' | 'disconnected' | 'error';
    lastSync?: Date;
    config: MCPServerConfig;
}
export interface MCPCapability {
    name: string;
    version: string;
    description: string;
    methods: string[];
}
export interface MCPEndpoint {
    method: string;
    description: string;
    parameters: MCPParameter[];
    returns: MCPReturnType;
}
export interface MCPParameter {
    name: string;
    type: string;
    required: boolean;
    description: string;
}
export interface MCPReturnType {
    type: string;
    description: string;
    schema?: any;
}
export interface MCPServerConfig {
    host: string;
    port: number;
    apiKey?: string;
    authToken?: string;
    webhookUrl?: string;
    pollInterval?: number;
    maxRetries?: number;
    timeout?: number;
}
export interface MCPIntegration {
    id: string;
    serverId: string;
    name: string;
    description: string;
    enabled: boolean;
    autoSync: boolean;
    syncInterval: number;
    lastSync?: Date;
    config: any;
    mapping: MCPDataMapping;
}
export interface MCPDataMapping {
    sourceFields: string[];
    targetFields: string[];
    transformations: MCPTransformation[];
}
export interface MCPTransformation {
    type: 'map' | 'format' | 'calculate' | 'filter';
    sourceField: string;
    targetField: string;
    expression: string;
    parameters?: any;
}
export interface MCPEvent {
    id: string;
    type: 'sync' | 'update' | 'create' | 'delete' | 'error';
    serverId: string;
    integrationId?: string;
    timestamp: Date;
    data: any;
    processed: boolean;
}
export interface MCPSyncResult {
    serverId: string;
    integrationId: string;
    success: boolean;
    recordsProcessed: number;
    recordsCreated: number;
    recordsUpdated: number;
    recordsDeleted: number;
    errors: string[];
    duration: number;
    timestamp: Date;
}
export interface MCPUnifiedSchema {
    entities: MCPEntity[];
    relationships: MCPRelationship[];
    version: string;
}
export interface MCPEntity {
    name: string;
    description: string;
    fields: MCPField[];
    indexes: MCPIndex[];
}
export interface MCPField {
    name: string;
    type: string;
    required: boolean;
    unique?: boolean;
    description: string;
    defaultValue?: any;
}
export interface MCPIndex {
    name: string;
    fields: string[];
    unique: boolean;
}
export interface MCPRelationship {
    name: string;
    from: string;
    to: string;
    type: 'one-to-one' | 'one-to-many' | 'many-to-many';
    cascadeDelete?: boolean;
}
