import { Component, ErrorHandler, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ErrorTrackingService } from '../services/error-tracking.service';

@Component({
  selector: 'app-error-boundary',
  template: `
    <ng-container *ngIf="!hasError">
      <ng-content></ng-content>
    </ng-container>
    <div *ngIf="hasError" class="error-boundary">
      <h2>Une erreur est survenue</h2>
      <p>{{ error?.message }}</p>
      <button (click)="handleRetry()">Réessayer</button>
    </div>
  `,
  styles: [`
    .error-boundary {
      padding: 20px;
      border: 1px solid #ff0000;
      border-radius: 4px;
      background-color: #fff5f5;
      text-align: center;
    }
    button {
      margin-top: 10px;
      padding: 8px 16px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background-color: #0056b3;
    }
  `]
})
export class ErrorBoundaryComponent implements OnChanges {
  @Input() error: Error | null = null;
  hasError = false;

  constructor(
    private errorTrackingService: ErrorTrackingService,
    private errorHandler: ErrorHandler
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['error'] && changes['error'].currentValue) {
      this.handleError(changes['error'].currentValue);
    }
  }

  private handleError(error: Error): void {
    this.hasError = true;
    this.errorTrackingService.trackError(error, {
      component: 'ErrorBoundary',
      action: 'handleError'
    });
    this.errorHandler.handleError(error);
  }

  handleRetry(): void {
    this.hasError = false;
    this.error = null;
    window.location.reload();
  }
} 