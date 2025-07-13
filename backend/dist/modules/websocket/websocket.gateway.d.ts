import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LoggerService } from '../../common/logger/logger.service';
interface WebSocketUser {
    id: string;
    email: string;
    name: string;
    role: string;
}
export declare class LIF3WebSocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger;
    server: Server;
    private connectedUsers;
    private userSessions;
    constructor(logger: LoggerService);
    afterInit(server: Server): void;
    handleConnection(client: Socket, ...args: any[]): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleSubscribeFinancialUpdates(data: {
        types: string[];
    }, client: Socket): Promise<{
        error: string;
        message?: undefined;
        types?: undefined;
        timestamp?: undefined;
    } | {
        message: string;
        types: string[];
        timestamp: Date;
        error?: undefined;
    }>;
    handleRequestBalanceUpdate(data: {
        accountId?: string;
    }, client: Socket): Promise<{
        error: string;
        message?: undefined;
        timestamp?: undefined;
    } | {
        message: string;
        timestamp: Date;
        error?: undefined;
    }>;
    handlePing(client: Socket): {
        message: string;
        timestamp: Date;
        serverTime: number;
    };
    broadcastBalanceUpdate(userId: string, balanceData: any): Promise<void>;
    broadcastTransactionAdded(userId: string, transactionData: any): Promise<void>;
    broadcastGoalProgress(userId: string, goalData: any): Promise<void>;
    broadcast43V3RRevenue(userId: string, revenueData: any): Promise<void>;
    broadcastMilestoneAchieved(userId: string, milestoneData: any): Promise<void>;
    broadcastSyncStatus(userId: string, syncData: any): Promise<void>;
    broadcastGoogleDriveEvent(userId: string, eventType: string, eventData: any): Promise<void>;
    broadcastDailyBriefingCreated(userId: string, briefingData: any): Promise<void>;
    broadcastFileBackupComplete(userId: string, backupData: any): Promise<void>;
    broadcastSyncProgress(userId: string, progressData: any): Promise<void>;
    private sendInitialFinancialData;
    getConnectedUserCount(): number;
    getUserSessions(): Map<string, WebSocketUser>;
    disconnectUser(userId: string, reason?: string): Promise<void>;
}
export {};
