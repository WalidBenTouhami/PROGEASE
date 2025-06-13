import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

interface Projet {
  id: number;
  nom: string;
  description: string;
  statut: string;
  progression: number;
  dateDebut: Date;
  dateFinPrevue: Date;
}

interface Etudiant {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  statut: string;
  dateInscription: Date;
  derniereActivite: Date;
  projets: Projet[];
}

@Component({
  selector: 'app-etudiant-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatListModule,
    MatProgressBarModule,
    RouterModule
  ],
  template: `
    <div class="detail-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ etudiant?.prenom }} {{ etudiant?.nom }}</mat-card-title>
          <mat-card-subtitle>
            <mat-chip [color]="getStatusColor(etudiant?.statut)" selected>
              {{ getStatusLabel(etudiant?.statut) }}
            </mat-chip>
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <!-- Informations de l'étudiant -->
          <div class="section">
            <h3>Informations</h3>
            <mat-list>
              <mat-list-item>
                <mat-icon matListItemIcon>email</mat-icon>
                <div matListItemTitle>Email</div>
                <div matListItemLine>{{ etudiant?.email }}</div>
              </mat-list-item>
              <mat-list-item>
                <mat-icon matListItemIcon>event</mat-icon>
                <div matListItemTitle>Date d'inscription</div>
                <div matListItemLine>{{ etudiant?.dateInscription | date:'dd/MM/yyyy' }}</div>
              </mat-list-item>
              <mat-list-item>
                <mat-icon matListItemIcon>update</mat-icon>
                <div matListItemTitle>Dernière activité</div>
                <div matListItemLine>{{ etudiant?.derniereActivite | date:'dd/MM/yyyy HH:mm' }}</div>
              </mat-list-item>
            </mat-list>
          </div>

          <mat-divider></mat-divider>

          <!-- Projets -->
          <div class="section">
            <div class="section-header">
              <h3>Projets</h3>
              <button mat-raised-button color="primary" (click)="nouveauProjet()">
                <mat-icon>add</mat-icon>
                Nouveau projet
              </button>
            </div>

            <div class="projets-grid">
              <mat-card *ngFor="let projet of etudiant?.projets" class="projet-card">
                <mat-card-header>
                  <mat-card-title>{{ projet.nom }}</mat-card-title>
                  <mat-card-subtitle>
                    <mat-chip [color]="getProjetStatusColor(projet.statut)" selected>
                      {{ getProjetStatusLabel(projet.statut) }}
                    </mat-chip>
                  </mat-card-subtitle>
                </mat-card-header>

                <mat-card-content>
                  <p class="description">{{ projet.description }}</p>
                  
                  <div class="progress-section">
                    <mat-progress-bar
                      mode="determinate"
                      [value]="projet.progression"
                      [color]="getProjetProgressColor(projet.progression)">
                    </mat-progress-bar>
                    <span class="progress-value">{{ projet.progression }}%</span>
                  </div>

                  <div class="dates">
                    <div class="date-item">
                      <mat-icon>event</mat-icon>
                      <span>Début: {{ projet.dateDebut | date:'dd/MM/yyyy' }}</span>
                    </div>
                    <div class="date-item">
                      <mat-icon>event</mat-icon>
                      <span>Fin prévue: {{ projet.dateFinPrevue | date:'dd/MM/yyyy' }}</span>
                    </div>
                  </div>
                </mat-card-content>

                <mat-card-actions>
                  <button mat-button [routerLink]="['/tuteur/projets', projet.id]">
                    <mat-icon>visibility</mat-icon>
                    Voir détails
                  </button>
                  <button mat-button [routerLink]="['/tuteur/projets', projet.id, 'modifier']">
                    <mat-icon>edit</mat-icon>
                    Modifier
                  </button>
                </mat-card-actions>
              </mat-card>
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
      max-width: 1200px;
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

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .projets-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .projet-card {
      .description {
        margin: 16px 0;
        color: #666;
      }

      .progress-section {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 16px 0;

        mat-progress-bar {
          flex: 1;
        }

        .progress-value {
          min-width: 48px;
          text-align: right;
          font-weight: 500;
        }
      }

      .dates {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin: 16px 0;

        .date-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #666;

          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
          }
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
export class EtudiantDetailComponent implements OnInit {
  etudiant: Etudiant | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const etudiantId = Number(this.route.snapshot.paramMap.get('id'));
    this.chargerEtudiant(etudiantId);
  }

  private chargerEtudiant(id: number): void {
    // TODO: Charger les données de l'étudiant depuis le service
    this.etudiant = {
      id,
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@example.com',
      statut: 'ACTIF',
      dateInscription: new Date('2024-01-15'),
      derniereActivite: new Date('2024-03-15T14:30:00'),
      projets: [
        {
          id: 1,
          nom: 'Projet de fin d\'études',
          description: 'Développement d\'une application web',
          statut: 'EN_COURS',
          progression: 65,
          dateDebut: new Date('2024-01-15'),
          dateFinPrevue: new Date('2024-06-30')
        },
        {
          id: 2,
          nom: 'Application mobile',
          description: 'Développement d\'une application mobile',
          statut: 'EN_ATTENTE',
          progression: 30,
          dateDebut: new Date('2024-02-01'),
          dateFinPrevue: new Date('2024-07-15')
        }
      ]
    };
  }

  getStatusColor(statut: string | undefined): string {
    switch (statut) {
      case 'ACTIF':
        return 'accent';
      case 'INACTIF':
        return 'warn';
      default:
        return 'primary';
    }
  }

  getStatusLabel(statut: string | undefined): string {
    switch (statut) {
      case 'ACTIF':
        return 'Actif';
      case 'INACTIF':
        return 'Inactif';
      default:
        return statut || '';
    }
  }

  getProjetStatusColor(statut: string): string {
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

  getProjetStatusLabel(statut: string): string {
    switch (statut) {
      case 'TERMINE':
        return 'Terminé';
      case 'EN_COURS':
        return 'En cours';
      case 'EN_ATTENTE':
        return 'En attente';
      default:
        return statut;
    }
  }

  getProjetProgressColor(progression: number): string {
    if (progression >= 80) return 'accent';
    if (progression >= 40) return 'primary';
    return 'warn';
  }

  retour(): void {
    this.router.navigate(['/tuteur/etudiants']);
  }

  modifier(): void {
    if (this.etudiant) {
      this.router.navigate(['/tuteur/etudiants', this.etudiant.id, 'modifier']);
    }
  }

  nouveauProjet(): void {
    if (this.etudiant) {
      this.router.navigate(['/tuteur/projets/nouveau'], {
        queryParams: { etudiantId: this.etudiant.id }
      });
    }
  }
} 