import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-front-office-template',
  templateUrl: './front-office-template.component.html',
  styleUrls: ['./front-office-template.component.css'],
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
  showBackToTop = false;
  currentYear = new Date().getFullYear();
  version = environment.version;
  breadcrumbItems: Array<{label: string, url?: string}> = [];

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