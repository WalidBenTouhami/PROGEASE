import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

interface Projet {
  id: number;
  nom: string;
  description: string;
  statut: string;
  progression: number;
  dateDebut: Date;
  dateFinPrevue: Date;
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
    MatProgressBarModule,
    MatDividerModule,
    RouterModule
  ],
  template: `
    <div class="detail-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ projet?.nom }}</mat-card-title>
          <mat-card-subtitle>
            <mat-chip [color]="getStatusColor(projet?.statut)" selected>
              {{ getStatusLabel(projet?.statut) }}
            </mat-chip>
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <!-- Description -->
          <div class="section">
            <h3>Description</h3>
            <p>{{ projet?.description }}</p>
          </div>

          <mat-divider></mat-divider>

          <!-- Progression -->
          <div class="section">
            <h3>Progression</h3>
            <div class="progress-section">
              <mat-progress-bar
                mode="determinate"
                [value]="projet?.progression"
                [color]="getProgressColor(projet?.progression)">
              </mat-progress-bar>
              <span class="progress-value">{{ projet?.progression }}%</span>
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- Dates -->
          <div class="section">
            <h3>Dates</h3>
            <div class="dates-grid">
              <div class="date-item">
                <mat-icon>event</mat-icon>
                <div class="date-info">
                  <span class="label">Date de début</span>
                  <span class="value">{{ projet?.dateDebut | date:'dd/MM/yyyy' }}</span>
                </div>
              </div>
              <div class="date-item">
                <mat-icon>event</mat-icon>
                <div class="date-info">
                  <span class="label">Date de fin prévue</span>
                  <span class="value">{{ projet?.dateFinPrevue | date:'dd/MM/yyyy' }}</span>
                </div>
              </div>
              <div class="date-item">
                <mat-icon>create</mat-icon>
                <div class="date-info">
                  <span class="label">Créé le</span>
                  <span class="value">{{ projet?.dateCreation | date:'dd/MM/yyyy' }}</span>
                </div>
              </div>
              <div class="date-item">
                <mat-icon>update</mat-icon>
                <div class="date-info">
                  <span class="label">Modifié le</span>
                  <span class="value">{{ projet?.dateModification | date:'dd/MM/yyyy' }}</span>
                </div>
              </div>
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
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .section {
      margin: 20px 0;

      h3 {
        margin: 0 0 16px 0;
        color: #666;
        font-size: 18px;
      }
    }

    .progress-section {
      display: flex;
      align-items: center;
      gap: 16px;

      mat-progress-bar {
        flex: 1;
      }

      .progress-value {
        min-width: 48px;
        text-align: right;
        font-weight: 500;
      }
    }

    .dates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .date-item {
      display: flex;
      align-items: center;
      gap: 12px;

      mat-icon {
        color: #666;
      }

      .date-info {
        display: flex;
        flex-direction: column;

        .label {
          color: #666;
          font-size: 14px;
        }

        .value {
          font-weight: 500;
        }
      }
    }

    mat-card-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      padding: 16px;
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
    const projetId = Number(this.route.snapshot.paramMap.get('id'));
    this.chargerProjet(projetId);
  }

  private chargerProjet(id: number): void {
    // TODO: Charger les données du projet depuis le service
    this.projet = {
      id,
      nom: 'Projet de fin d\'études',
      description: 'Développement d\'une application web',
      statut: 'EN_COURS',
      progression: 65,
      dateDebut: new Date('2024-01-15'),
      dateFinPrevue: new Date('2024-06-30'),
      dateCreation: new Date('2024-01-15'),
      dateModification: new Date('2024-03-15')
    };
  }

  getProgressColor(progression: number | undefined): string {
    if (!progression) return 'primary';
    if (progression >= 80) return 'accent';
    if (progression >= 40) return 'primary';
    return 'warn';
  }

  getStatusColor(statut: string | undefined): string {
    switch (statut) {
      case 'TERMINE':
        return 'accent';
      case 'EN_COURS':
        return 'primary';
      case 'EN_ATTENTE':
        return 'warn';
      default:
        return 'primary';
    }
  }

  getStatusLabel(statut: string | undefined): string {
    switch (statut) {
      case 'TERMINE':
        return 'Terminé';
      case 'EN_COURS':
        return 'En cours';
      case 'EN_ATTENTE':
        return 'En attente';
      default:
        return statut || '';
    }
  }

  retour(): void {
    this.router.navigate(['/etudiant/projets']);
  }

  modifier(): void {
    if (this.projet) {
      this.router.navigate(['/etudiant/projets', this.projet.id, 'modifier']);
    }
  }
} 