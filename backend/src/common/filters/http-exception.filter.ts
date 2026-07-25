import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

interface ErrorResponseBody {
  success: false;
  statusCode: number;
  path: string;
  timestamp: string;
  message: string | string[];
  error?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error: string | undefined = 'InternalServerError';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const body = res as Record<string, unknown>;
        message = (body.message as string | string[]) ?? exception.message;
        error = (body.error as string) ?? exception.name;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      error = 'DatabaseError';
      switch (exception.code) {
        case 'P2002':
          statusCode = HttpStatus.CONFLICT;
          message = `Duplicate value for field(s): ${(exception.meta?.target as string[])?.join(', ') ?? 'unknown'}`;
          break;
        case 'P2025':
          statusCode = HttpStatus.NOT_FOUND;
          message = 'Requested record was not found';
          break;
        case 'P2003':
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'Invalid reference to a related record';
          break;
        default:
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'Database request error';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    if (statusCode >= 500) {
      this.logger.error(
        `${request.method} ${request.url} -> ${statusCode}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(`${request.method} ${request.url} -> ${statusCode} ${message}`);
    }

    const body: ErrorResponseBody = {
      success: false,
      statusCode,
      path: request.url,
      timestamp: new Date().toISOString(),
      message,
      error,
    };

    response.status(statusCode).json(body);
  }
}
