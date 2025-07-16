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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AsanaMCPServer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsanaMCPServer = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let AsanaMCPServer = AsanaMCPServer_1 = class AsanaMCPServer {
    constructor() {
        this.logger = new common_1.Logger(AsanaMCPServer_1.name);
        this.initializeClient();
    }
    initializeClient() {
        this.client = axios_1.default.create({
            baseURL: 'https://app.asana.com/api/1.0',
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.ASANA_ACCESS_TOKEN}`,
            },
        });
    }
    getServerConfig() {
        return {
            id: 'asana_server',
            name: 'Asana MCP Server',
            description: 'Project management and task orchestration integration',
            version: '1.0.0',
            capabilities: [
                {
                    name: 'task_management',
                    version: '1.0.0',
                    description: 'Manage tasks and subtasks',
                    methods: ['get_tasks', 'create_task', 'update_task', 'delete_task', 'complete_task'],
                },
                {
                    name: 'project_management',
                    version: '1.0.0',
                    description: 'Manage projects and portfolios',
                    methods: ['get_projects', 'create_project', 'update_project', 'get_project_tasks'],
                },
                {
                    name: 'team_collaboration',
                    version: '1.0.0',
                    description: 'Team and workspace management',
                    methods: ['get_team_members', 'assign_task', 'get_workspaces'],
                },
                {
                    name: 'automation',
                    version: '1.0.0',
                    description: 'Automated workflows and integrations',
                    methods: ['create_automation_rule', 'trigger_automation'],
                },
            ],
            endpoints: [
                {
                    method: 'get_tasks',
                    description: 'Get tasks from Asana',
                    parameters: [
                        { name: 'project_id', type: 'string', required: false, description: 'Project ID filter' },
                        { name: 'assignee', type: 'string', required: false, description: 'Assignee user ID' },
                        { name: 'completed', type: 'boolean', required: false, description: 'Completion status' },
                        { name: 'limit', type: 'number', required: false, description: 'Number of tasks to return' },
                    ],
                    returns: { type: 'array', description: 'List of tasks' },
                },
                {
                    method: 'create_task',
                    description: 'Create a new task',
                    parameters: [
                        { name: 'name', type: 'string', required: true, description: 'Task name' },
                        { name: 'notes', type: 'string', required: false, description: 'Task description' },
                        { name: 'project_id', type: 'string', required: false, description: 'Project ID' },
                        { name: 'assignee', type: 'string', required: false, description: 'Assignee user ID' },
                        { name: 'due_on', type: 'string', required: false, description: 'Due date (YYYY-MM-DD)' },
                        { name: 'priority', type: 'string', required: false, description: 'Task priority' },
                    ],
                    returns: { type: 'object', description: 'Created task' },
                },
                {
                    method: 'update_task',
                    description: 'Update an existing task',
                    parameters: [
                        { name: 'task_id', type: 'string', required: true, description: 'Task ID' },
                        { name: 'updates', type: 'object', required: true, description: 'Task updates' },
                    ],
                    returns: { type: 'object', description: 'Updated task' },
                },
                {
                    method: 'complete_task',
                    description: 'Mark task as complete',
                    parameters: [
                        { name: 'task_id', type: 'string', required: true, description: 'Task ID' },
                    ],
                    returns: { type: 'object', description: 'Completed task' },
                },
                {
                    method: 'get_projects',
                    description: 'Get projects from workspace',
                    parameters: [
                        { name: 'workspace_id', type: 'string', required: false, description: 'Workspace ID' },
                        { name: 'team_id', type: 'string', required: false, description: 'Team ID' },
                        { name: 'limit', type: 'number', required: false, description: 'Number of projects to return' },
                    ],
                    returns: { type: 'array', description: 'List of projects' },
                },
            ],
            status: 'disconnected',
            config: {
                host: 'app.asana.com',
                port: 443,
                apiKey: process.env.ASANA_ACCESS_TOKEN,
                timeout: 30000,
                maxRetries: 3,
            },
        };
    }
    async handleMessage(message) {
        try {
            switch (message.method) {
                case 'ping':
                    return this.handlePing(message);
                case 'get_tasks':
                    return await this.getTasks(message);
                case 'create_task':
                    return await this.createTask(message);
                case 'update_task':
                    return await this.updateTask(message);
                case 'delete_task':
                    return await this.deleteTask(message);
                case 'complete_task':
                    return await this.completeTask(message);
                case 'get_projects':
                    return await this.getProjects(message);
                case 'create_project':
                    return await this.createProject(message);
                case 'update_project':
                    return await this.updateProject(message);
                case 'get_project_tasks':
                    return await this.getProjectTasks(message);
                case 'get_team_members':
                    return await this.getTeamMembers(message);
                case 'assign_task':
                    return await this.assignTask(message);
                case 'get_workspaces':
                    return await this.getWorkspaces(message);
                case 'create_automation_rule':
                    return await this.createAutomationRule(message);
                case 'trigger_automation':
                    return await this.triggerAutomation(message);
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
        }
        catch (error) {
            this.logger.error(`Error handling Asana message:`, error);
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
    handlePing(message) {
        return {
            jsonrpc: '2.0',
            id: message.id,
            result: 'pong',
        };
    }
    async getTasks(message) {
        const { project_id, assignee, completed, limit = 100 } = message.params;
        const params = {
            opt_fields: 'name,notes,completed,due_on,created_at,modified_at,assignee,projects,tags,priority',
            limit,
        };
        if (project_id)
            params.project = project_id;
        if (assignee)
            params.assignee = assignee;
        if (completed !== undefined)
            params.completed_since = completed ? null : 'now';
        const response = await this.client.get('/tasks', { params });
        const tasks = response.data.data.map((task) => ({
            id: task.gid,
            name: task.name,
            notes: task.notes,
            completed: task.completed,
            due_on: task.due_on,
            created_at: task.created_at,
            modified_at: task.modified_at,
            assignee: task.assignee,
            projects: task.projects,
            tags: task.tags,
            priority: task.priority,
        }));
        return {
            jsonrpc: '2.0',
            id: message.id,
            result: { tasks },
        };
    }
    async createTask(message) {
        const { name, notes, project_id, assignee, due_on, priority } = message.params;
        const taskData = {
            name,
            notes,
            due_on,
            priority,
        };
        if (project_id)
            taskData.projects = [project_id];
        if (assignee)
            taskData.assignee = assignee;
        const response = await this.client.post('/tasks', {
            data: taskData,
        });
        return {
            jsonrpc: '2.0',
            id: message.id,
            result: { task: response.data.data },
        };
    }
    async updateTask(message) {
        const { task_id, updates } = message.params;
        const response = await this.client.put(`/tasks/${task_id}`, {
            data: updates,
        });
        return {
            jsonrpc: '2.0',
            id: message.id,
            result: { task: response.data.data },
        };
    }
    async deleteTask(message) {
        const { task_id } = message.params;
        const response = await this.client.delete(`/tasks/${task_id}`);
        return {
            jsonrpc: '2.0',
            id: message.id,
            result: { success: true },
        };
    }
    async completeTask(message) {
        const { task_id } = message.params;
        const response = await this.client.put(`/tasks/${task_id}`, {
            data: { completed: true },
        });
        return {
            jsonrpc: '2.0',
            id: message.id,
            result: { task: response.data.data },
        };
    }
    async getProjects(message) {
        const { workspace_id, team_id, limit = 100 } = message.params;
        const params = {
            opt_fields: 'name,notes,color,created_at,modified_at,owner,team,members,status',
            limit,
        };
        if (workspace_id)
            params.workspace = workspace_id;
        if (team_id)
            params.team = team_id;
        const response = await this.client.get('/projects', { params });
        const projects = response.data.data.map((project) => ({
            id: project.gid,
            name: project.name,
            notes: project.notes,
            color: project.color,
            created_at: project.created_at,
            modified_at: project.modified_at,
            owner: project.owner,
            team: project.team,
            members: project.members,
            status: project.status,
        }));
        return {
            jsonrpc: '2.0',
            id: message.id,
            result: { projects },
        };
    }
    async createProject(message) {
        const { name, notes, team_id, workspace_id } = message.params;
        const projectData = {
            name,
            notes,
        };
        if (team_id)
            projectData.team = team_id;
        if (workspace_id)
            projectData.workspace = workspace_id;
        const response = await this.client.post('/projects', {
            data: projectData,
        });
        return {
            jsonrpc: '2.0',
            id: message.id,
            result: { project: response.data.data },
        };
    }
    async updateProject(message) {
        const { project_id, updates } = message.params;
        const response = await this.client.put(`/projects/${project_id}`, {
            data: updates,
        });
        return {
            jsonrpc: '2.0',
            id: message.id,
            result: { project: response.data.data },
        };
    }
    async getProjectTasks(message) {
        const { project_id, limit = 100 } = message.params;
        const response = await this.client.get(`/projects/${project_id}/tasks`, {
            params: {
                opt_fields: 'name,notes,completed,due_on,created_at,modified_at,assignee,priority',
                limit,
            },
        });
        const tasks = response.data.data.map((task) => ({
            id: task.gid,
            name: task.name,
            notes: task.notes,
            completed: task.completed,
            due_on: task.due_on,
            created_at: task.created_at,
            modified_at: task.modified_at,
            assignee: task.assignee,
            priority: task.priority,
        }));
        return {
            jsonrpc: '2.0',
            id: message.id,
            result: { tasks },
        };
    }
    async getTeamMembers(message) {
        const { team_id } = message.params;
        const response = await this.client.get(`/teams/${team_id}/users`, {
            params: {
                opt_fields: 'name,email,photo',
            },
        });
        const members = response.data.data.map((member) => ({
            id: member.gid,
            name: member.name,
            email: member.email,
            photo: member.photo,
        }));
        return {
            jsonrpc: '2.0',
            id: message.id,
            result: { members },
        };
    }
    async assignTask(message) {
        const { task_id, assignee_id } = message.params;
        const response = await this.client.put(`/tasks/${task_id}`, {
            data: { assignee: assignee_id },
        });
        return {
            jsonrpc: '2.0',
            id: message.id,
            result: { task: response.data.data },
        };
    }
    async getWorkspaces(message) {
        const response = await this.client.get('/workspaces', {
            params: {
                opt_fields: 'name,email_domains,is_organization',
            },
        });
        const workspaces = response.data.data.map((workspace) => ({
            id: workspace.gid,
            name: workspace.name,
            email_domains: workspace.email_domains,
            is_organization: workspace.is_organization,
        }));
        return {
            jsonrpc: '2.0',
            id: message.id,
            result: { workspaces },
        };
    }
    async createAutomationRule(message) {
        const { project_id, trigger, action } = message.params;
        const ruleData = {
            project: project_id,
            trigger,
            action,
            created_at: new Date().toISOString(),
        };
        return {
            jsonrpc: '2.0',
            id: message.id,
            result: { rule: ruleData },
        };
    }
    async triggerAutomation(message) {
        const { rule_id, event_data } = message.params;
        this.logger.log(`Triggering automation rule ${rule_id} with event:`, event_data);
        return {
            jsonrpc: '2.0',
            id: message.id,
            result: {
                success: true,
                message: 'Automation triggered successfully',
                timestamp: new Date().toISOString(),
            },
        };
    }
    async createLIF3Task(title, description, priority, dueDate) {
        const taskData = {
            name: `[LIF3] ${title}`,
            notes: description,
            projects: [process.env.ASANA_LIF3_PROJECT_ID],
            priority,
        };
        if (dueDate)
            taskData.due_on = dueDate;
        const response = await this.client.post('/tasks', {
            data: taskData,
        });
        return response.data.data;
    }
    async createErrorTask(errorData) {
        const taskData = {
            name: `[ERROR] ${errorData.title}`,
            notes: `Error Details:\n${errorData.description}\n\nStack Trace:\n${errorData.stack}`,
            projects: [process.env.ASANA_ERROR_PROJECT_ID],
            priority: 'high',
            tags: ['error', 'auto-generated'],
        };
        const response = await this.client.post('/tasks', {
            data: taskData,
        });
        return response.data.data;
    }
};
exports.AsanaMCPServer = AsanaMCPServer;
exports.AsanaMCPServer = AsanaMCPServer = AsanaMCPServer_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AsanaMCPServer);
//# sourceMappingURL=asana-mcp-server.js.map