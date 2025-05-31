import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface BreadcrumbItem {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <nav class="flex py-3 px-5 text-gray-700 bg-gray-50 rounded-lg" aria-label="Breadcrumb">
      <ol class="inline-flex items-center space-x-1 md:space-x-3">
        <li class="inline-flex items-center">
          <a routerLink="/" class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
            <mat-icon class="w-4 h-4 mr-2">home</mat-icon>
            Accueil
          </a>
        </li>
        <li *ngFor="let item of breadcrumbs">
          <div class="flex items-center">
            <mat-icon class="w-6 h-6 text-gray-400">chevron_right</mat-icon>
            <a [routerLink]="item.url" class="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2">
              {{item.label}}
            </a>
          </div>
        </li>
      </ol>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
      margin-bottom: 1rem;
    }
  `]
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: BreadcrumbItem[] = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root);
      });
  }

  private createBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: BreadcrumbItem[] = []): BreadcrumbItem[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const label = child.snapshot.data['breadcrumb'];
      if (label) {
        breadcrumbs.push({ label, url });
      }

      return this.createBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }
} 