import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';

interface BreadcrumbItem {
  label: string;
  url: string;
}

@Component({
  selector: 'app-front-office-template',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    BreadcrumbComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-100">
      <mat-toolbar color="primary" class="fixed top-0 z-50 shadow-md">
        <button mat-icon-button (click)="sidenav.toggle()">
          <mat-icon>menu</mat-icon>
        </button>
        <span class="ml-4">{{appName}}</span>
        <span class="flex-grow"></span>
        <button mat-button routerLink="/back-office">
          <mat-icon>admin_panel_settings</mat-icon>
          Administration
        </button>
      </mat-toolbar>

      <mat-sidenav-container class="min-h-screen pt-16">
        <mat-sidenav #sidenav mode="side" opened class="w-64 pt-4">
          <mat-nav-list>
            <a mat-list-item routerLink="/front-office" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <mat-icon matListItemIcon>dashboard</mat-icon>
              <span matListItemTitle>Tableau de bord</span>
            </a>
            <a mat-list-item routerLink="/front-office/projets" routerLinkActive="active">
              <mat-icon matListItemIcon>folder</mat-icon>
              <span matListItemTitle>Projets</span>
            </a>
            <a mat-list-item routerLink="/front-office/livrables" routerLinkActive="active">
              <mat-icon matListItemIcon>description</mat-icon>
              <span matListItemTitle>Livrables</span>
            </a>
            <a mat-list-item routerLink="/front-office/evaluations" routerLinkActive="active">
              <mat-icon matListItemIcon>grade</mat-icon>
              <span matListItemTitle>Évaluations</span>
            </a>
          </mat-nav-list>
        </mat-sidenav>

        <mat-sidenav-content class="p-6">
          <app-breadcrumb></app-breadcrumb>
          <router-outlet></router-outlet>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .mat-toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 2;
    }
    .mat-sidenav-container {
      min-height: calc(100vh - 64px);
      margin-top: 64px;
    }
    .mat-sidenav {
      width: 250px;
    }
    .active {
      background-color: rgba(0, 0, 0, 0.04);
    }
  `],
  animations: [
    trigger('fadeAnimation', [
      transition('* => *', [
        style({ opacity: 0 }),
        animate('0.3s', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class FrontOfficeTemplateComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  showBackToTop = false;
  currentYear = new Date().getFullYear();
  appName = environment.appName;
  version = environment.version;
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Accueil', url: '/front-office' },
    { label: 'Mes projets', url: '/front-office/projets' }
  ];

  constructor(private router: Router) {
    // Subscribe to router events to update breadcrumb
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateBreadcrumb();
    });
  }

  ngOnInit() {
    // Initial scroll position check
    this.checkScroll();
    // Initial breadcrumb setup
    this.updateBreadcrumb();
  }

  @HostListener('window:scroll')
  checkScroll() {
    // Show back-to-top button when scrolled down 300px
    this.showBackToTop = window.pageYOffset > 300;
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  private updateBreadcrumb() {
    const urlSegments = this.router.url.split('/').filter(segment => segment);
    this.breadcrumbItems = [
      { label: 'Front Office', url: '/front-office' }
    ];

    if (urlSegments.length > 1) {
      const currentPage = urlSegments[urlSegments.length - 1];
      this.breadcrumbItems.push({
        label: this.formatPageName(currentPage),
        url: this.router.url
      });
    }
  }

  private formatPageName(page: string): string {
    // Convert kebab-case to Title Case
    return page
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  toggleSidenav() {
    this.sidenav?.toggle();
  }

  logout() {
    // TODO: Implement logout logic
    console.log('Logout clicked');
  }
} 