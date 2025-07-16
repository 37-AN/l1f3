"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const sentry_mcp_server_1 = require("../sentry-mcp-server");
const axios_1 = __importDefault(require("axios"));
jest.mock('axios');
const mockedAxios = axios_1.default;
describe('SentryMCPServer', () => {
    let server;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [sentry_mcp_server_1.SentryMCPServer],
        }).compile();
        server = module.get(sentry_mcp_server_1.SentryMCPServer);
        process.env.SENTRY_AUTH_TOKEN = 'test-token';
        process.env.SENTRY_ORG = 'test-org';
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should be defined', () => {
        expect(server).toBeDefined();
    });
    describe('getServerConfig', () => {
        it('should return server configuration', () => {
            const config = server.getServerConfig();
            expect(config).toBeDefined();
            expect(config.id).toBe('sentry_server');
            expect(config.name).toBe('Sentry MCP Server');
            expect(config.capabilities).toBeDefined();
            expect(config.endpoints).toBeDefined();
        });
        it('should include required capabilities', () => {
            const config = server.getServerConfig();
            const capabilityNames = config.capabilities.map(c => c.name);
            expect(capabilityNames).toContain('error_tracking');
            expect(capabilityNames).toContain('performance_monitoring');
            expect(capabilityNames).toContain('alerting');
        });
    });
    describe('handleMessage', () => {
        it('should handle ping message', async () => {
            const message = {
                jsonrpc: '2.0',
                id: 'test',
                method: 'ping',
                params: {},
            };
            const response = await server.handleMessage(message);
            expect(response).toEqual({
                jsonrpc: '2.0',
                id: 'test',
                result: 'pong',
            });
        });
        it('should handle get_issues message', async () => {
            const mockIssues = [
                {
                    id: '1',
                    title: 'Test Issue',
                    culprit: 'test.js',
                    level: 'error',
                    status: 'unresolved',
                    count: 5,
                    userCount: 2,
                    firstSeen: '2023-01-01T00:00:00Z',
                    lastSeen: '2023-01-02T00:00:00Z',
                    permalink: 'https://sentry.io/issue/1',
                    project: { slug: 'test-project' },
                    tags: [],
                },
            ];
            mockedAxios.create = jest.fn().mockReturnValue({
                get: jest.fn().mockResolvedValue({ data: mockIssues }),
            });
            const message = {
                jsonrpc: '2.0',
                id: 'test',
                method: 'get_issues',
                params: {
                    project: 'test-project',
                },
            };
            const response = await server.handleMessage(message);
            expect(response.result).toBeDefined();
            expect(response.result.issues).toBeDefined();
            expect(response.result.issues).toHaveLength(1);
        });
        it('should handle unknown method', async () => {
            const message = {
                jsonrpc: '2.0',
                id: 'test',
                method: 'unknown_method',
                params: {},
            };
            const response = await server.handleMessage(message);
            expect(response.error).toBeDefined();
            expect(response.error.code).toBe(-32601);
            expect(response.error.message).toBe('Method not found: unknown_method');
        });
        it('should handle errors gracefully', async () => {
            mockedAxios.create = jest.fn().mockReturnValue({
                get: jest.fn().mockRejectedValue(new Error('Network error')),
            });
            const message = {
                jsonrpc: '2.0',
                id: 'test',
                method: 'get_issues',
                params: {
                    project: 'test-project',
                },
            };
            const response = await server.handleMessage(message);
            expect(response.error).toBeDefined();
            expect(response.error.code).toBe(-32603);
            expect(response.error.message).toContain('Internal error');
        });
    });
    describe('create_issue', () => {
        it('should create a new issue', async () => {
            const mockEvent = {
                id: 'event-123',
                eventID: 'event-123',
                message: 'Test Issue',
                dateCreated: '2023-01-01T00:00:00Z',
            };
            mockedAxios.create = jest.fn().mockReturnValue({
                post: jest.fn().mockResolvedValue({ data: mockEvent }),
            });
            const message = {
                jsonrpc: '2.0',
                id: 'test',
                method: 'create_issue',
                params: {
                    project: 'test-project',
                    title: 'Test Issue',
                    description: 'Test description',
                    level: 'error',
                },
            };
            const response = await server.handleMessage(message);
            expect(response.result).toBeDefined();
            expect(response.result.event).toBeDefined();
            expect(response.result.event.message).toBe('Test Issue');
        });
    });
    describe('resolve_issue', () => {
        it('should resolve an existing issue', async () => {
            const mockIssue = {
                id: '1',
                status: 'resolved',
                statusDetails: {
                    resolution: 'resolved',
                },
            };
            mockedAxios.create = jest.fn().mockReturnValue({
                put: jest.fn().mockResolvedValue({ data: mockIssue }),
            });
            const message = {
                jsonrpc: '2.0',
                id: 'test',
                method: 'resolve_issue',
                params: {
                    issue_id: '1',
                    resolution: 'fixed',
                },
            };
            const response = await server.handleMessage(message);
            expect(response.result).toBeDefined();
            expect(response.result.issue).toBeDefined();
            expect(response.result.issue.status).toBe('resolved');
        });
    });
});
//# sourceMappingURL=sentry-mcp-server.test.js.map