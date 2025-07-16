declare const _default: (() => {
    logLevel: string;
    healthCheckInterval: number;
    syncTimeout: number;
    maxRetries: number;
    circuitBreakerThreshold: number;
    batchSize: number;
    cacheTimeout: number;
    servers: {
        sentry: {
            id: string;
            name: string;
            description: string;
            enabled: boolean;
            config: {
                host: string;
                port: number;
                apiKey: string;
                timeout: number;
                maxRetries: number;
                org: string;
                project: string;
            };
        };
        notion: {
            id: string;
            name: string;
            description: string;
            enabled: boolean;
            config: {
                host: string;
                port: number;
                apiKey: string;
                timeout: number;
                maxRetries: number;
                databaseId: string;
                netWorthGoalId: string;
            };
        };
        asana: {
            id: string;
            name: string;
            description: string;
            enabled: boolean;
            config: {
                host: string;
                port: number;
                apiKey: string;
                timeout: number;
                maxRetries: number;
                lif3ProjectId: string;
                errorProjectId: string;
                workspaceId: string;
            };
        };
        github: {
            id: string;
            name: string;
            description: string;
            enabled: boolean;
            config: {
                host: string;
                port: number;
                apiKey: string;
                timeout: number;
                maxRetries: number;
                owner: string;
                repo: string;
            };
        };
        slack: {
            id: string;
            name: string;
            description: string;
            enabled: boolean;
            config: {
                host: string;
                port: number;
                apiKey: string;
                timeout: number;
                maxRetries: number;
                channel: string;
            };
        };
        cloudflare: {
            id: string;
            name: string;
            description: string;
            enabled: boolean;
            config: {
                host: string;
                port: number;
                apiKey: string;
                timeout: number;
                maxRetries: number;
                zoneId: string;
            };
        };
        canva: {
            id: string;
            name: string;
            description: string;
            enabled: boolean;
            config: {
                host: string;
                port: number;
                apiKey: string;
                timeout: number;
                maxRetries: number;
                brandId: string;
            };
        };
    };
    integrations: {
        errorToTask: {
            id: string;
            name: string;
            description: string;
            enabled: boolean;
            autoSync: boolean;
            syncInterval: number;
            mapping: {
                sourceFields: string[];
                targetFields: string[];
                transformations: {
                    type: string;
                    sourceField: string;
                    targetField: string;
                    expression: string;
                }[];
            };
        };
        goalTracking: {
            id: string;
            name: string;
            description: string;
            enabled: boolean;
            autoSync: boolean;
            syncInterval: number;
            mapping: {
                sourceFields: string[];
                targetFields: string[];
                transformations: {
                    type: string;
                    sourceField: string;
                    targetField: string;
                    expression: string;
                }[];
            };
        };
        businessMetrics: {
            id: string;
            name: string;
            description: string;
            enabled: boolean;
            autoSync: boolean;
            syncInterval: number;
            mapping: {
                sourceFields: string[];
                targetFields: string[];
                transformations: {
                    type: string;
                    sourceField: string;
                    targetField: string;
                    expression: string;
                }[];
            };
        };
        documentationSync: {
            id: string;
            name: string;
            description: string;
            enabled: boolean;
            autoSync: boolean;
            syncInterval: number;
            mapping: {
                sourceFields: string[];
                targetFields: string[];
                transformations: {
                    type: string;
                    sourceField: string;
                    targetField: string;
                    expression: string;
                }[];
            };
        };
    };
    automationRules: {
        dailyBriefing: {
            enabled: boolean;
            schedule: string;
            actions: string[];
        };
        goalMonitoring: {
            enabled: boolean;
            interval: string;
            actions: string[];
        };
        revenueTracking: {
            enabled: boolean;
            interval: string;
            actions: string[];
        };
        expenseAnalysis: {
            enabled: boolean;
            interval: string;
            actions: string[];
        };
    };
    performance: {
        enableCaching: boolean;
        cacheTimeout: number;
        enableBatching: boolean;
        batchSize: number;
        maxConcurrentSyncs: number;
        enableCircuitBreaker: boolean;
        circuitBreakerThreshold: number;
    };
    security: {
        enableRateLimiting: boolean;
        rateLimitWindow: number;
        rateLimitMaxRequests: number;
        enableEncryption: boolean;
        encryptionKey: string;
        enableAuditLogging: boolean;
    };
    webhooks: {
        enabled: boolean;
        secret: string;
        endpoints: {
            sentry: string;
            asana: string;
            notion: string;
            github: string;
        };
    };
    financialTargets: {
        netWorthTarget: number;
        dailyRevenueTarget: number;
        mrrTarget: number;
    };
    errorHandling: {
        enableRetry: boolean;
        maxRetries: number;
        retryDelay: number;
        enableFallback: boolean;
        fallbackMode: string;
        enableNotifications: boolean;
        notificationChannels: string[];
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    logLevel: string;
    healthCheckInterval: number;
    syncTimeout: number;
    maxRetries: number;
    circuitBreakerThreshold: number;
    batchSize: number;
    cacheTimeout: number;
    servers: {
        sentry: {
            id: string;
            name: string;
            description: string;
            enabled: boolean;
            config: {
                host: string;
                port: number;
                apiKey: string;
                timeout: number;
                maxRetries: number;
                org: string;
                project: string;
            };
        };
        notion: {
            id: string;
            name: string;
            description: string;
            enabled: boolean;
            config: {
                host: string;
                port: number;
                apiKey: string;
                timeout: number;
                maxRetries: number;
                databaseId: string;
                netWorthGoalId: string;
            };
        };
        asana: {
            id: string;
            name: string;
            description: string;
            enabled: boolean;
            config: {
                host: string;
                port: number;
                apiKey: string;
                timeout: number;
                maxRetries: number;
                lif3ProjectId: string;
                errorProjectId: string;
                workspaceId: string;
            };
        };
        github: {
            id: string;
            name: string;
            description: string;
            enabled: boolean;
            config: {
                host: string;
                port: number;
                apiKey: string;
                timeout: number;
                maxRetries: number;
                owner: string;
                repo: string;
            };
        };
        slack: {
            id: string;
            name: string;
            description: string;
            enabled: boolean;
            config: {
                host: string;
                port: number;
                apiKey: string;
                timeout: number;
                maxRetries: number;
                channel: string;
            };
        };
        cloudflare: {
            id: string;
            name: string;
            description: string;
            enabled: boolean;
            config: {
                host: string;
                port: number;
                apiKey: string;
                timeout: number;
                maxRetries: number;
                zoneId: string;
            };
        };
        canva: {
            id: string;
            name: string;
            description: string;
            enabled: boolean;
            config: {
                host: string;
                port: number;
                apiKey: string;
                timeout: number;
                maxRetries: number;
                brandId: string;
            };
        };
    };
    integrations: {
        errorToTask: {
            id: string;
            name: string;
            description: string;
            enabled: boolean;
            autoSync: boolean;
            syncInterval: number;
            mapping: {
                sourceFields: string[];
                targetFields: string[];
                transformations: {
                    type: string;
                    sourceField: string;
                    targetField: string;
                    expression: string;
                }[];
            };
        };
        goalTracking: {
            id: string;
            name: string;
            description: string;
            enabled: boolean;
            autoSync: boolean;
            syncInterval: number;
            mapping: {
                sourceFields: string[];
                targetFields: string[];
                transformations: {
                    type: string;
                    sourceField: string;
                    targetField: string;
                    expression: string;
                }[];
            };
        };
        businessMetrics: {
            id: string;
            name: string;
            description: string;
            enabled: boolean;
            autoSync: boolean;
            syncInterval: number;
            mapping: {
                sourceFields: string[];
                targetFields: string[];
                transformations: {
                    type: string;
                    sourceField: string;
                    targetField: string;
                    expression: string;
                }[];
            };
        };
        documentationSync: {
            id: string;
            name: string;
            description: string;
            enabled: boolean;
            autoSync: boolean;
            syncInterval: number;
            mapping: {
                sourceFields: string[];
                targetFields: string[];
                transformations: {
                    type: string;
                    sourceField: string;
                    targetField: string;
                    expression: string;
                }[];
            };
        };
    };
    automationRules: {
        dailyBriefing: {
            enabled: boolean;
            schedule: string;
            actions: string[];
        };
        goalMonitoring: {
            enabled: boolean;
            interval: string;
            actions: string[];
        };
        revenueTracking: {
            enabled: boolean;
            interval: string;
            actions: string[];
        };
        expenseAnalysis: {
            enabled: boolean;
            interval: string;
            actions: string[];
        };
    };
    performance: {
        enableCaching: boolean;
        cacheTimeout: number;
        enableBatching: boolean;
        batchSize: number;
        maxConcurrentSyncs: number;
        enableCircuitBreaker: boolean;
        circuitBreakerThreshold: number;
    };
    security: {
        enableRateLimiting: boolean;
        rateLimitWindow: number;
        rateLimitMaxRequests: number;
        enableEncryption: boolean;
        encryptionKey: string;
        enableAuditLogging: boolean;
    };
    webhooks: {
        enabled: boolean;
        secret: string;
        endpoints: {
            sentry: string;
            asana: string;
            notion: string;
            github: string;
        };
    };
    financialTargets: {
        netWorthTarget: number;
        dailyRevenueTarget: number;
        mrrTarget: number;
    };
    errorHandling: {
        enableRetry: boolean;
        maxRetries: number;
        retryDelay: number;
        enableFallback: boolean;
        fallbackMode: string;
        enableNotifications: boolean;
        notificationChannels: string[];
    };
}>;
export default _default;
