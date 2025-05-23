//src/app/app.component.ts

import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `
    <!-- Main Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <a class="navbar-brand" routerLink="/">PROGEASE</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/projects" routerLinkActive="active">Projets</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/deliverables" routerLinkActive="active">Livrables</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/evaluations" routerLinkActive="active">Évaluations</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="container py-4">
      <router-outlet></router-outlet>
    </main>

    <!-- Footer -->
    <footer class="footer mt-auto py-3 bg-light">
      <div class="container text-center">
        <span class="text-muted">© 2024 PROGEASE. Tous droits réservés.</span>
      </div>
    </footer>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    main {
      flex: 1;
    }
  `]
})
export class AppComponent {
  title = 'PROGEASE';
}
