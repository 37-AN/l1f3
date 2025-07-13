interface ConnectionTestResult {
    service: string;
    status: 'success' | 'failed' | 'skipped';
    message: string;
    details?: any;
}
declare class ConnectionTester {
    private results;
    private configService;
    constructor();
    testDatabaseConnection(): Promise<ConnectionTestResult>;
    testRedisConnection(): Promise<ConnectionTestResult>;
    testGoogleDriveConnection(): Promise<ConnectionTestResult>;
    testDiscordBotConnection(): Promise<ConnectionTestResult>;
    testClaudeAIConnection(): Promise<ConnectionTestResult>;
    testLunoConnection(): Promise<ConnectionTestResult>;
    testSMTPConnection(): Promise<ConnectionTestResult>;
    runAllTests(): Promise<ConnectionTestResult[]>;
    private displayResults;
    getFailedConnections(): ConnectionTestResult[];
    getSuccessfulConnections(): ConnectionTestResult[];
}
export { ConnectionTester, ConnectionTestResult };
