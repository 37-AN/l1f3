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
exports.LIF3WebSocketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const logger_service_1 = require("../../common/logger/logger.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let LIF3WebSocketGateway = class LIF3WebSocketGateway {
    constructor(logger) {
        this.logger = logger;
        this.connectedUsers = new Map();
        this.userSessions = new Map();
    }
    afterInit(server) {
        this.logger.log('WebSocket Gateway initialized', 'WebSocketGateway');
        this.logger.logIntegration({
            service: 'WEBSOCKET',
            action: 'CONNECT',
            status: 'SUCCESS',
            timestamp: new Date(),
            metadata: {
                event: 'GATEWAY_INITIALIZED',
                port: 3001
            }
        });
    }
    async handleConnection(client, ...args) {
        const startTime = Date.now();
        const clientId = client.id;
        const ipAddress = client.handshake.address;
        const userAgent = client.handshake.headers['user-agent'];
        try {
            const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
            if (!token) {
                this.logger.logWebSocketEvent('CONNECTION_REJECTED', {
                    reason: 'NO_TOKEN',
                    clientId,
                    ipAddress
                });
                client.disconnect();
                return;
            }
            const user = {
                id: 'ethan_barnes',
                email: 'ethan@43v3r.ai',
                name: 'Ethan Barnes',
                role: 'USER'
            };
            this.connectedUsers.set(clientId, client);
            this.userSessions.set(clientId, user);
            client.join(`user_${user.id}`);
            this.logger.logWebSocketEvent('CONNECTION_ESTABLISHED', {
                clientId,
                userId: user.id,
                email: user.email,
                ipAddress,
                userAgent,
                rooms: Array.from(client.rooms)
            }, user.id);
            this.logger.logIntegration({
                service: 'WEBSOCKET',
                action: 'CONNECT',
                status: 'SUCCESS',
                duration: Date.now() - startTime,
                timestamp: new Date(),
                metadata: {
                    clientId,
                    userId: user.id,
                    ipAddress,
                    userAgent,
                    totalConnections: this.connectedUsers.size
                }
            });
            client.emit('connection_success', {
                message: 'Connected to LIF3 real-time updates',
                userId: user.id,
                timestamp: new Date()
            });
            await this.sendInitialFinancialData(client, user.id);
        }
        catch (error) {
            this.logger.error(`WebSocket connection failed: ${error.message}`, error.stack, 'WebSocketGateway');
            this.logger.logIntegration({
                service: 'WEBSOCKET',
                action: 'CONNECT',
                status: 'FAILED',
                duration: Date.now() - startTime,
                errorMessage: error.message,
                timestamp: new Date(),
                metadata: {
                    clientId,
                    ipAddress,
                    userAgent
                }
            });
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const clientId = client.id;
        const user = this.userSessions.get(clientId);
        this.logger.logWebSocketEvent('CONNECTION_DISCONNECTED', {
            clientId,
            userId: user?.id || 'unknown',
            reason: 'CLIENT_DISCONNECT'
        }, user?.id);
        this.logger.logIntegration({
            service: 'WEBSOCKET',
            action: 'DISCONNECT',
            status: 'SUCCESS',
            timestamp: new Date(),
            metadata: {
                clientId,
                userId: user?.id || 'unknown',
                totalConnections: this.connectedUsers.size - 1
            }
        });
        this.connectedUsers.delete(clientId);
        this.userSessions.delete(clientId);
        this.logger.log(`WebSocket client disconnected: ${clientId}`, 'WebSocketGateway');
    }
    async handleSubscribeFinancialUpdates(data, client) {
        const user = this.userSessions.get(client.id);
        if (!user) {
            return { error: 'User not authenticated' };
        }
        this.logger.logWebSocketEvent('SUBSCRIPTION_REQUESTED', {
            clientId: client.id,
            userId: user.id,
            subscriptionTypes: data.types
        }, user.id);
        data.types.forEach(type => {
            client.join(`financial_${type}`);
        });
        return {
            message: 'Subscribed to financial updates',
            types: data.types,
            timestamp: new Date()
        };
    }
    async handleRequestBalanceUpdate(data, client) {
        const user = this.userSessions.get(client.id);
        if (!user) {
            return { error: 'User not authenticated' };
        }
        this.logger.logWebSocketEvent('BALANCE_UPDATE_REQUESTED', {
            clientId: client.id,
            userId: user.id,
            accountId: data.accountId
        }, user.id);
        const balanceData = {
            netWorth: 239625,
            liquidCash: 88750,
            investments: 142000,
            businessEquity: 8875,
            lastUpdated: new Date()
        };
        client.emit('balance_update', balanceData);
        return {
            message: 'Balance update sent',
            timestamp: new Date()
        };
    }
    handlePing(client) {
        const user = this.userSessions.get(client.id);
        this.logger.logWebSocketEvent('HEARTBEAT', {
            clientId: client.id,
            userId: user?.id || 'unknown'
        }, user?.id);
        return {
            message: 'pong',
            timestamp: new Date(),
            serverTime: Date.now()
        };
    }
    async broadcastBalanceUpdate(userId, balanceData) {
        try {
            this.logger.logWebSocketEvent('BALANCE_UPDATE_BROADCAST', {
                userId,
                balanceData,
                recipientCount: this.server.sockets.adapter.rooms.get(`user_${userId}`)?.size || 0
            }, userId);
            this.server.to(`user_${userId}`).emit('balance_update', {
                type: 'balance_update',
                data: balanceData,
                timestamp: new Date()
            });
            this.logger.logPerformanceMetric('WEBSOCKET_BROADCAST', 0, 'ms', 'balance_update');
        }
        catch (error) {
            this.logger.error(`Failed to broadcast balance update: ${error.message}`, error.stack, 'WebSocketGateway');
        }
    }
    async broadcastTransactionAdded(userId, transactionData) {
        try {
            this.logger.logWebSocketEvent('TRANSACTION_ADDED_BROADCAST', {
                userId,
                transactionData,
                recipientCount: this.server.sockets.adapter.rooms.get(`user_${userId}`)?.size || 0
            }, userId);
            this.server.to(`user_${userId}`).emit('transaction_added', {
                type: 'transaction_added',
                data: transactionData,
                timestamp: new Date()
            });
            this.logger.logPerformanceMetric('WEBSOCKET_BROADCAST', 0, 'ms', 'transaction_added');
        }
        catch (error) {
            this.logger.error(`Failed to broadcast transaction added: ${error.message}`, error.stack, 'WebSocketGateway');
        }
    }
    async broadcastGoalProgress(userId, goalData) {
        try {
            this.logger.logWebSocketEvent('GOAL_PROGRESS_BROADCAST', {
                userId,
                goalData,
                recipientCount: this.server.sockets.adapter.rooms.get(`user_${userId}`)?.size || 0
            }, userId);
            this.server.to(`user_${userId}`).emit('goal_progress', {
                type: 'goal_progress',
                data: goalData,
                timestamp: new Date()
            });
            this.logger.logPerformanceMetric('WEBSOCKET_BROADCAST', 0, 'ms', 'goal_progress');
        }
        catch (error) {
            this.logger.error(`Failed to broadcast goal progress: ${error.message}`, error.stack, 'WebSocketGateway');
        }
    }
    async broadcast43V3RRevenue(userId, revenueData) {
        try {
            this.logger.logWebSocketEvent('BUSINESS_REVENUE_BROADCAST', {
                userId,
                revenueData,
                recipientCount: this.server.sockets.adapter.rooms.get(`user_${userId}`)?.size || 0
            }, userId);
            this.server.to(`user_${userId}`).emit('business_revenue', {
                type: 'business_revenue',
                data: revenueData,
                timestamp: new Date()
            });
            this.logger.logPerformanceMetric('WEBSOCKET_BROADCAST', 0, 'ms', 'business_revenue');
        }
        catch (error) {
            this.logger.error(`Failed to broadcast 43V3R revenue: ${error.message}`, error.stack, 'WebSocketGateway');
        }
    }
    async broadcastMilestoneAchieved(userId, milestoneData) {
        try {
            this.logger.logWebSocketEvent('MILESTONE_ACHIEVED_BROADCAST', {
                userId,
                milestoneData,
                recipientCount: this.server.sockets.adapter.rooms.get(`user_${userId}`)?.size || 0
            }, userId);
            this.server.to(`user_${userId}`).emit('milestone_achieved', {
                type: 'milestone_achieved',
                data: milestoneData,
                timestamp: new Date()
            });
            this.logger.logPerformanceMetric('WEBSOCKET_BROADCAST', 0, 'ms', 'milestone_achieved');
        }
        catch (error) {
            this.logger.error(`Failed to broadcast milestone achieved: ${error.message}`, error.stack, 'WebSocketGateway');
        }
    }
    async broadcastSyncStatus(userId, syncData) {
        try {
            this.logger.logWebSocketEvent('SYNC_STATUS_BROADCAST', {
                userId,
                syncData,
                recipientCount: this.server.sockets.adapter.rooms.get(`user_${userId}`)?.size || 0
            }, userId);
            this.server.to(`user_${userId}`).emit('sync_status', {
                type: 'sync_status',
                data: syncData,
                timestamp: new Date()
            });
            this.logger.logPerformanceMetric('WEBSOCKET_BROADCAST', 0, 'ms', 'sync_status');
        }
        catch (error) {
            this.logger.error(`Failed to broadcast sync status: ${error.message}`, error.stack, 'WebSocketGateway');
        }
    }
    async broadcastGoogleDriveEvent(userId, eventType, eventData) {
        try {
            this.logger.logWebSocketEvent('GOOGLE_DRIVE_EVENT_BROADCAST', {
                userId,
                eventType,
                eventData,
                recipientCount: this.server.sockets.adapter.rooms.get(`user_${userId}`)?.size || 0
            }, userId);
            this.server.to(`user_${userId}`).emit('google_drive_event', {
                type: 'google_drive_event',
                eventType,
                data: eventData,
                timestamp: new Date()
            });
            this.server.to(`user_${userId}`).emit(eventType, {
                type: eventType,
                data: eventData,
                timestamp: new Date()
            });
            this.logger.logPerformanceMetric('WEBSOCKET_BROADCAST', 0, 'ms', `google_drive_${eventType}`);
        }
        catch (error) {
            this.logger.error(`Failed to broadcast Google Drive event: ${error.message}`, error.stack, 'WebSocketGateway');
        }
    }
    async broadcastDailyBriefingCreated(userId, briefingData) {
        try {
            await this.broadcastGoogleDriveEvent(userId, 'daily_briefing_created', {
                fileName: briefingData.fileName,
                fileId: briefingData.fileId,
                date: briefingData.date,
                status: 'SUCCESS',
                message: '📊 Daily briefing created successfully in Google Drive'
            });
        }
        catch (error) {
            this.logger.error(`Failed to broadcast daily briefing event: ${error.message}`, error.stack, 'WebSocketGateway');
        }
    }
    async broadcastFileBackupComplete(userId, backupData) {
        try {
            await this.broadcastGoogleDriveEvent(userId, 'file_backup_complete', {
                fileName: backupData.fileName,
                fileId: backupData.fileId,
                backupType: backupData.backupType,
                status: 'SUCCESS',
                message: '💾 Financial data backup completed'
            });
        }
        catch (error) {
            this.logger.error(`Failed to broadcast backup event: ${error.message}`, error.stack, 'WebSocketGateway');
        }
    }
    async broadcastSyncProgress(userId, progressData) {
        try {
            await this.broadcastGoogleDriveEvent(userId, 'sync_progress', {
                operation: progressData.operation,
                progress: progressData.progress,
                status: progressData.status,
                message: progressData.message
            });
        }
        catch (error) {
            this.logger.error(`Failed to broadcast sync progress: ${error.message}`, error.stack, 'WebSocketGateway');
        }
    }
    async sendInitialFinancialData(client, userId) {
        try {
            const initialData = {
                netWorth: {
                    current: 239625,
                    target: 1800000,
                    progress: 13.3
                },
                accounts: [
                    { id: 'liquid', name: 'Liquid Cash', balance: 88750, currency: 'ZAR' },
                    { id: 'investments', name: 'Investments', balance: 142000, currency: 'ZAR' },
                    { id: 'business', name: '43V3R Business Equity', balance: 8875, currency: 'ZAR' }
                ],
                businessMetrics: {
                    dailyRevenue: 0,
                    mrr: 0,
                    dailyTarget: 4881,
                    mrrTarget: 147917
                }
            };
            client.emit('initial_financial_data', initialData);
            this.logger.logWebSocketEvent('INITIAL_DATA_SENT', {
                clientId: client.id,
                userId,
                dataSize: JSON.stringify(initialData).length
            }, userId);
        }
        catch (error) {
            this.logger.error(`Failed to send initial financial data: ${error.message}`, error.stack, 'WebSocketGateway');
        }
    }
    getConnectedUserCount() {
        return this.connectedUsers.size;
    }
    getUserSessions() {
        return this.userSessions;
    }
    async disconnectUser(userId, reason = 'ADMIN_DISCONNECT') {
        const userConnections = Array.from(this.connectedUsers.entries())
            .filter(([_, socket]) => {
            const user = this.userSessions.get(socket.id);
            return user?.id === userId;
        });
        userConnections.forEach(([clientId, socket]) => {
            this.logger.logWebSocketEvent('FORCED_DISCONNECT', {
                clientId,
                userId,
                reason
            }, userId);
            socket.disconnect(true);
        });
    }
};
exports.LIF3WebSocketGateway = LIF3WebSocketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], LIF3WebSocketGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe_financial_updates'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], LIF3WebSocketGateway.prototype, "handleSubscribeFinancialUpdates", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('request_balance_update'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], LIF3WebSocketGateway.prototype, "handleRequestBalanceUpdate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ping'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], LIF3WebSocketGateway.prototype, "handlePing", null);
exports.LIF3WebSocketGateway = LIF3WebSocketGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true,
        },
        transports: ['websocket', 'polling'],
    }),
    __metadata("design:paramtypes", [logger_service_1.LoggerService])
], LIF3WebSocketGateway);
//# sourceMappingURL=websocket.gateway.js.map