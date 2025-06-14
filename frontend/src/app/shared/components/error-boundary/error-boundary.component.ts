import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-boundary',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <ng-container *ngIf="!hasError">
      <ng-content></ng-content>
    </ng-container>
    <mat-card *ngIf="hasError" class="error-card">
      <mat-card-header>
        <mat-icon mat-card-avatar color="warn">error</mat-icon>
        <mat-card-title>Something went wrong</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>{{ error?.message }}</p>
        <pre *ngIf="errorInfo" class="error-stack">{{ errorInfo }}</pre>
      </mat-card-content>
      <mat-card-actions>
        <button mat-button color="primary" (click)="handleRetry()">Retry</button>
        <button mat-button color="warn" (click)="handleReport()">Report Issue</button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .error-card {
      margin: 20px;
      max-width: 600px;
    }
    .error-stack {
      background: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 12px;
    }
  `]
})
export class ErrorBoundaryComponent implements OnInit {
  hasError = false;
  error: Error | null = null;
  errorInfo: string | null = null;

  ngOnInit(): void {
    // Initialize error handling
    window.onerror = (message, source, lineno, colno, error) => {
      this.handleError(error || new Error(message as string));
      return false;
    };

    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason);
    });
  }

  private handleError(error: Error): void {
    this.hasError = true;
    this.error = error;
    this.errorInfo = error.stack || null;
    console.error('Error caught by boundary:', error);
  }

  handleRetry(): void {
    this.hasError = false;
    this.error = null;
    this.errorInfo = null;
    window.location.reload();
  }

  handleReport(): void {
    // Implement error reporting logic
    console.log('Reporting error:', this.error);
  }
} 