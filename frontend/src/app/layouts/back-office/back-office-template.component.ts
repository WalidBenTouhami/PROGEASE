import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-back-office-template',
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
    <mat-sidenav-container class="h-screen">
      <mat-sidenav #sidenav mode="side" opened class="w-64 p-4">
        <div class="flex flex-col h-full">
          <div class="flex items-center mb-8">
            <mat-icon class="mr-2">admin_panel_settings</mat-icon>
            <span class="text-xl font-semibold">Administration</span>
          </div>

          <mat-nav-list>
            <a mat-list-item routerLink="/back-office/dashboard" routerLinkActive="active">
              <mat-icon matListItemIcon>dashboard</mat-icon>
              <span matListItemTitle>Tableau de bord</span>
            </a>
            <a mat-list-item routerLink="/back-office/users" routerLinkActive="active">
              <mat-icon matListItemIcon>people</mat-icon>
              <span matListItemTitle>Utilisateurs</span>
            </a>
            <a mat-list-item routerLink="/back-office/settings" routerLinkActive="active">
              <mat-icon matListItemIcon>settings</mat-icon>
              <span matListItemTitle>Paramètres</span>
            </a>
          </mat-nav-list>

          <div class="mt-auto">
            <a mat-list-item routerLink="/">
              <mat-icon matListItemIcon>arrow_back</mat-icon>
              <span matListItemTitle>Retour au site</span>
            </a>
          </div>
        </div>
      </mat-sidenav>

      <mat-sidenav-content class="p-4">
        <app-breadcrumb></app-breadcrumb>
        <router-outlet></router-outlet>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
    .active {
      background-color: rgba(0, 0, 0, 0.04);
    }
  `]
})
export class BackOfficeTemplateComponent {} 