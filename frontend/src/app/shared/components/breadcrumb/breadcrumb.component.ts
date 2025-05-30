import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="breadcrumb" aria-label="breadcrumb">
      <span *ngFor="let item of items; let last = last">
        <a *ngIf="!last" [routerLink]="item.url" class="breadcrumb-item">{{ item.label }}</a>
        <span *ngIf="!last" class="separator">/</span>
        <span *ngIf="last" class="breadcrumb-item current">{{ item.label }}</span>
      </span>
    </nav>
  `,
  styles: [`
    .breadcrumb {
      padding: 8px 16px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    .breadcrumb-item {
      color: #007bff;
      text-decoration: none;
    }
    .breadcrumb-item.current {
      color: #6c757d;
    }
    .separator {
      margin: 0 8px;
      color: #6c757d;
    }
  `]
})
export class BreadcrumbComponent {
  @Input() items: Array<{ label: string; url: string }> = [];
} 