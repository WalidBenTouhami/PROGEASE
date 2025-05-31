import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-5">
      <div class="text-center">
        <h1 class="display-4">Bienvenue sur PROGEASE</h1>
        <p class="lead">Votre plateforme de gestion de projets et d'évaluation</p>
        <hr class="my-4">
        <p>Commencez par explorer vos projets ou consultez vos évaluations.</p>
        <div class="mt-4">
          <a routerLink="/projects" class="btn btn-primary mx-2">Voir les projets</a>
          <a routerLink="/evaluations" class="btn btn-secondary mx-2">Voir les évaluations</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      margin-top: 2rem;
    }
  `]
})
export class WelcomeComponent {} 