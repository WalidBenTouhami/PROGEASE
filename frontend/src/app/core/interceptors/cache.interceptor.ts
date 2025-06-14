import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../services/cache.service';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  constructor(private cacheService: CacheService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Only cache GET requests
    if (request.method !== 'GET') {
      return next.handle(request);
    }

    const cachedResponse = this.cacheService.get(request.url);
    if (cachedResponse) {
      return of(new HttpResponse({ body: cachedResponse }));
    }

    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          this.cacheService.set(request.url, event.body);
        }
      })
    );
  }
} 