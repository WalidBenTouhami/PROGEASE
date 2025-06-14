import { Injectable } from '@angular/core';
import * as Sentry from '@sentry/angular';
import { BrowserTracing } from '@sentry/tracing';
import { Router, NavigationEnd } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MonitoringService {
  private performanceMetrics: Map<string, number> = new Map();
  private userSessionStart: number = Date.now();

  constructor(private router: Router) {
    this.initializeSentry();
    this.initializePerformanceMonitoring();
    this.initializeUserTracking();
  }

  private initializeSentry(): void {
    if (environment.production) {
      Sentry.init({
        dsn: environment.sentry.dsn,
        integrations: [
          new BrowserTracing({
            tracingOrigins: ['localhost', environment.apiUrl],
            routingInstrumentation: Sentry.routingInstrumentation,
          }),
        ],
        tracesSampleRate: 1.0,
        environment: environment.sentry.environment,
        release: environment.version,
        beforeSend: (event) => {
          // Add custom context to all events
          event.extra = {
            ...event.extra,
            performanceMetrics: Object.fromEntries(this.performanceMetrics),
            sessionDuration: Date.now() - this.userSessionStart,
          };
          return event;
        },
      });
    }
  }

  private initializePerformanceMonitoring(): void {
    if (environment.production) {
      // Monitor page load performance
      window.addEventListener('load', () => {
        const timing = window.performance.timing;
        this.performanceMetrics.set('pageLoadTime', timing.loadEventEnd - timing.navigationStart);
        this.performanceMetrics.set('domContentLoaded', timing.domContentLoadedEventEnd - timing.navigationStart);
        this.performanceMetrics.set('firstPaint', timing.responseEnd - timing.navigationStart);
      });

      // Monitor API response times
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const start = performance.now();
        try {
          const response = await originalFetch(...args);
          const duration = performance.now() - start;
          this.performanceMetrics.set(`api_${args[0]}`, duration);
          return response;
        } catch (error) {
          const duration = performance.now() - start;
          this.performanceMetrics.set(`api_error_${args[0]}`, duration);
          throw error;
        }
      };
    }
  }

  private initializeUserTracking(): void {
    if (environment.production) {
      // Track user navigation
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          Sentry.addBreadcrumb({
            category: 'navigation',
            message: `Navigated to ${event.urlAfterRedirects}`,
            level: 'info',
          });
        }
      });

      // Track user interactions
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (target.tagName === 'BUTTON' || target.tagName === 'A') {
          Sentry.addBreadcrumb({
            category: 'user-interaction',
            message: `Clicked ${target.textContent}`,
            level: 'info',
          });
        }
      });
    }
  }

  public captureException(error: Error, context?: any): void {
    if (environment.production) {
      Sentry.withScope((scope) => {
        if (context) {
          scope.setExtras(context);
        }
        scope.setExtra('performanceMetrics', Object.fromEntries(this.performanceMetrics));
        scope.setExtra('sessionDuration', Date.now() - this.userSessionStart);
        Sentry.captureException(error);
      });
    } else {
      console.error('Error:', error, context);
    }
  }

  public captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: any): void {
    if (environment.production) {
      Sentry.withScope((scope) => {
        if (context) {
          scope.setExtras(context);
        }
        scope.setExtra('performanceMetrics', Object.fromEntries(this.performanceMetrics));
        scope.setExtra('sessionDuration', Date.now() - this.userSessionStart);
        Sentry.captureMessage(message, level);
      });
    } else {
      console.log(`[${level.toUpperCase()}] ${message}`, context);
    }
  }

  public setUser(user: { id: string; email: string } | null): void {
    if (environment.production) {
      Sentry.setUser(user);
      if (user) {
        this.captureMessage('User logged in', 'info', { userId: user.id });
      } else {
        this.captureMessage('User logged out', 'info');
      }
    }
  }

  public startTransaction(name: string, op: string): any {
    if (environment.production) {
      return Sentry.startTransaction({
        name,
        op,
      });
    }
    return null;
  }

  public trackPerformanceMetric(name: string, value: number): void {
    this.performanceMetrics.set(name, value);
    if (environment.production) {
      Sentry.addBreadcrumb({
        category: 'performance',
        message: `${name}: ${value}ms`,
        level: 'info',
      });
    }
  }

  public getPerformanceMetrics(): Map<string, number> {
    return this.performanceMetrics;
  }

  public getSessionDuration(): number {
    return Date.now() - this.userSessionStart;
  }
} 