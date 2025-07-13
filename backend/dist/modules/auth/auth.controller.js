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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const logging_interceptor_1 = require("../../common/interceptors/logging.interceptor");
const audit_log_guard_1 = require("../../common/guards/audit-log.guard");
const audit_log_decorator_1 = require("../../common/decorators/audit-log.decorator");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async login(dto, req) {
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];
        return await this.authService.login(dto, ipAddress, userAgent);
    }
    async register(dto, req) {
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];
        return await this.authService.register(dto, ipAddress, userAgent);
    }
    async logout(req) {
        const userId = req.user?.id;
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];
        await this.authService.logout(userId, ipAddress, userAgent);
        return { message: 'Logout successful' };
    }
    async changePassword(dto, req) {
        const userId = req.user?.id;
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];
        await this.authService.changePassword(userId, dto, ipAddress, userAgent);
        return { message: 'Password changed successfully' };
    }
    async enableMFA(req) {
        const userId = req.user?.id;
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];
        await this.authService.enableMFA(userId, ipAddress, userAgent);
        return { message: 'MFA enabled successfully' };
    }
    async disableMFA(req) {
        const userId = req.user?.id;
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];
        await this.authService.disableMFA(userId, ipAddress, userAgent);
        return { message: 'MFA disabled successfully' };
    }
    async refreshToken(dto, req) {
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];
        return {
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token',
            expiresIn: 3600
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'User login with email and password' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login successful' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials' }),
    (0, common_1.UseGuards)(audit_log_guard_1.AuditLogGuard),
    (0, audit_log_decorator_1.LogSecurityEvent)('User login attempt'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'User registration' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Registration successful' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Registration failed' }),
    (0, common_1.UseGuards)(audit_log_guard_1.AuditLogGuard),
    (0, audit_log_decorator_1.LogSecurityEvent)('User registration attempt'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, swagger_1.ApiOperation)({ summary: 'User logout' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Logout successful' }),
    (0, common_1.UseGuards)(audit_log_guard_1.AuditLogGuard),
    (0, audit_log_decorator_1.LogSecurityEvent)('User logout'),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Put)('password'),
    (0, swagger_1.ApiOperation)({ summary: 'Change user password' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password changed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Current password is incorrect' }),
    (0, common_1.UseGuards)(audit_log_guard_1.AuditLogGuard),
    (0, audit_log_decorator_1.LogSecurityEvent)('Password change attempt'),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('mfa/enable'),
    (0, swagger_1.ApiOperation)({ summary: 'Enable multi-factor authentication' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'MFA enabled successfully' }),
    (0, common_1.UseGuards)(audit_log_guard_1.AuditLogGuard),
    (0, audit_log_decorator_1.LogSecurityEvent)('MFA enable attempt'),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "enableMFA", null);
__decorate([
    (0, common_1.Post)('mfa/disable'),
    (0, swagger_1.ApiOperation)({ summary: 'Disable multi-factor authentication' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'MFA disabled successfully' }),
    (0, common_1.UseGuards)(audit_log_guard_1.AuditLogGuard),
    (0, audit_log_decorator_1.LogSecurityEvent)('MFA disable attempt'),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "disableMFA", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh access token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token refreshed successfully' }),
    (0, common_1.UseGuards)(audit_log_guard_1.AuditLogGuard),
    (0, audit_log_decorator_1.LogSecurityEvent)('Token refresh attempt'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    (0, common_1.UseInterceptors)(logging_interceptor_1.LoggingInterceptor),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map