import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

interface ErrorDetails {
  type: string;
  message: string;
  timestamp: Date;
  stack?: string;
  context?: any;
  userInfo?: any;
  browserInfo?: any;
}

@Component({
  selector: 'app-error-details-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="error-details-container">
      <h2 mat-dialog-title>Détails de l'erreur</h2>
      
      <mat-dialog-content>
        <div class="error-section">
          <h3>Informations de base</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Type:</span>
              <span class="value">{{ data.type }}</span>
            </div>
            <div class="info-item">
              <span class="label">Message:</span>
              <span class="value">{{ data.message }}</span>
            </div>
            <div class="info-item">
              <span class="label">Timestamp:</span>
              <span class="value">{{ data.timestamp | date:'medium' }}</span>
            </div>
          </div>
        </div>

        <div class="error-section" *ngIf="data.stack">
          <h3>Stack Trace</h3>
          <pre class="stack-trace">{{ data.stack }}</pre>
        </div>

        <div class="error-section" *ngIf="data.context">
          <h3>Contexte</h3>
          <pre class="context-data">{{ data.context | json }}</pre>
        </div>

        <div class="error-section" *ngIf="data.userInfo">
          <h3>Informations utilisateur</h3>
          <div class="info-grid">
            <div class="info-item" *ngFor="let info of data.userInfo | keyvalue">
              <span class="label">{{ info.key }}:</span>
              <span class="value">{{ info.value }}</span>
            </div>
          </div>
        </div>

        <div class="error-section" *ngIf="data.browserInfo">
          <h3>Informations navigateur</h3>
          <div class="info-grid">
            <div class="info-item" *ngFor="let info of data.browserInfo | keyvalue">
              <span class="label">{{ info.key }}:</span>
              <span class="value">{{ info.value }}</span>
            </div>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onClose()">Fermer</button>
        <button mat-raised-button color="primary" (click)="onReport()">
          Signaler l'erreur
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .error-details-container {
      padding: 20px;
      max-width: 800px;
    }

    .error-section {
      margin-bottom: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 6px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
    }

    .label {
      font-weight: bold;
      color: #6c757d;
      margin-bottom: 4px;
    }

    .value {
      word-break: break-word;
    }

    .stack-trace {
      background: #2d2d2d;
      color: #fff;
      padding: 15px;
      border-radius: 4px;
      overflow-x: auto;
      font-family: monospace;
      font-size: 14px;
      line-height: 1.5;
    }

    .context-data {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      overflow-x: auto;
      font-family: monospace;
      font-size: 14px;
      line-height: 1.5;
    }

    pre {
      margin: 0;
      white-space: pre-wrap;
    }

    mat-dialog-actions {
      margin-top: 20px;
      padding: 0;
    }

    button {
      margin-left: 8px;
    }
  `]
})
export class ErrorDetailsModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ErrorDetailsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ErrorDetails
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  onReport(): void {
    // Implement error reporting logic
    console.log('Reporting error:', this.data);
    this.dialogRef.close();
  }
} 