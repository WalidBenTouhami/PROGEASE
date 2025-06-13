import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

interface Projet {
  id: string;
  nom: string;
  description: string;
  statut: string;
  dateDebut: Date;
  dateFinPrevue: Date | null;
  dateCreation: Date;
  dateModification: Date;
}

@Component({
  selector: 'app-projet-detail',
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
          <mat-card-title>{{ projet?.nom }}</mat-card-title>
          <mat-card-subtitle>
            <mat-chip [color]="getStatutColor(projet?.statut)" selected>
              {{ getStatutLabel(projet?.statut) }}
            </mat-chip>
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div class="description">
            <h3>Description</h3>
            <p>{{ projet?.description || 'Aucune description' }}</p>
          </div>

          <mat-divider></mat-divider>

          <div class="dates">
            <div class="date-item">
              <h4>Date de début</h4>
              <p>{{ projet?.dateDebut | date:'dd/MM/yyyy' }}</p>
            </div>
            <div class="date-item">
              <h4>Date de fin prévue</h4>
              <p>{{ projet?.dateFinPrevue | date:'dd/MM/yyyy' || 'Non définie' }}</p>
            </div>
            <div class="date-item">
              <h4>Date de création</h4>
              <p>{{ projet?.dateCreation | date:'dd/MM/yyyy' }}</p>
            </div>
            <div class="date-item">
              <h4>Dernière modification</h4>
              <p>{{ projet?.dateModification | date:'dd/MM/yyyy' }}</p>
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

    .description {
      margin: 1rem 0;
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
export class ProjetDetailComponent implements OnInit {
  projet: Projet | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.chargerProjet(id);
    }
  }

  private chargerProjet(id: string): void {
    // TODO: Implémenter le chargement des données du projet
    // Données de test
    this.projet = {
      id,
      nom: 'Projet Test',
      description: 'Description du projet test',
      statut: 'EN_COURS',
      dateDebut: new Date(),
      dateFinPrevue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      dateCreation: new Date(),
      dateModification: new Date()
    };
  }

  getStatutColor(statut: string | undefined): string {
    switch (statut) {
      case 'EN_COURS':
        return 'primary';
      case 'TERMINE':
        return 'accent';
      case 'EN_ATTENTE':
        return 'warn';
      default:
        return '';
    }
  }

  getStatutLabel(statut: string | undefined): string {
    switch (statut) {
      case 'EN_COURS':
        return 'En cours';
      case 'TERMINE':
        return 'Terminé';
      case 'EN_ATTENTE':
        return 'En attente';
      default:
        return statut || '';
    }
  }

  retour(): void {
    this.router.navigate(['/projets']);
  }

  modifier(): void {
    if (this.projet) {
      this.router.navigate(['/projets', this.projet.id, 'modifier']);
    }
  }
} 