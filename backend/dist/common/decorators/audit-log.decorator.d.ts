export declare const AUDIT_LOG_KEY = "auditLog";
export interface AuditLogOptions {
    entity: 'TRANSACTION' | 'ACCOUNT' | 'GOAL' | 'BALANCE' | 'USER' | 'BUSINESS_METRIC';
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW';
    sensitive?: boolean;
    description?: string;
}
export declare const AuditLog: (options: AuditLogOptions) => import("@nestjs/common").CustomDecorator<string>;
export declare const LogFinancialTransaction: (description?: string) => import("@nestjs/common").CustomDecorator<string>;
export declare const LogAccountUpdate: (description?: string) => import("@nestjs/common").CustomDecorator<string>;
export declare const LogGoalProgress: (description?: string) => import("@nestjs/common").CustomDecorator<string>;
export declare const LogBusinessMetric: (description?: string) => import("@nestjs/common").CustomDecorator<string>;
export declare const LogSecurityEvent: (description?: string) => import("@nestjs/common").CustomDecorator<string>;
export declare const LogIntegrationEvent: (description?: string) => import("@nestjs/common").CustomDecorator<string>;
