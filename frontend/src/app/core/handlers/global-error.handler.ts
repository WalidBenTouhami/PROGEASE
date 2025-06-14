import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { ErrorTrackingService } from '../services/error-tracking.service';
import { NotificationService } from '../../services/notification.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(
    private errorTrackingService: ErrorTrackingService,
    private notificationService: NotificationService,
    private ngZone: NgZone
  ) {}

  handleError(error: Error): void {
    // Track the error
    this.errorTrackingService.trackError(error, {
      component: 'GlobalErrorHandler',
      action: 'handleError'
    });

    // Show notification in the Angular zone
    this.ngZone.run(() => {
      this.notificationService.showError(
        'Une erreur est survenue',
        'Veuillez réessayer ou contacter le support si le problème persiste.'
      );
    });

    // Log to console in development
    if (!environment.production) {
      console.error('Global error handler caught an error:', error);
    }
  }
} 