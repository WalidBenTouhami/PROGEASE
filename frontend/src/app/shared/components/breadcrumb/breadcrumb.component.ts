import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-breadcrumb',
  template: `
    <div class="breadcrumb" role="navigation" aria-label="breadcrumb">
      <span *ngFor="let item of items; let last = last">
        <a *ngIf="!last" [routerLink]="item.url" class="breadcrumb-item">
          {{ item.label }}
        </a>
        <span *ngIf="!last" class="separator">/</span>
        <span *ngIf="last" class="breadcrumb-item current">
          {{ item.label }}
        </span>
      </span>
    </div>
  `,
  styles: [`
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: var(--primary-color);
      border-radius: 4px;
      font-size: 0.9rem;
    }
    .breadcrumb-item {
      color: var(--text-color);
      text-decoration: none;
      transition: color var(--transition-speed);
    }
    .breadcrumb-item:hover {
      color: var(--highlight-color);
    }
    .current {
      color: var(--highlight-color);
      font-weight: 500;
    }
    .separator {
      color: var(--text-color);
      opacity: 0.5;
    }
  `],
  standalone: true
})
export class BreadcrumbComponent {
  @Input() items: Array<{label: string, url?: string}> = [];
} 