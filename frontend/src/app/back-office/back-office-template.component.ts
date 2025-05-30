import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { filter } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { BreadcrumbComponent } from '../shared/components/breadcrumb/breadcrumb.component';

interface BreadcrumbItem {
  label: string;
  url: string;
}

@Component({
  selector: 'app-back-office-template',
  templateUrl: './back-office-template.component.html',
  styleUrls: ['./back-office-template.component.scss'],
  animations: [
    trigger('fadeAnimation', [
      transition('* => *', [
        style({ opacity: 0 }),
        animate('0.3s', style({ opacity: 1 }))
      ])
    ])
  ],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    BreadcrumbComponent
  ]
})
export class BackOfficeTemplateComponent implements OnInit {
  showBackToTop = false;
  currentYear = new Date().getFullYear();
  version = environment.version;
  appName = environment.appName;
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Accueil', url: '/back-office' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
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

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        console.error('Erreur lors de la déconnexion:', error);
        // Rediriger quand même vers la page de login en cas d'erreur
        this.router.navigate(['/auth/login']);
      }
    });
  }

  private updateBreadcrumb() {
    const urlSegments = this.router.url.split('/').filter(segment => segment);
    let currentPath = '';
    
    this.breadcrumbItems = [{ label: 'Accueil', url: '/back-office' }];
    
    for (let i = 1; i < urlSegments.length; i++) {
      currentPath += '/' + urlSegments[i];
      this.breadcrumbItems.push({
        label: this.formatPageName(urlSegments[i]),
        url: '/back-office' + currentPath
      });
    }
  }

  private formatPageName(segment: string): string {
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
} 