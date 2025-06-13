import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule } from '@angular/router';

interface Etudiant {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  projetsEnCours: number;
  derniereActivite: Date;
}

interface Projet {
  id: number;
  nom: string;
  etudiant: string;
  statut: string;
  progression: number;
  dateEcheance: Date;
  derniereModification: Date;
}

interface Message {
  id: number;
  expediteur: string;
  sujet: string;
  date: Date;
  lu: boolean;
}

@Component({
  selector: 'app-tableau-de-bord-tuteur',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatChipsModule,
    RouterModule
  ],
  template: `
    <div class="dashboard-container">
      <h1>Tableau de bord</h1>

      <!-- Vue d'ensemble -->
      <section class="dashboard-section">
        <div class="overview-grid">
          <mat-card class="overview-card">
            <mat-card-content>
              <div class="overview-item">
                <mat-icon>people</mat-icon>
                <div class="overview-details">
                  <h3>{{ etudiants.length }}</h3>
                  <span>Étudiants</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="overview-card">
            <mat-card-content>
              <div class="overview-item">
                <mat-icon>assignment</mat-icon>
                <div class="overview-details">
                  <h3>{{ projets.length }}</h3>
                  <span>Projets</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="overview-card">
            <mat-card-content>
              <div class="overview-item">
                <mat-icon>message</mat-icon>
                <div class="overview-details">
                  <h3>{{ messagesNonLus }}</h3>
                  <span>Messages non lus</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </section>

      <!-- Étudiants récents -->
      <section class="dashboard-section">
        <h2>Étudiants récents</h2>
        <div class="students-grid">
          <mat-card *ngFor="let etudiant of etudiants" class="student-card">
            <mat-card-content>
              <div class="student-info">
                <div class="student-header">
                  <h3>{{ etudiant.prenom }} {{ etudiant.nom }}</h3>
                  <span class="email">{{ etudiant.email }}</span>
                </div>
                <div class="student-details">
                  <span class="projects">
                    <mat-icon>assignment</mat-icon>
                    {{ etudiant.projetsEnCours }} projets en cours
                  </span>
                  <span class="last-activity">
                    <mat-icon>access_time</mat-icon>
                    Dernière activité: {{ etudiant.derniereActivite | date:'dd/MM/yyyy' }}
                  </span>
                </div>
              </div>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary" [routerLink]="['/tuteur/etudiants', etudiant.id]">
                Voir le profil
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </section>

      <!-- Projets en cours -->
      <section class="dashboard-section">
        <h2>Projets en cours</h2>
        <div class="projects-list">
          <mat-card *ngFor="let projet of projets" class="project-card">
            <mat-card-content>
              <div class="project-info">
                <div class="project-header">
                  <h3>{{ projet.nom }}</h3>
                  <span class="student">{{ projet.etudiant }}</span>
                </div>
                <div class="progress-section">
                  <span>Progression</span>
                  <mat-progress-bar
                    mode="determinate"
                    [value]="projet.progression"
                    [color]="getProgressColor(projet.progression)">
                  </mat-progress-bar>
                  <span>{{ projet.progression }}%</span>
                </div>
                <div class="project-details">
                  <mat-chip [color]="getStatusColor(projet.statut)" selected>
                    {{ getStatusLabel(projet.statut) }}
                  </mat-chip>
                  <span class="deadline">
                    <mat-icon>event</mat-icon>
                    Échéance: {{ projet.dateEcheance | date:'dd/MM/yyyy' }}
                  </span>
                </div>
                <div class="last-update">
                  <mat-icon>update</mat-icon>
                  Dernière modification: {{ projet.derniereModification | date:'dd/MM/yyyy' }}
                </div>
              </div>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary" [routerLink]="['/tuteur/projets', projet.id]">
                Voir les détails
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </section>

      <!-- Messages récents -->
      <section class="dashboard-section">
        <h2>Messages récents</h2>
        <div class="messages-list">
          <mat-card *ngFor="let message of messages" class="message-card" [class.unread]="!message.lu">
            <mat-card-content>
              <div class="message-info">
                <div class="message-header">
                  <h3>{{ message.sujet }}</h3>
                  <span class="date">{{ message.date | date:'dd/MM/yyyy' }}</span>
                </div>
                <p>De: {{ message.expediteur }}</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
    }

    h1 {
      margin-bottom: 24px;
      color: #333;
    }

    .dashboard-section {
      margin-bottom: 32px;
    }

    h2 {
      margin-bottom: 16px;
      color: #666;
    }

    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .overview-card {
      .overview-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;

        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
          color: #666;
        }

        .overview-details {
          h3 {
            margin: 0;
            font-size: 24px;
            color: #333;
          }

          span {
            color: #666;
            font-size: 14px;
          }
        }
      }
    }

    .students-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .student-card {
      .student-info {
        .student-header {
          margin-bottom: 16px;

          h3 {
            margin: 0;
            font-size: 18px;
            color: #333;
          }

          .email {
            color: #666;
            font-size: 14px;
          }
        }

        .student-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
          color: #666;
          font-size: 14px;

          span {
            display: flex;
            align-items: center;
            gap: 8px;

            mat-icon {
              font-size: 16px;
              width: 16px;
              height: 16px;
            }
          }
        }
      }
    }

    .projects-list {
      display: grid;
      gap: 16px;
    }

    .project-card {
      .project-info {
        .project-header {
          margin-bottom: 16px;

          h3 {
            margin: 0;
            font-size: 18px;
            color: #333;
          }

          .student {
            color: #666;
            font-size: 14px;
          }
        }

        .progress-section {
          margin: 16px 0;
          display: flex;
          align-items: center;
          gap: 8px;

          mat-progress-bar {
            flex: 1;
          }
        }

        .project-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 16px 0;
        }

        .deadline, .last-update {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #666;
          font-size: 14px;

          mat-icon {
            font-size: 16px;
            width: 16px;
            height: 16px;
          }
        }
      }
    }

    .messages-list {
      display: grid;
      gap: 16px;
    }

    .message-card {
      &.unread {
        background-color: #f5f5f5;
      }

      .message-info {
        .message-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          h3 {
            margin: 0;
            font-size: 16px;
            color: #333;
          }

          .date {
            color: #666;
            font-size: 14px;
          }
        }

        p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }
      }
    }
  `]
})
export class TableauDeBordComponent implements OnInit {
  etudiants: Etudiant[] = [];
  projets: Projet[] = [];
  messages: Message[] = [];

