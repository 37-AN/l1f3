"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const logger_service_1 = require("./common/logger/logger.service");
const compression_1 = __importDefault(require("compression"));
const helmet_1 = __importDefault(require("helmet"));
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });
    const configService = app.get(config_1.ConfigService);
    const loggerService = app.get(logger_service_1.LoggerService);
    const port = configService.get('PORT', 3001);
    app.use((0, helmet_1.default)({
        crossOriginEmbedderPolicy: false,
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
                fontSrc: ["'self'", 'https://fonts.gstatic.com'],
                imgSrc: ["'self'", 'data:', 'https:'],
                scriptSrc: ["'self'"],
                connectSrc: ["'self'", 'ws:', 'wss:'],
            },
        },
    }));
    app.use((0, compression_1.default)());
    app.enableCors({
        origin: [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            configService.get('FRONTEND_URL', 'http://localhost:3000')
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(loggerService));
    app.setGlobalPrefix('api', {
        exclude: ['health', '/']
    });
    if (configService.get('NODE_ENV') !== 'production') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('LIF3 Financial Dashboard API')
            .setDescription('Personal wealth tracking system for Ethan Barnes - Journey to R1.8M net worth')
            .setVersion('1.0')
            .setContact('Ethan Barnes', 'https://43v3r.ai', 'ethan@43v3r.ai')
            .addTag('Financial', 'Financial tracking and goal management')
            .addTag('Business', '43V3R business metrics and revenue tracking')
            .addTag('Auth', 'Authentication and security')
            .addTag('WebSocket', 'Real-time updates and notifications')
            .addTag('Integrations', 'Google Drive, Discord, Claude AI integrations')
            .addBearerAuth()
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document, {
            customSiteTitle: 'LIF3 API Documentation',
            customfavIcon: '/favicon.ico',
            customCss: '.swagger-ui .topbar { display: none }',
        });
    }
    app.getHttpAdapter().get('/health', (req, res) => {
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: configService.get('NODE_ENV'),
            version: '1.0.0',
            service: 'LIF3 Financial Dashboard',
            user: 'Ethan Barnes',
            business: '43V3R',
            netWorthTarget: 'R1,800,000',
            currentProgress: '13.3%'
        });
    });
    app.getHttpAdapter().get('/', (req, res) => {
        res.json({
            message: 'LIF3 Financial Dashboard API',
            user: 'Ethan Barnes',
            business: '43V3R AI Startup',
            goal: 'R1,800,000 net worth',
            currentProgress: '13.3%',
            documentation: '/api/docs',
            health: '/health',
            version: '1.0.0'
        });
    });
    await app.listen(port, '0.0.0.0');
    loggerService.log(`🚀 LIF3 Financial Dashboard API started on port ${port}`, 'Bootstrap');
    loggerService.log(`📊 Target: R239,625 → R1,800,000 (13.3% progress)`, 'Bootstrap');
    loggerService.log(`🏢 43V3R Business: R0 → R4,881 daily target`, 'Bootstrap');
    loggerService.log(`📖 API Documentation: http://localhost:${port}/api/docs`, 'Bootstrap');
    loggerService.log(`💚 Health Check: http://localhost:${port}/health`, 'Bootstrap');
    if (configService.get('NODE_ENV') !== 'production') {
        console.log(`
╔══════════════════════════════════════════════════════╗
║              LIF3 Financial Dashboard                ║
║                                                      ║
║  🎯 Goal: R239,625 → R1,800,000 (13.3% progress)    ║
║  🚀 43V3R Daily Target: R4,881                       ║
║  📱 Frontend: http://localhost:3000                  ║
║  🔗 Backend API: http://localhost:${port}              ║
║  📖 Documentation: http://localhost:${port}/api/docs   ║
║  💚 Health: http://localhost:${port}/health            ║
║                                                      ║
║  User: Ethan Barnes <ethan@43v3r.ai>                 ║
║  Business: 43V3R AI Startup                          ║
║  Location: Cape Town, South Africa                   ║
╚══════════════════════════════════════════════════════╝
    `);
    }
}
bootstrap().catch((error) => {
    console.error('❌ Failed to start LIF3 Financial Dashboard:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map