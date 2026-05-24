import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Loguea todo: ruta, payload, stack
    this.logger.error(
      `[${request.method}] ${request.url} - ${status}`,
      exception instanceof Error ? exception.stack : JSON.stringify(exception),
    );
    if (request.body && Object.keys(request.body).length > 0) {
      this.logger.error(`Body: ${JSON.stringify(request.body)}`);
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const errorMessage =
      exception instanceof HttpException
        ? exception.getResponse()
        : isProduction
          ? 'Internal server error'
          : {
              message: (exception as Error)?.message || 'Unknown error',
              detail: (exception as { detail?: string })?.detail,
              code: (exception as { code?: string })?.code,
            };

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: errorMessage,
    });
  }
}