  get messagesNonLus(): number {
    return this.messages.filter(m => !m.lu).length;
  }

  constructor() {}

  ngOnInit(): void {
    // TODO: Charger les données depuis le service
    this.chargerDonneesTest();
  }

  private chargerDonneesTest(): void {
    this.etudiants = [
      {
        id: 1,
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
        projetsEnCours: 2,
        derniereActivite: new Date('2024-03-15')
      },
      {
        id: 2,
        nom: 'Martin',
        prenom: 'Marie',
        email: 'marie.martin@example.com',
        projetsEnCours: 1,
        derniereActivite: new Date('2024-03-14')
      }
    ];

    this.projets = [
      {
        id: 1,
        nom: 'Projet de fin d\'études',
        etudiant: 'Jean Dupont',
        statut: 'EN_COURS',
        progression: 65,
        dateEcheance: new Date('2024-06-30'),
        derniereModification: new Date('2024-03-15')
      },
      {
        id: 2,
        nom: 'Stage en entreprise',
        etudiant: 'Marie Martin',
        statut: 'EN_ATTENTE',
        progression: 30,
        dateEcheance: new Date('2024-05-15'),
        derniereModification: new Date('2024-03-14')
      }
    ];

    this.messages = [
      {
        id: 1,
        expediteur: 'Jean Dupont',
        sujet: 'Question sur le projet',
        date: new Date('2024-03-15'),
        lu: false
      },
      {
        id: 2,
        expediteur: 'Marie Martin',
        sujet: 'Rapport de progression',
        date: new Date('2024-03-14'),
        lu: true
      }
    ];
  }

  getProgressColor(progression: number): string {
    if (progression >= 80) return 'accent';
    if (progression >= 40) return 'primary';
    return 'warn';
  }

  getStatusColor(statut: string): string {
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

  getStatusLabel(statut: string): string {
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
} 