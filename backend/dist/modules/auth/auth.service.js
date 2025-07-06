"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
const logger_service_1 = require("../../common/logger/logger.service");
let AuthService = class AuthService {
    constructor(jwtService, logger) {
        this.jwtService = jwtService;
        this.logger = logger;
        this.maxLoginAttempts = 5;
        this.lockoutDuration = 15 * 60 * 1000;
    }
    async login(dto, ipAddress, userAgent) {
        const startTime = Date.now();
        try {
            const user = await this.findUserByEmail(dto.email);
            if (!user) {
                await this.logFailedLogin(dto.email, 'USER_NOT_FOUND', ipAddress, userAgent);
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            if (user.accountLocked) {
                await this.logFailedLogin(dto.email, 'ACCOUNT_LOCKED', ipAddress, userAgent);
                throw new common_1.UnauthorizedException('Account is locked. Please contact support.');
            }
            if (!user.isActive) {
                await this.logFailedLogin(dto.email, 'ACCOUNT_INACTIVE', ipAddress, userAgent);
                throw new common_1.UnauthorizedException('Account is not active');
            }
            const isPasswordValid = await bcrypt.compare(dto.password, user.password);
            if (!isPasswordValid) {
                await this.handleFailedLogin(user, ipAddress, userAgent);
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            await this.resetFailedLoginAttempts(user.id);
            await this.updateLastLogin(user.id);
            const payload = {
                sub: user.id,
                email: user.email,
                role: user.role
            };
            const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
            const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
            this.logger.logSecurityEvent({
                userId: user.id,
                action: 'LOGIN',
                ipAddress,
                userAgent,
                timestamp: new Date(),
                riskLevel: 'LOW',
                metadata: {
                    email: user.email,
                    rememberMe: dto.rememberMe,
                    loginDuration: Date.now() - startTime
                }
            });
            const duration = Date.now() - startTime;
            this.logger.logPerformanceMetric('USER_LOGIN', duration, 'ms', 'AuthService');
            this.logger.log(`User logged in successfully: ${user.email}`, 'AuthService');
            return {
                user: this.sanitizeUser(user),
                accessToken,
                refreshToken
            };
        }
        catch (error) {
            this.logger.error(`Login failed: ${error.message}`, error.stack, 'AuthService');
            throw error;
        }
    }
    async register(dto, ipAddress, userAgent) {
        const startTime = Date.now();
        try {
            if (dto.password !== dto.confirmPassword) {
                throw new common_1.BadRequestException('Passwords do not match');
            }
            const existingUser = await this.findUserByEmail(dto.email);
            if (existingUser) {
                this.logger.logSecurityEvent({
                    userId: 'unknown',
                    action: 'REGISTER',
                    ipAddress,
                    userAgent,
                    timestamp: new Date(),
                    riskLevel: 'MEDIUM',
                    metadata: {
                        email: dto.email,
                        error: 'EMAIL_ALREADY_EXISTS'
                    }
                });
                throw new common_1.BadRequestException('Email already exists');
            }
            const passwordHash = await bcrypt.hash(dto.password, 12);
            const user = {
                id: 'user_' + Date.now(),
                email: dto.email,
                firstName: dto.name.split(' ')[0] || dto.name,
                lastName: dto.name.split(' ').slice(1).join(' ') || 'User',
                name: dto.name,
                password: passwordHash,
                role: 'USER',
                isActive: true,
                lastLogin: new Date(),
                failedLoginAttempts: 0,
                accountLocked: false,
                mfaEnabled: false,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const payload = {
                sub: user.id,
                email: user.email,
                role: user.role
            };
            const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
            const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
            this.logger.logSecurityEvent({
                userId: user.id,
                action: 'REGISTER',
                ipAddress,
                userAgent,
                timestamp: new Date(),
                riskLevel: 'LOW',
                metadata: {
                    email: user.email,
                    name: user.name,
                    registrationDuration: Date.now() - startTime
                }
            });
            const duration = Date.now() - startTime;
            this.logger.logPerformanceMetric('USER_REGISTRATION', duration, 'ms', 'AuthService');
            this.logger.log(`User registered successfully: ${user.email}`, 'AuthService');
            return {
                user: this.sanitizeUser(user),
                accessToken,
                refreshToken
            };
        }
        catch (error) {
            this.logger.error(`Registration failed: ${error.message}`, error.stack, 'AuthService');
            throw error;
        }
    }
    async logout(userId, ipAddress, userAgent) {
        try {
            this.logger.logSecurityEvent({
                userId,
                action: 'LOGOUT',
                ipAddress,
                userAgent,
                timestamp: new Date(),
                riskLevel: 'LOW',
                metadata: {
                    logoutType: 'MANUAL'
                }
            });
            this.logger.log(`User logged out: ${userId}`, 'AuthService');
        }
        catch (error) {
            this.logger.error(`Logout failed: ${error.message}`, error.stack, 'AuthService');
        }
    }
    async changePassword(userId, dto, ipAddress, userAgent) {
        try {
            const user = await this.findUserById(userId);
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
            }
            const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                this.logger.logSecurityEvent({
                    userId,
                    action: 'PASSWORD_CHANGE',
                    ipAddress,
                    userAgent,
                    timestamp: new Date(),
                    riskLevel: 'HIGH',
                    metadata: {
                        error: 'INVALID_CURRENT_PASSWORD'
                    }
                });
                throw new common_1.UnauthorizedException('Current password is incorrect');
            }
            if (dto.newPassword !== dto.confirmPassword) {
                throw new common_1.BadRequestException('New passwords do not match');
            }
            const newPasswordHash = await bcrypt.hash(dto.newPassword, 12);
            await this.updateUserPassword(userId, newPasswordHash);
            this.logger.logSecurityEvent({
                userId,
                action: 'PASSWORD_CHANGE',
                ipAddress,
                userAgent,
                timestamp: new Date(),
                riskLevel: 'MEDIUM',
                metadata: {
                    success: true
                }
            });
            this.logger.log(`Password changed successfully for user: ${userId}`, 'AuthService');
        }
        catch (error) {
            this.logger.error(`Password change failed: ${error.message}`, error.stack, 'AuthService');
            throw error;
        }
    }
    async enableMFA(userId, ipAddress, userAgent) {
        try {
            await this.updateUserMFA(userId, true);
            this.logger.logSecurityEvent({
                userId,
                action: 'MFA_ENABLED',
                ipAddress,
                userAgent,
                timestamp: new Date(),
                riskLevel: 'LOW',
                metadata: {
                    mfaEnabled: true
                }
            });
            this.logger.log(`MFA enabled for user: ${userId}`, 'AuthService');
        }
        catch (error) {
            this.logger.error(`MFA enable failed: ${error.message}`, error.stack, 'AuthService');
            throw error;
        }
    }
    async disableMFA(userId, ipAddress, userAgent) {
        try {
            await this.updateUserMFA(userId, false);
            this.logger.logSecurityEvent({
                userId,
                action: 'MFA_DISABLED',
                ipAddress,
                userAgent,
                timestamp: new Date(),
                riskLevel: 'MEDIUM',
                metadata: {
                    mfaEnabled: false
                }
            });
            this.logger.log(`MFA disabled for user: ${userId}`, 'AuthService');
        }
        catch (error) {
            this.logger.error(`MFA disable failed: ${error.message}`, error.stack, 'AuthService');
            throw error;
        }
    }
    async handleFailedLogin(user, ipAddress, userAgent) {
        const newFailedAttempts = user.failedLoginAttempts + 1;
        if (newFailedAttempts >= this.maxLoginAttempts) {
            await this.lockAccount(user.id);
            this.logger.logSecurityEvent({
                userId: user.id,
                action: 'ACCOUNT_LOCKED',
                ipAddress,
                userAgent,
                timestamp: new Date(),
                riskLevel: 'HIGH',
                metadata: {
                    email: user.email,
                    failedAttempts: newFailedAttempts,
                    lockoutDuration: this.lockoutDuration
                }
            });
        }
        else {
            await this.incrementFailedLoginAttempts(user.id);
            this.logger.logSecurityEvent({
                userId: user.id,
                action: 'FAILED_LOGIN',
                ipAddress,
                userAgent,
                timestamp: new Date(),
                riskLevel: newFailedAttempts >= 3 ? 'HIGH' : 'MEDIUM',
                metadata: {
                    email: user.email,
                    failedAttempts: newFailedAttempts,
                    remainingAttempts: this.maxLoginAttempts - newFailedAttempts
                }
            });
        }
    }
    async logFailedLogin(email, reason, ipAddress, userAgent) {
        this.logger.logSecurityEvent({
            userId: 'unknown',
            action: 'FAILED_LOGIN',
            ipAddress,
            userAgent,
            timestamp: new Date(),
            riskLevel: 'HIGH',
            metadata: {
                email,
                reason
            }
        });
    }
    sanitizeUser(user) {
        const { password, ...sanitizedUser } = user;
        return sanitizedUser;
    }
    async findUserByEmail(email) {
        if (email === 'ethan@43v3r.ai') {
            return {
                id: 'ethan_barnes',
                email: 'ethan@43v3r.ai',
                firstName: 'Ethan',
                lastName: 'Barnes',
                name: 'Ethan Barnes',
                password: '$2a$12$hash',
                role: 'USER',
                isActive: true,
                lastLogin: new Date(),
                failedLoginAttempts: 0,
                accountLocked: false,
                mfaEnabled: false,
                createdAt: new Date(),
                updatedAt: new Date()
            };
        }
        return null;
    }
    async findUserById(id) {
        if (id === 'ethan_barnes') {
            return {
                id: 'ethan_barnes',
                email: 'ethan@43v3r.ai',
                firstName: 'Ethan',
                lastName: 'Barnes',
                name: 'Ethan Barnes',
                password: '$2a$12$hash',
                role: 'USER',
                isActive: true,
                lastLogin: new Date(),
                failedLoginAttempts: 0,
                accountLocked: false,
                mfaEnabled: false,
                createdAt: new Date(),
                updatedAt: new Date()
            };
        }
        return null;
    }
    async resetFailedLoginAttempts(userId) {
    }
    async updateLastLogin(userId) {
    }
    async incrementFailedLoginAttempts(userId) {
    }
    async lockAccount(userId) {
    }
    async updateUserPassword(userId, passwordHash) {
    }
    async updateUserMFA(userId, enabled) {
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        logger_service_1.LoggerService])
], AuthService);
//# sourceMappingURL=auth.service.js.map