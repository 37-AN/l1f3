import { JwtService } from '@nestjs/jwt';
import { LoggerService } from '../../common/logger/logger.service';
import { SafeUser } from './interfaces/user.interface';
export interface LoginDto {
    email: string;
    password: string;
    rememberMe?: boolean;
}
export interface RegisterDto {
    email: string;
    password: string;
    name: string;
    confirmPassword: string;
}
export interface PasswordChangeDto {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}
export declare class AuthService {
    private readonly jwtService;
    private readonly logger;
    private readonly maxLoginAttempts;
    private readonly lockoutDuration;
    constructor(jwtService: JwtService, logger: LoggerService);
    login(dto: LoginDto, ipAddress?: string, userAgent?: string): Promise<{
        user: SafeUser;
        accessToken: string;
        refreshToken: string;
    }>;
    register(dto: RegisterDto, ipAddress?: string, userAgent?: string): Promise<{
        user: SafeUser;
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string, ipAddress?: string, userAgent?: string): Promise<void>;
    changePassword(userId: string, dto: PasswordChangeDto, ipAddress?: string, userAgent?: string): Promise<void>;
    enableMFA(userId: string, ipAddress?: string, userAgent?: string): Promise<void>;
    disableMFA(userId: string, ipAddress?: string, userAgent?: string): Promise<void>;
    private handleFailedLogin;
    private logFailedLogin;
    private sanitizeUser;
    private findUserByEmail;
    private findUserById;
    private resetFailedLoginAttempts;
    private updateLastLogin;
    private incrementFailedLoginAttempts;
    private lockAccount;
    private updateUserPassword;
    private updateUserMFA;
}
