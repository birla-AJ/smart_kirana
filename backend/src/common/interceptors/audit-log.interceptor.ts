import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditAction } from '@prisma/client';
import { AuditLogsService } from '../../modules/audit-logs/services/audit-logs.service';

const METHOD_ACTION_MAP: Record<string, AuditAction> = {
  POST: AuditAction.CREATE,
  PATCH: AuditAction.UPDATE,
  PUT: AuditAction.UPDATE,
  DELETE: AuditAction.DELETE,
};

/**
 * Automatically records a lightweight audit trail for every mutating
 * (non-GET) API request, without requiring each module's service to
 * remember to call AuditLogsService itself. GET requests, auth
 * endpoints and webhook callbacks are skipped since they either don't
 * mutate data or aren't meaningfully attributable to an admin user.
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const action = METHOD_ACTION_MAP[request.method as string];

    const skip =
      !action ||
      request.path?.startsWith('/api/v1/auth') ||
      request.path?.includes('/webhook');

    if (skip) return next.handle();

    return next.handle().pipe(
      tap(() => {
        const moduleName = request.path?.split('/')?.[3] ?? 'unknown'; // /api/v1/<module>/...
        void this.auditLogsService.log({
          userId: request.user?.id,
          action,
          module: moduleName,
          recordId: request.params?.id,
          description: `${request.method} ${request.path}`,
          ipAddress: request.ip,
          userAgent: request.headers?.['user-agent'],
        });
      }),
    );
  }
}
