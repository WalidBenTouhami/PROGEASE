import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="loading-spinner" *ngIf="isLoading">
      <mat-spinner [diameter]="diameter" [color]="color"></mat-spinner>
      <p *ngIf="message" class="loading-message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .loading-message {
      margin-top: 10px;
      color: #666;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() isLoading = false;
  @Input() message = '';
  @Input() diameter = 40;
  @Input() color = 'primary';
} 