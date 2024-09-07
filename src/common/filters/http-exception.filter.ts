import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

import * as client from 'prom-client';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly httpRequestDuration: client.Histogram<string>;

  constructor() {
    this.httpRequestDuration = new client.Histogram({
      name: 'http_error_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'status_code', 'path'],
    });
  }
  catch(exception: unknown, host: ArgumentsHost) {
    const end = this.httpRequestDuration.startTimer();
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const payload =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error', statusCode } as any;

    payload.timestamp = new Date().toISOString();
    payload.path = ctx.getRequest().url;

    if (payload.message === "Unauthorized" && statusCode === HttpStatus.UNAUTHORIZED) {
      end({
        method: ctx.getRequest().method,
        status_code: statusCode,
        path: ctx.getRequest().url,
      });
    }

    response.status(statusCode).json(payload);
  }
}
