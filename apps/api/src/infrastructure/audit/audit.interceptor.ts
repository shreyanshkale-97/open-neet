import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service';
import { AUDIT_LOG_KEY } from './audit-log.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private auditService: AuditService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const action = this.reflector.get<string>(AUDIT_LOG_KEY, context.getHandler());
    if (!action) return next.handle();

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const ip = req.ip || req.connection?.remoteAddress;

    return next.handle().pipe(
      tap(async (result) => {
        if (user) {
          await this.auditService.log({
            adminId: user.id || user.authUserId,
            action,
            newValue: result,
            ipAddress: ip,
          });
        }
      })
    );
  }
}