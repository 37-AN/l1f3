import { User } from './user.entity';
export declare enum SecurityEventType {
    LOGIN_ATTEMPT = "LOGIN_ATTEMPT",
    LOGIN_SUCCESS = "LOGIN_SUCCESS",
    LOGIN_FAILED = "LOGIN_FAILED",
    ACCOUNT_LOCKED = "ACCOUNT_LOCKED",
    ACCOUNT_UNLOCKED = "ACCOUNT_UNLOCKED",
    PASSWORD_CHANGED = "PASSWORD_CHANGED",
    MFA_ENABLED = "MFA_ENABLED",
    MFA_DISABLED = "MFA_DISABLED",
    SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
    DATA_BREACH_ATTEMPT = "DATA_BREACH_ATTEMPT",
    UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS",
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"
}
export declare enum SecuritySeverity {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export declare class SecurityEvent {
    id: string;
    eventType: SecurityEventType;
    severity: SecuritySeverity;
    description: string;
    sourceIp: string;
    userAgent: string;
    location: string;
    isResolved: boolean;
    resolution: string;
    metadata: {
        requestId?: string;
        sessionId?: string;
        endpoint?: string;
        method?: string;
        statusCode?: number;
        attempts?: number;
    };
    createdAt: Date;
    user: User;
    userId: string;
}
