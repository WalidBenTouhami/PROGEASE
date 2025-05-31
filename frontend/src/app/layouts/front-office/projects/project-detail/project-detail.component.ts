import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectService, Project } from '../../../core/services/project.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="project-detail">
      @if (project) {
        <div class="project-header">
          <h2>{{ project.title }}</h2>
          <span class="status-badge" [class]="project.status.toLowerCase()">
            {{ getStatusLabel(project.status) }}
          </span>
        </div>

        <div class="project-content">
          <div class="main-info">
            <div class="description-section">
              <h3>Description</h3>
              <p>{{ project.description }}</p>
            </div>

            <div class="stats-section">
              <h3>Statistiques</h3>
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-label">Progression</span>
                  <div class="progress-bar">
                    <div class="progress" [style.width.%]="project.progression"></div>
                  </div>
                  <span class="stat-value">{{ project.progression }}%</span>
                </div>

                <div class="stat-item">
                  <span class="stat-label">Score moyen</span>
                  <span class="stat-value">{{ project.averageScore }}/20</span>
                </div>

                <div class="stat-item">
                  <span class="stat-label">Performance prédite</span>
                  <span class="stat-value">{{ project.predictedPerformance }}/20</span>
                </div>
              </div>
            </div>

            <div class="deliverables-section">
              <h3>Livrables</h3>
              <div class="deliverables-grid">
                @for (deliverable of project.deliverables; track deliverable.id) {
                  <div class="deliverable-card">
                    <div class="deliverable-header">
                      <h4>{{ deliverable.name }}</h4>
                      <span class="status-badge" [class]="deliverable.status.toLowerCase()">
                        {{ getDeliverableStatusLabel(deliverable.status) }}
                      </span>
                    </div>
                    <p>{{ deliverable.description }}</p>
                    <div class="deliverable-footer">
                      <span class="deadline">Échéance: {{ deliverable.deadline | date:'dd/MM/yyyy' }}</span>
                      @if (deliverable.repositoryUrl) {
                        <a [href]="deliverable.repositoryUrl" target="_blank" class="repo-link">
                          Voir le dépôt
                        </a>
                      }
                    </div>
                  </div>
                } @empty {
                  <p>Aucun livrable défini.</p>
                }
              </div>
            </div>
          </div>

          <div class="side-info">
            <div class="team-section">
              <h3>Équipe</h3>
              <div class="team-members">
                @for (member of project.team; track member.id) {
                  <div class="member-card">
                    <span>{{ member.prenom }} {{ member.nom }}</span>
                  </div>
                }
              </div>
            </div>

            @if (project.tutor) {
              <div class="tutor-section">
                <h3>Tuteur</h3>
                <div class="tutor-card">
                  <span>{{ project.tutor.prenom }} {{ project.tutor.nom }}</span>
                </div>
              </div>
            }

            <div class="skills-section">
              <h3>Compétences</h3>
              <div class="skills-list">
                @for (skill of project.skills; track skill) {
                  <span class="skill-tag">{{ skill }}</span>
                }
              </div>
            </div>

            <div class="dates-section">
              <h3>Dates</h3>
              <div class="date-item">
                <span class="date-label">Début:</span>
                <span class="date-value">{{ project.startDate | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="date-item">
                <span class="date-label">Fin:</span>
                <span class="date-value">{{ project.endDate | date:'dd/MM/yyyy' }}</span>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <p>Chargement du projet...</p>
      }
    </div>
  `,
  styles: [`
    .project-detail {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .project-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    h2 {
      margin: 0;
      color: #333;
      font-size: 2rem;
    }

    .project-content {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 30px;
    }

    .main-info {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }

    .side-info {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    h3 {
      color: #333;
      margin: 0 0 15px 0;
      font-size: 1.25rem;
    }

    .description-section p {
      color: #666;
      line-height: 1.6;
    }

    .stats-grid {
      display: grid;
      gap: 15px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .stat-label {
      width: 140px;
      color: #666;
    }

    .stat-value {
      font-weight: 500;
      color: #333;
    }

    .progress-bar {
      flex: 1;
      height: 8px;
      background-color: #eee;
      border-radius: 4px;
    }

    .progress {
      height: 100%;
      background-color: #2196f3;
      border-radius: 4px;
    }

    .deliverables-grid {
      display: grid;
      gap: 20px;
    }

    .deliverable-card {
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: white;
    }

    .deliverable-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .deliverable-header h4 {
      margin: 0;
      color: #333;
    }

    .deliverable-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 10px;
      font-size: 0.875rem;
    }

    .deadline {
      color: #666;
    }

    .repo-link {
      color: #2196f3;
      text-decoration: none;
    }

    .repo-link:hover {
      text-decoration: underline;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .draft {
      background-color: #e0e0e0;
      color: #616161;
    }

    .in_progress {
      background-color: #bbdefb;
      color: #1976d2;
    }

    .completed {
      background-color: #c8e6c9;
      color: #388e3c;
    }

    .archived {
      background-color: #ffecb3;
      color: #ffa000;
    }

    .pending {
      background-color: #fff3e0;
      color: #e65100;
    }

    .late {
      background-color: #ffebee;
      color: #c62828;
    }

    .team-section, .tutor-section, .skills-section, .dates-section {
      padding: 15px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
    }

    .team-members {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .member-card, .tutor-card {
      padding: 10px;
      background-color: #f5f5f5;
      border-radius: 4px;
      font-size: 0.875rem;
      color: #333;
    }

    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .skill-tag {
      padding: 4px 8px;
      background-color: #e3f2fd;
      color: #1976d2;
      border-radius: 4px;
      font-size: 0.75rem;
    }

    .date-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 0.875rem;
    }

    .date-label {
      color: #666;
    }

    .date-value {
      color: #333;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .project-content {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProjectDetailComponent implements OnInit {
  project: Project | null = null;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadProject(id);
      }
    });
  }

  private loadProject(id: string): void {
    this.projectService.getProject(id).subscribe({
      next: (data) => {
        this.project = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du projet:', error);
      }
    });
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'DRAFT': 'Brouillon',
      'IN_PROGRESS': 'En cours',
      'COMPLETED': 'Terminé',
      'ARCHIVED': 'Archivé'
    };
    return statusMap[status] || status;
  }

  getDeliverableStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'En attente',
      'IN_PROGRESS': 'En cours',
      'COMPLETED': 'Terminé',
      'LATE': 'En retard'
    };
    return statusMap[status] || status;
  }
} 