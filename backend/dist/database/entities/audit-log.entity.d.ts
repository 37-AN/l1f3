import { User } from './user.entity';
export declare enum AuditAction {
    CREATE = "CREATE",
    UPDATE = "UPDATE",
    DELETE = "DELETE",
    LOGIN = "LOGIN",
    LOGOUT = "LOGOUT",
    SYNC = "SYNC",
    BACKUP = "BACKUP",
    EXPORT = "EXPORT",
    IMPORT = "IMPORT"
}
export declare enum AuditEntityType {
    USER = "USER",
    TRANSACTION = "TRANSACTION",
    ACCOUNT = "ACCOUNT",
    GOAL = "GOAL",
    BUSINESS_METRICS = "BUSINESS_METRICS",
    NET_WORTH_SNAPSHOT = "NET_WORTH_SNAPSHOT",
    SYSTEM = "SYSTEM"
}
export declare class AuditLog {
    id: string;
    action: AuditAction;
    entityType: AuditEntityType;
    entityId: string;
    description: string;
    oldValues: any;
    newValues: any;
    ipAddress: string;
    userAgent: string;
    source: string;
    metadata: {
        requestId?: string;
        sessionId?: string;
        correlation?: string;
    };
    createdAt: Date;
    user: User;
    userId: string;
}
