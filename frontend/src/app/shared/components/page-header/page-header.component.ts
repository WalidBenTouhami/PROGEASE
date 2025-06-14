import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterModule],
  template: `
    <div class="page-header" [class.with-actions]="hasActions">
      <div class="header-content">
        <h1 class="title">{{ title }}</h1>
        <p *ngIf="subtitle" class="subtitle">{{ subtitle }}</p>
      </div>
      <div class="actions" *ngIf="hasActions">
        <ng-content select="[headerActions]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding: 16px 0;
    }
    .header-content {
      flex: 1;
    }
    .title {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.87);
    }
    .subtitle {
      margin: 8px 0 0;
      color: rgba(0, 0, 0, 0.54);
    }
    .actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .with-actions {
      padding-right: 16px;
    }
  `]
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';

  get hasActions(): boolean {
    return !!this.title;
  }
} 