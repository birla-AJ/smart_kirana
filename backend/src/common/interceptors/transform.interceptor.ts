import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * Wraps every successful controller response in a consistent envelope.
 * Controllers may return { message, data } to customize the message,
 * otherwise a default message is used.
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse();

    return next.handle().pipe(
      map((result) => {
        const statusCode = response.statusCode;
        if (result && typeof result === 'object' && 'message' in result && 'data' in result) {
          return {
            success: true,
            statusCode,
            message: (result as any).message,
            data: (result as any).data,
            timestamp: new Date().toISOString(),
          };
        }
        return {
          success: true,
          statusCode,
          message: 'Success',
          data: result,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
