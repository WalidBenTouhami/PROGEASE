import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-back-office-template',
  templateUrl: './back-office-template.component.html',
  styleUrls: ['./back-office-template.component.css'],
  animations: [
    trigger('fadeAnimation', [
      transition('* => *', [
        style({ opacity: 0 }),
        animate('0.3s', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class BackOfficeTemplateComponent implements OnInit {
  showBackToTop = false;
  currentYear = new Date().getFullYear();
  version = environment.version;
  breadcrumbItems: Array<{label: string, url?: string}> = [];

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
    this.breadcrumbItems = [
      { label: 'Back Office', url: '/back-office' }
    ];

    if (urlSegments.length > 1) {
      const currentPage = urlSegments[urlSegments.length - 1];
      this.breadcrumbItems.push({
        label: this.formatPageName(currentPage)
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
} 