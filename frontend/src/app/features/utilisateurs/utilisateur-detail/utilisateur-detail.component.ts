import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  roles: string[];
  dateCreation: Date;
  dateModification: Date;
}

@Component({
  selector: 'app-utilisateur-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule
  ],
  template: `
    <div class="detail-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ utilisateur?.prenom }} {{ utilisateur?.nom }}</mat-card-title>
          <mat-card-subtitle>{{ utilisateur?.email }}</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div class="roles">
            <h3>Rôles</h3>
            <div class="chips-container">
              <mat-chip *ngFor="let role of utilisateur?.roles" [color]="getRoleColor(role)" selected>
                {{ getRoleLabel(role) }}
              </mat-chip>
            </div>
          </div>

          <mat-divider></mat-divider>

          <div class="dates">
            <div class="date-item">
              <h4>Date de création</h4>
              <p>{{ utilisateur?.dateCreation | date:'dd/MM/yyyy' }}</p>
            </div>
            <div class="date-item">
              <h4>Dernière modification</h4>
              <p>{{ utilisateur?.dateModification | date:'dd/MM/yyyy' }}</p>
            </div>
          </div>
        </mat-card-content>

        <mat-card-actions>
          <button mat-button (click)="retour()">
            <mat-icon>arrow_back</mat-icon>
            Retour
          </button>
          <button mat-raised-button color="primary" (click)="modifier()">
            <mat-icon>edit</mat-icon>
            Modifier
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .detail-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .roles {
      margin: 1rem 0;
    }

    .chips-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .dates {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin: 1rem 0;
    }

    .date-item {
      h4 {
        margin: 0;
        color: #666;
        font-size: 0.9rem;
      }
      p {
        margin: 0.5rem 0;
        font-size: 1.1rem;
      }
    }

    mat-card-actions {
      display: flex;
      justify-content: space-between;
      padding: 1rem;
    }
  `]
})
export class UtilisateurDetailComponent implements OnInit {
  utilisateur: Utilisateur | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.chargerUtilisateur(id);
    }
  }

  private chargerUtilisateur(id: string): void {
    // TODO: Implémenter le chargement des données de l'utilisateur
    // Données de test
    this.utilisateur = {
      id,
      nom: 'Doe',
      prenom: 'John',
      email: 'john.doe@example.com',
      roles: ['ADMIN'],
      dateCreation: new Date(),
      dateModification: new Date()
    };
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'warn';
      case 'USER':
        return 'primary';
      default:
        return '';
    }
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'USER':
        return 'Utilisateur';
      default:
        return role;
    }
  }

  retour(): void {
    this.router.navigate(['/utilisateurs']);
  }

  modifier(): void {
    if (this.utilisateur) {
      this.router.navigate(['/utilisateurs', this.utilisateur.id, 'modifier']);
    }
  }
} 