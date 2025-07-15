import { Injectable, Logger } from '@nestjs/common';
import { MCPMessage, MCPServer, MCPCapability } from '../mcp-framework/interfaces/mcp.interface';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class SentryMCPServer {
  private readonly logger = new Logger(SentryMCPServer.name);
  private client: AxiosInstance;

  constructor() {
    this.initializeClient();
  }

  private initializeClient(): void {
    this.client = axios.create({
      baseURL: 'https://sentry.io/api/0',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SENTRY_AUTH_TOKEN}`,
      },
    });
  }

  /**
   * Get server configuration
   */
  getServerConfig(): MCPServer {
    return {
      id: 'sentry_server',
      name: 'Sentry MCP Server',
      description: 'Error tracking and monitoring integration',
      version: '1.0.0',
      capabilities: [
        {
          name: 'error_tracking',
          version: '1.0.0',
          description: 'Track and monitor application errors',
          methods: ['get_issues', 'get_events', 'create_issue', 'resolve_issue'],
        },
        {
          name: 'performance_monitoring',
          version: '1.0.0',
          description: 'Monitor application performance metrics',
          methods: ['get_transactions', 'get_performance_data'],
        },
        {
          name: 'alerting',
          version: '1.0.0',
          description: 'Manage alerts and notifications',
          methods: ['create_alert', 'get_alerts', 'update_alert'],
        },
      ],
      endpoints: [
        {
          method: 'get_issues',
          description: 'Get issues from Sentry projects',
          parameters: [
            { name: 'project', type: 'string', required: true, description: 'Project slug' },
            { name: 'status', type: 'string', required: false, description: 'Issue status filter' },
            { name: 'limit', type: 'number', required: false, description: 'Number of issues to return' },
          ],
          returns: { type: 'array', description: 'List of issues' },
        },
        {
          method: 'get_events',
          description: 'Get events for a specific issue',
          parameters: [
            { name: 'issue_id', type: 'string', required: true, description: 'Issue ID' },
            { name: 'limit', type: 'number', required: false, description: 'Number of events to return' },
          ],
          returns: { type: 'array', description: 'List of events' },
        },
        {
          method: 'create_issue',
          description: 'Create a new issue',
          parameters: [
            { name: 'project', type: 'string', required: true, description: 'Project slug' },
            { name: 'title', type: 'string', required: true, description: 'Issue title' },
            { name: 'description', type: 'string', required: false, description: 'Issue description' },
            { name: 'level', type: 'string', required: false, description: 'Error level' },
          ],
          returns: { type: 'object', description: 'Created issue' },
        },
        {
          method: 'resolve_issue',
          description: 'Resolve an existing issue',
          parameters: [
            { name: 'issue_id', type: 'string', required: true, description: 'Issue ID' },
            { name: 'resolution', type: 'string', required: false, description: 'Resolution reason' },
          ],
          returns: { type: 'object', description: 'Resolved issue' },
        },
      ],
      status: 'disconnected',
      config: {
        host: 'sentry.io',
        port: 443,
        apiKey: process.env.SENTRY_AUTH_TOKEN,
        timeout: 30000,
        maxRetries: 3,
      },
    };
  }

  /**
   * Handle MCP messages
   */
  async handleMessage(message: MCPMessage): Promise<MCPMessage> {
    try {
      switch (message.method) {
        case 'ping':
          return this.handlePing(message);
        case 'get_issues':
          return await this.getIssues(message);
        case 'get_events':
          return await this.getEvents(message);
        case 'create_issue':
          return await this.createIssue(message);
        case 'resolve_issue':
          return await this.resolveIssue(message);
        case 'get_transactions':
          return await this.getTransactions(message);
        case 'get_performance_data':
          return await this.getPerformanceData(message);
        case 'create_alert':
          return await this.createAlert(message);
        case 'get_alerts':
          return await this.getAlerts(message);
        case 'update_alert':
          return await this.updateAlert(message);
        default:
          return {
            jsonrpc: '2.0',
            id: message.id,
            error: {
              code: -32601,
              message: `Method not found: ${message.method}`,
            },
          };
      }
    } catch (error) {
      this.logger.error(`Error handling Sentry message:`, error);
      return {
        jsonrpc: '2.0',
        id: message.id,
        error: {
          code: -32603,
          message: `Internal error: ${error.message}`,
        },
      };
    }
  }

  private handlePing(message: MCPMessage): MCPMessage {
    return {
      jsonrpc: '2.0',
      id: message.id,
      result: 'pong',
    };
  }

  private async getIssues(message: MCPMessage): Promise<MCPMessage> {
    const { project, status = 'unresolved', limit = 100 } = message.params;
    
    const response = await this.client.get(`/projects/${process.env.SENTRY_ORG}/${project}/issues/`, {
      params: {
        statsPeriod: '24h',
        query: `is:${status}`,
        limit,
      },
    });

    const issues = response.data.map((issue: any) => ({
      id: issue.id,
      title: issue.title,
      culprit: issue.culprit,
      level: issue.level,
      status: issue.status,
      count: issue.count,
      userCount: issue.userCount,
      firstSeen: issue.firstSeen,
      lastSeen: issue.lastSeen,
      permalink: issue.permalink,
      project: issue.project,
      tags: issue.tags,
    }));

    return {
      jsonrpc: '2.0',
      id: message.id,
      result: { issues },
    };
  }

  private async getEvents(message: MCPMessage): Promise<MCPMessage> {
    const { issue_id, limit = 50 } = message.params;
    
    const response = await this.client.get(`/issues/${issue_id}/events/`, {
      params: { limit },
    });

    const events = response.data.map((event: any) => ({
      id: event.id,
      eventID: event.eventID,
      message: event.message,
      datetime: event.dateCreated,
      platform: event.platform,
      tags: event.tags,
      user: event.user,
      context: event.context,
      errors: event.errors,
    }));

    return {
      jsonrpc: '2.0',
      id: message.id,
      result: { events },
    };
  }

  private async createIssue(message: MCPMessage): Promise<MCPMessage> {
    const { project, title, description, level = 'error' } = message.params;
    
    // Create a custom event that will generate an issue
    const eventData = {
      event_id: this.generateEventId(),
      message: title,
      timestamp: new Date().toISOString(),
      level,
      platform: 'other',
      environment: process.env.NODE_ENV || 'development',
      extra: {
        description,
        created_via: 'mcp_server',
      },
    };

    const response = await this.client.post(`/projects/${process.env.SENTRY_ORG}/${project}/events/`, eventData);

    return {
      jsonrpc: '2.0',
      id: message.id,
      result: { event: response.data },
    };
  }

  private async resolveIssue(message: MCPMessage): Promise<MCPMessage> {
    const { issue_id, resolution = 'resolved' } = message.params;
    
    const response = await this.client.put(`/issues/${issue_id}/`, {
      status: 'resolved',
      statusDetails: {
        resolution,
      },
    });

    return {
      jsonrpc: '2.0',
      id: message.id,
      result: { issue: response.data },
    };
  }

  private async getTransactions(message: MCPMessage): Promise<MCPMessage> {
    const { project, limit = 100 } = message.params;
    
    const response = await this.client.get(`/projects/${process.env.SENTRY_ORG}/${project}/events/`, {
      params: {
        query: 'event.type:transaction',
        limit,
        statsPeriod: '24h',
      },
    });

    const transactions = response.data.map((transaction: any) => ({
      id: transaction.id,
      transaction: transaction.transaction,
      duration: transaction.duration,
      timestamp: transaction.timestamp,
      user: transaction.user,
      tags: transaction.tags,
      measurements: transaction.measurements,
    }));

    return {
      jsonrpc: '2.0',
      id: message.id,
      result: { transactions },
    };
  }

  private async getPerformanceData(message: MCPMessage): Promise<MCPMessage> {
    const { project, metric = 'transaction.duration', period = '24h' } = message.params;
    
    const response = await this.client.get(`/projects/${process.env.SENTRY_ORG}/${project}/stats/`, {
      params: {
        stat: metric,
        since: this.getTimestamp(period),
      },
    });

    return {
      jsonrpc: '2.0',
      id: message.id,
      result: { performanceData: response.data },
    };
  }

  private async createAlert(message: MCPMessage): Promise<MCPMessage> {
    const { project, name, conditions, actions } = message.params;
    
    const alertData = {
      name,
      conditions,
      actions,
      projects: [project],
      environment: process.env.NODE_ENV || 'development',
    };

    const response = await this.client.post(`/projects/${process.env.SENTRY_ORG}/${project}/rules/`, alertData);

    return {
      jsonrpc: '2.0',
      id: message.id,
      result: { alert: response.data },
    };
  }

  private async getAlerts(message: MCPMessage): Promise<MCPMessage> {
    const { project } = message.params;
    
    const response = await this.client.get(`/projects/${process.env.SENTRY_ORG}/${project}/rules/`);

    return {
      jsonrpc: '2.0',
      id: message.id,
      result: { alerts: response.data },
    };
  }

  private async updateAlert(message: MCPMessage): Promise<MCPMessage> {
    const { project, alert_id, updates } = message.params;
    
    const response = await this.client.put(`/projects/${process.env.SENTRY_ORG}/${project}/rules/${alert_id}/`, updates);

    return {
      jsonrpc: '2.0',
      id: message.id,
      result: { alert: response.data },
    };
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getTimestamp(period: string): number {
    const now = Date.now();
    const periodMs = this.parsePeriod(period);
    return Math.floor((now - periodMs) / 1000);
  }

  private parsePeriod(period: string): number {
    const match = period.match(/^(\d+)([hdwmy])$/);
    if (!match) return 24 * 60 * 60 * 1000; // Default to 24h
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      case 'w': return value * 7 * 24 * 60 * 60 * 1000;
      case 'm': return value * 30 * 24 * 60 * 60 * 1000;
      case 'y': return value * 365 * 24 * 60 * 60 * 1000;
      default: return 24 * 60 * 60 * 1000;
    }
  }
}