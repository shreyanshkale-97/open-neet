import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorName = 'InternalServerError';
    let message: string | object = 'An unexpected internal server error occurred';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      errorName = exception.name;

      if (typeof res === 'object' && res !== null && 'message' in res) {
        message = (res as { message: string | object }).message;
      } else {
        message = res;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      errorName = exception.constructor.name;
    }

    this.logger.error(`[${request.method}] ${request.url} - Status: ${status} - Error: ${JSON.stringify(message)}`);

    response.status(status).json({
      success: false,
      error: errorName,
      message,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}