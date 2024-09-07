import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import * as client from 'prom-client';

@Injectable()
export class NetworkInterceptor implements NestInterceptor {
  private readonly httpRequestDuration: client.Histogram<string>;

  constructor() {
    this.httpRequestDuration = new client.Histogram({
        name: 'http_request_duration_seconds',
        help: 'Duration of HTTP requests in seconds',
        labelNames: ['method', 'status_code', 'path'],
    });
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const method = request.method;
    const url = request.url;
    const end = this.httpRequestDuration.startTimer();

    return next.handle().pipe(
      tap(() => {
        end({ method, status_code: response.statusCode, path: url });
      }),
      catchError((error) => {
        end({ method, status_code: error.status || HttpStatus.INTERNAL_SERVER_ERROR, path: url });
        throw error;
      }),
    );
  }
}
