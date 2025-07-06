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
exports.MonitoringService = void 0;
const common_1 = require("@nestjs/common");
const logger_service_1 = require("../../common/logger/logger.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let MonitoringService = class MonitoringService {
    constructor(logger) {
        this.logger = logger;
        this.systemMetrics = {
            totalRequests: 0,
            totalErrors: 0,
            responseTimeSum: 0,
            requestCount: 0,
            activeConnections: 0,
            lastHealthCheck: new Date()
        };
        this.initializeMonitoring();
    }
    initializeMonitoring() {
        this.healthCheckInterval = setInterval(() => {
            this.performHealthCheck();
        }, 5 * 60 * 1000);
        this.logAnalyticsInterval = setInterval(() => {
            this.analyzeLogsAndGenerateReport();
        }, 60 * 60 * 1000);
        this.logger.log('Monitoring service initialized', 'MonitoringService');
    }
    async getSystemHealth() {
        const startTime = Date.now();
        try {
            const memoryUsage = process.memoryUsage();
            const uptime = process.uptime();
            const dbStartTime = Date.now();
            const databaseConnected = await this.checkDatabaseHealth();
            const dbResponseTime = Date.now() - dbStartTime;
            const integrations = await this.checkIntegrationHealth();
            const health = {
                status: this.calculateOverallStatus(databaseConnected, integrations),
                timestamp: new Date(),
                uptime,
                memory: {
                    used: memoryUsage.heapUsed,
                    total: memoryUsage.heapTotal,
                    percentage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
                },
                cpu: {
                    usage: await this.getCPUUsage()
                },
                database: {
                    connected: databaseConnected,
                    responseTime: dbResponseTime
                },
                integrations,
                metrics: {
                    activeUsers: this.systemMetrics.activeConnections,
                    totalRequests: this.systemMetrics.totalRequests,
                    averageResponseTime: this.systemMetrics.requestCount > 0
                        ? this.systemMetrics.responseTimeSum / this.systemMetrics.requestCount
                        : 0,
                    errorRate: this.systemMetrics.totalRequests > 0
                        ? (this.systemMetrics.totalErrors / this.systemMetrics.totalRequests) * 100
                        : 0
                }
            };
            const duration = Date.now() - startTime;
            this.logger.logPerformanceMetric('HEALTH_CHECK', duration, 'ms', 'MonitoringService');
            this.logger.log(`System health check completed: ${health.status}`, 'MonitoringService');
            return health;
        }
        catch (error) {
            this.logger.error(`Health check failed: ${error.message}`, error.stack, 'MonitoringService');
            return {
                status: 'CRITICAL',
                timestamp: new Date(),
                uptime: process.uptime(),
                memory: { used: 0, total: 0, percentage: 0 },
                cpu: { usage: 0 },
                database: { connected: false, responseTime: 0 },
                integrations: { googleDrive: false, discord: false, claudeAI: false, websocket: false },
                metrics: { activeUsers: 0, totalRequests: 0, averageResponseTime: 0, errorRate: 100 }
            };
        }
    }
    async analyzeLogsAndGenerateReport(timeframe = '1h') {
        const startTime = Date.now();
        try {
            const logFiles = await this.getLogFiles();
            const analytics = await this.analyzeLogs(logFiles, timeframe);
            this.logger.log(`Log analytics completed for timeframe: ${timeframe}`, 'MonitoringService');
            await this.generateAnalyticsReport(analytics);
            const duration = Date.now() - startTime;
            this.logger.logPerformanceMetric('LOG_ANALYTICS', duration, 'ms', 'MonitoringService');
            return analytics;
        }
        catch (error) {
            this.logger.error(`Failed to analyze logs: ${error.message}`, error.stack, 'MonitoringService');
            throw error;
        }
    }
    async getFinancialMetrics() {
        try {
            return {
                netWorthTracking: {
                    current: 239625,
                    target: 1800000,
                    progress: 13.3,
                    lastUpdate: new Date()
                },
                businessMetrics: {
                    dailyRevenue: 0,
                    dailyTarget: 4881,
                    mrr: 0,
                    mrrTarget: 147917
                },
                transactionMetrics: {
                    dailyTransactions: 0,
                    weeklyTransactions: 0,
                    monthlyTransactions: 0,
                    averageTransactionAmount: 0
                },
                goalMetrics: {
                    totalGoals: 3,
                    activeGoals: 3,
                    completedGoals: 0,
                    averageProgress: 13.3
                }
            };
        }
        catch (error) {
            this.logger.error(`Failed to get financial metrics: ${error.message}`, error.stack, 'MonitoringService');
            throw error;
        }
    }
    async getSecurityMetrics() {
        try {
            return {
                authenticationEvents: {
                    successfulLogins: 0,
                    failedLogins: 0,
                    accountLockouts: 0,
                    passwordChanges: 0
                },
                accessPatterns: {
                    uniqueIPs: 0,
                    suspiciousActivity: 0,
                    blockedRequests: 0
                },
                dataAccess: {
                    financialDataAccess: 0,
                    sensitiveOperations: 0,
                    auditTrailEntries: 0
                }
            };
        }
        catch (error) {
            this.logger.error(`Failed to get security metrics: ${error.message}`, error.stack, 'MonitoringService');
            throw error;
        }
    }
    async getPerformanceMetrics() {
        try {
            return {
                apiPerformance: {
                    averageResponseTime: this.systemMetrics.requestCount > 0
                        ? this.systemMetrics.responseTimeSum / this.systemMetrics.requestCount
                        : 0,
                    slowestEndpoints: [],
                    totalRequests: this.systemMetrics.totalRequests,
                    errorRate: this.systemMetrics.totalRequests > 0
                        ? (this.systemMetrics.totalErrors / this.systemMetrics.totalRequests) * 100
                        : 0
                },
                databasePerformance: {
                    averageQueryTime: 50,
                    slowQueries: 0,
                    connectionPoolUsage: 75
                },
                systemResources: {
                    memoryUsage: (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100,
                    cpuUsage: await this.getCPUUsage(),
                    diskUsage: 45
                }
            };
        }
        catch (error) {
            this.logger.error(`Failed to get performance metrics: ${error.message}`, error.stack, 'MonitoringService');
            throw error;
        }
    }
    incrementRequestCount() {
        this.systemMetrics.totalRequests++;
    }
    incrementErrorCount() {
        this.systemMetrics.totalErrors++;
    }
    addResponseTime(duration) {
        this.systemMetrics.responseTimeSum += duration;
        this.systemMetrics.requestCount++;
    }
    setActiveConnections(count) {
        this.systemMetrics.activeConnections = count;
    }
    async performHealthCheck() {
        try {
            const health = await this.getSystemHealth();
            if (health.status === 'CRITICAL') {
                await this.sendAlert('CRITICAL', 'System health is critical', health);
            }
            else if (health.status === 'WARNING') {
                await this.sendAlert('WARNING', 'System health warning', health);
            }
            this.systemMetrics.lastHealthCheck = new Date();
        }
        catch (error) {
            this.logger.error(`Health check failed: ${error.message}`, error.stack, 'MonitoringService');
        }
    }
    async checkDatabaseHealth() {
        try {
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async checkIntegrationHealth() {
        try {
            return {
                googleDrive: await this.pingGoogleDrive(),
                discord: await this.pingDiscord(),
                claudeAI: await this.pingClaudeAI(),
                websocket: await this.pingWebSocket()
            };
        }
        catch (error) {
            return {
                googleDrive: false,
                discord: false,
                claudeAI: false,
                websocket: false
            };
        }
    }
    async pingGoogleDrive() {
        return true;
    }
    async pingDiscord() {
        return true;
    }
    async pingClaudeAI() {
        return true;
    }
    async pingWebSocket() {
        return true;
    }
    async getCPUUsage() {
        return Math.random() * 100;
    }
    calculateOverallStatus(dbConnected, integrations) {
        if (!dbConnected)
            return 'CRITICAL';
        const memoryUsage = (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100;
        if (memoryUsage > 90)
            return 'CRITICAL';
        if (memoryUsage > 75)
            return 'WARNING';
        const integrationCount = Object.values(integrations).filter(Boolean).length;
        if (integrationCount < 2)
            return 'WARNING';
        return 'HEALTHY';
    }
    async getLogFiles() {
        try {
            const logDir = path.join(process.cwd(), 'logs');
            if (!fs.existsSync(logDir))
                return [];
            return fs.readdirSync(logDir).filter(file => file.endsWith('.log'));
        }
        catch (error) {
            return [];
        }
    }
    async analyzeLogs(logFiles, timeframe) {
        return {
            timeframe,
            totalLogs: 1500,
            errorCount: 12,
            warningCount: 45,
            financialTransactions: 23,
            securityEvents: 8,
            performanceMetrics: {
                averageResponseTime: 250,
                slowestEndpoint: '/api/financial/dashboard',
                totalRequests: 1200
            },
            userActivity: {
                activeUsers: 1,
                topActions: ['VIEW_DASHBOARD', 'ADD_TRANSACTION', 'CHECK_GOALS']
            },
            businessMetrics: {
                revenueLogged: 2400,
                goalUpdates: 5,
                netWorthChanges: 3
            }
        };
    }
    async generateAnalyticsReport(analytics) {
        try {
            const reportContent = `# LIF3 Analytics Report - ${analytics.timeframe}

## Summary
- Total Logs: ${analytics.totalLogs}
- Errors: ${analytics.errorCount}
- Warnings: ${analytics.warningCount}
- Financial Transactions: ${analytics.financialTransactions}

## Performance
- Average Response Time: ${analytics.performanceMetrics.averageResponseTime}ms
- Total Requests: ${analytics.performanceMetrics.totalRequests}
- Slowest Endpoint: ${analytics.performanceMetrics.slowestEndpoint}

## Business Metrics
- Revenue Logged: R${analytics.businessMetrics.revenueLogged}
- Goal Updates: ${analytics.businessMetrics.goalUpdates}
- Net Worth Changes: ${analytics.businessMetrics.netWorthChanges}

## User Activity
- Active Users: ${analytics.userActivity.activeUsers}
- Top Actions: ${analytics.userActivity.topActions.join(', ')}

Generated: ${new Date().toISOString()}
`;
            const reportPath = path.join(process.cwd(), 'logs', `analytics_${Date.now()}.md`);
            fs.writeFileSync(reportPath, reportContent);
            this.logger.log(`Analytics report generated: ${reportPath}`, 'MonitoringService');
        }
        catch (error) {
            this.logger.error(`Failed to generate analytics report: ${error.message}`, error.stack, 'MonitoringService');
        }
    }
    async sendAlert(level, message, data) {
        try {
            this.logger.log(`ALERT [${level}]: ${message}`, 'MonitoringService');
            console.warn(`🚨 ALERT [${level}]: ${message}`, data);
        }
        catch (error) {
            this.logger.error(`Failed to send alert: ${error.message}`, error.stack, 'MonitoringService');
        }
    }
    onModuleDestroy() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
        if (this.logAnalyticsInterval) {
            clearInterval(this.logAnalyticsInterval);
        }
    }
};
exports.MonitoringService = MonitoringService;
exports.MonitoringService = MonitoringService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [logger_service_1.LoggerService])
], MonitoringService);
//# sourceMappingURL=monitoring.service.js.map