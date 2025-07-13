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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerModule = void 0;
const common_1 = require("@nestjs/common");
const nest_winston_1 = require("nest-winston");
const winston = __importStar(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const logger_service_1 = require("./logger.service");
const logFormat = winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.errors({ stack: true }), winston.format.splat(), winston.format.json(), winston.format.prettyPrint());
const fileRotateTransport = new winston_daily_rotate_file_1.default({
    filename: 'logs/lif3-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '30d',
    maxSize: '20m',
    format: logFormat,
    zippedArchive: true,
});
const errorFileRotateTransport = new winston_daily_rotate_file_1.default({
    filename: 'logs/lif3-error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '30d',
    maxSize: '20m',
    level: 'error',
    format: logFormat,
    zippedArchive: true,
});
const financialAuditTransport = new winston_daily_rotate_file_1.default({
    filename: 'logs/financial-audit-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '365d',
    maxSize: '50m',
    format: winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.json()),
    zippedArchive: true,
});
const securityAuditTransport = new winston_daily_rotate_file_1.default({
    filename: 'logs/security-audit-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '365d',
    maxSize: '50m',
    format: winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.json()),
    zippedArchive: true,
});
let LoggerModule = class LoggerModule {
};
exports.LoggerModule = LoggerModule;
exports.LoggerModule = LoggerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            nest_winston_1.WinstonModule.forRoot({
                transports: [
                    new winston.transports.Console({
                        format: winston.format.combine(winston.format.cli(), winston.format.splat(), winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.printf((info) => `${info.timestamp} [${info.level}] ${info.message}`)),
                    }),
                    fileRotateTransport,
                    errorFileRotateTransport,
                    financialAuditTransport,
                    securityAuditTransport,
                ],
            }),
        ],
        providers: [logger_service_1.LoggerService],
        exports: [logger_service_1.LoggerService],
    })
], LoggerModule);
//# sourceMappingURL=logger.module.js.map