import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { LoggerService } from '../logger/logger.service';
export declare class AuditLogGuard implements CanActivate {
    private reflector;
    private logger;
    constructor(reflector: Reflector, logger: LoggerService);
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>;
}
