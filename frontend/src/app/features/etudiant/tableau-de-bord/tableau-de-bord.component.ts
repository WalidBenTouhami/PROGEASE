import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule } from '@angular/router';

interface Projet {
  id: number;
  nom: string;
  description: string;
  statut: string;
  progression: number;
  dateEcheance: Date;
}

interface Ressource {
  id: number;
  titre: string;
  type: string;
  dateAjout: Date;
}

interface Message {
  id: number;
  expediteur: string;
  sujet: string;
  date: Date;
  lu: boolean;
}

@Component({
  selector: 'app-tableau-de-bord-etudiant',
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

      <!-- Projets en cours -->
      <section class="dashboard-section">
        <h2>Mes projets</h2>
        <div class="projects-grid">
          <mat-card *ngFor="let projet of projets" class="project-card">
            <mat-card-header>
              <mat-card-title>{{ projet.nom }}</mat-card-title>
              <mat-card-subtitle>{{ projet.description }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
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
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary" [routerLink]="['/etudiant/projets', projet.id]">
                Voir les détails
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </section>

      <!-- Ressources récentes -->
      <section class="dashboard-section">
        <h2>Ressources récentes</h2>
        <div class="resources-list">
          <mat-card *ngFor="let ressource of ressources" class="resource-card">
            <mat-card-content>
              <div class="resource-info">
                <mat-icon>{{ getResourceIcon(ressource.type) }}</mat-icon>
                <div class="resource-details">
                  <h3>{{ ressource.titre }}</h3>
                  <span>{{ ressource.type }}</span>
                </div>
                <span class="date">{{ ressource.dateAjout | date:'dd/MM/yyyy' }}</span>
              </div>
            </mat-card-content>
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

    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .project-card {
      height: 100%;
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
      margin-top: 16px;
    }

    .deadline {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #666;
      font-size: 14px;
    }

    .resources-list, .messages-list {
      display: grid;
      gap: 16px;
    }

    .resource-card, .message-card {
      .resource-info, .message-info {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .resource-details, .message-header {
        flex: 1;

        h3 {
          margin: 0;
          font-size: 16px;
        }

        span {
          color: #666;
          font-size: 14px;
        }
      }

      .date {
        color: #666;
        font-size: 14px;
      }
    }

    .message-card.unread {
      background-color: #f5f5f5;
    }
  `]
})
export class TableauDeBordComponent implements OnInit {
  projets: Projet[] = [];
  ressources: Ressource[] = [];
  messages: Message[] = [];

  constructor() {}

  ngOnInit(): void {
    // TODO: Charger les données depuis le service
    this.chargerDonneesTest();
  }

  private chargerDonneesTest(): void {
    this.projets = [
      {
        id: 1,
        nom: 'Projet de fin d\'études',
        description: 'Développement d\'une application web',
        statut: 'EN_COURS',
        progression: 65,
        dateEcheance: new Date('2024-06-30')
      },
      {
        id: 2,
        nom: 'Stage en entreprise',
        description: 'Analyse des besoins utilisateurs',
        statut: 'EN_ATTENTE',
        progression: 30,
        dateEcheance: new Date('2024-05-15')
      }
    ];

    this.ressources = [
      {
        id: 1,
        titre: 'Guide de développement Angular',
        type: 'DOCUMENT',
        dateAjout: new Date('2024-03-15')
      },
      {
        id: 2,
        titre: 'Vidéo tutoriel TypeScript',
        type: 'VIDEO',
        dateAjout: new Date('2024-03-14')
      }
    ];

    this.messages = [
      {
        id: 1,
        expediteur: 'Jean Dupont',
        sujet: 'Feedback sur le projet',
        date: new Date('2024-03-15'),
        lu: false
      },
      {
        id: 2,
        expediteur: 'Marie Martin',
        sujet: 'Rappel de réunion',
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

  getResourceIcon(type: string): string {
    switch (type) {
      case 'DOCUMENT':
        return 'description';
      case 'VIDEO':
        return 'videocam';
      case 'LINK':
        return 'link';
      default:
        return 'insert_drive_file';
    }
  }
} 