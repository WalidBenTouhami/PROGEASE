import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-rapports',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="container mx-auto p-6">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>assessment</mat-icon>
            Rapports
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Cette section permet de consulter et générer des rapports.</p>
          <p class="text-gray-500 mt-4">Fonctionnalité en cours de développement.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    mat-card-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  `]
})
export class RapportsComponent {}
