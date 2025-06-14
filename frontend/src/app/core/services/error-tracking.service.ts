import { Injectable } from '@angular/core';
import { MonitoringService } from './monitoring.service';
import { Router, NavigationError } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

export interface ErrorContext {
  timestamp: number;
  url: string;
  userAgent: string;
  stack?: string;
  component?: string;
  action?: string;
  additionalInfo?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorTrackingService {
  private readonly MAX_ERRORS = 100;
  private errorHistory: ErrorContext[] = [];
  private readonly ERROR_CATEGORIES = {
    RUNTIME: 'runtime',
    NETWORK: 'network',
    NAVIGATION: 'navigation',
    VALIDATION: 'validation',
    AUTHENTICATION: 'authentication',
    AUTHORIZATION: 'authorization',
    UNKNOWN: 'unknown'
  };

  constructor(
    private monitoringService: MonitoringService,
    private router: Router
  ) {
    this.initializeErrorTracking();
  }

  private initializeErrorTracking(): void {
    // Track unhandled errors
    window.addEventListener('error', (event) => {
      this.trackError(event.error || new Error(event.message), {
        component: 'window',
        action: 'unhandled',
        additionalInfo: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(event.reason, {
        component: 'promise',
        action: 'unhandled',
        additionalInfo: {
          reason: event.reason
        }
      });
    });

    // Track navigation errors
    this.router.events.subscribe(event => {
      if (event instanceof NavigationError) {
        this.trackError(new Error(event.error.message), {
          component: 'router',
          action: 'navigation',
          additionalInfo: {
            url: event.url
          }
        });
      }
    });
  }

  public trackError(error: Error | HttpErrorResponse, context: Partial<ErrorContext> = {}): void {
    const errorContext: ErrorContext = {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      stack: error instanceof Error ? error.stack : undefined,
      ...context
    };

    // Add to error history
    this.errorHistory.unshift(errorContext);
    if (this.errorHistory.length > this.MAX_ERRORS) {
      this.errorHistory.pop();
    }

    // Determine error category
    const category = this.categorizeError(error);

    // Report to monitoring service with enhanced context
    this.monitoringService.captureException(error, {
      ...errorContext,
      category,
      errorHistory: this.getRecentErrors(5),
      browserInfo: this.getBrowserInfo(),
      deviceInfo: this.getDeviceInfo(),
      networkInfo: this.getNetworkInfo()
    });

    // Log to console in development
    if (!environment.production) {
      console.error(`[${category}] Error:`, error, errorContext);
    }
  }

  private categorizeError(error: Error | HttpErrorResponse): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) return this.ERROR_CATEGORIES.AUTHENTICATION;
      if (error.status === 403) return this.ERROR_CATEGORIES.AUTHORIZATION;
      if (error.status >= 400 && error.status < 500) return this.ERROR_CATEGORIES.VALIDATION;
      return this.ERROR_CATEGORIES.NETWORK;
    }

    if (error instanceof NavigationError) {
      return this.ERROR_CATEGORIES.NAVIGATION;
    }

    return this.ERROR_CATEGORIES.RUNTIME;
  }

  private getRecentErrors(count: number): ErrorContext[] {
    return this.errorHistory.slice(0, count);
  }

  private getBrowserInfo(): any {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      vendor: navigator.vendor,
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack
    };
  }

  private getDeviceInfo(): any {
    return {
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      colorDepth: window.screen.colorDepth
    };
  }

  private getNetworkInfo(): any {
    const connection = (navigator as any).connection;
    return connection ? {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    } : null;
  }

  public getErrorHistory(): ErrorContext[] {
    return [...this.errorHistory];
  }

  public getErrorStats(): { [key: string]: number } {
    return this.errorHistory.reduce((stats, error) => {
      const category = this.categorizeError(new Error(error.stack || ''));
      stats[category] = (stats[category] || 0) + 1;
      return stats;
    }, {} as { [key: string]: number });
  }

  public clearErrorHistory(): void {
    this.errorHistory = [];
  }
} 