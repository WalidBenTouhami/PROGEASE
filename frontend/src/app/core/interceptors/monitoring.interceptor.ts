import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { MonitoringService } from '../services/monitoring.service';

@Injectable()
export class MonitoringInterceptor implements HttpInterceptor {
  constructor(private monitoringService: MonitoringService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const startTime = performance.now();
    const transaction = this.monitoringService.startTransaction(
      `${request.method} ${request.url}`,
      'http'
    );

    return next.handle(request).pipe(
      tap({
        next: (event) => {
          const duration = performance.now() - startTime;
          this.monitoringService.trackPerformanceMetric(
            `http_${request.method}_${request.url}`,
            duration
          );
          if (transaction) {
            transaction.finish();
          }
        },
        error: (error: HttpErrorResponse) => {
          const duration = performance.now() - startTime;
          this.monitoringService.trackPerformanceMetric(
            `http_error_${request.method}_${request.url}`,
            duration
          );
          
          // Capture error details
          this.monitoringService.captureException(error, {
            url: request.url,
            method: request.method,
            status: error.status,
            statusText: error.statusText,
            duration,
            requestBody: request.body,
            responseBody: error.error
          });

          if (transaction) {
            transaction.setStatus('internal_error');
            transaction.finish();
          }
        }
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }
} 