import { Component, OnInit } from '@angular/core';
import { ProjectService, Project } from '../../core/services/project.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="projects-container">
      <h2>Projets</h2>
      <div class="projects-list">
        @for (project of projects; track project.id) {
          <div class="project-card" (click)="viewProject(project.id)">
            <div class="project-header">
              <h3>{{ project.title }}</h3>
              <span class="status-badge" [class]="project.status.toLowerCase()">
                {{ getStatusLabel(project.status) }}
              </span>
            </div>
            
            <p class="description">{{ project.description }}</p>
            
            <div class="project-stats">
              <div class="stat">
                <span class="label">Progression</span>
                <div class="progress-bar">
                  <div class="progress" [style.width.%]="project.progression"></div>
                </div>
                <span class="value">{{ project.progression }}%</span>
              </div>
              
              <div class="stat">
                <span class="label">Score moyen</span>
                <span class="value">{{ project.averageScore }}/20</span>
              </div>
              
              <div class="stat">
                <span class="label">Performance prédite</span>
                <span class="value">{{ project.predictedPerformance }}/20</span>
              </div>
            </div>

            <div class="project-team">
              <div class="team-section">
                <h4>Équipe</h4>
                <div class="members">
                  @for (member of project.team; track member.id) {
                    <span class="member">{{ member.prenom }} {{ member.nom }}</span>
                  }
                </div>
              </div>
              
              @if (project.tutor) {
                <div class="tutor-section">
                  <h4>Tuteur</h4>
                  <span class="tutor">{{ project.tutor.prenom }} {{ project.tutor.nom }}</span>
                </div>
              }
            </div>

            <div class="project-footer">
              <div class="skills">
                @for (skill of project.skills; track skill) {
                  <span class="skill-tag">{{ skill }}</span>
                }
              </div>
              <div class="dates">
                <span>{{ project.startDate | date:'dd/MM/yyyy' }} - {{ project.endDate | date:'dd/MM/yyyy' }}</span>
              </div>
            </div>
          </div>
        } @empty {
          <p>Aucun projet trouvé.</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .projects-container {
      padding: 20px;
    }

    .projects-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .project-card {
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      background: white;
    }

    .project-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .project-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    h3 {
      margin: 0;
      color: #333;
      font-size: 1.25rem;
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

    .description {
      color: #666;
      margin-bottom: 15px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .project-stats {
      margin-bottom: 15px;
    }

    .stat {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }

    .label {
      width: 140px;
      color: #666;
      font-size: 0.875rem;
    }

    .value {
      font-weight: 500;
      color: #333;
    }

    .progress-bar {
      flex: 1;
      height: 6px;
      background-color: #eee;
      border-radius: 3px;
      margin: 0 10px;
    }

    .progress {
      height: 100%;
      background-color: #2196f3;
      border-radius: 3px;
    }

    .project-team {
      margin-bottom: 15px;
      padding: 10px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .team-section, .tutor-section {
      margin-bottom: 10px;
    }

    h4 {
      margin: 0 0 5px 0;
      font-size: 0.875rem;
      color: #666;
    }

    .members {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .member, .tutor {
      font-size: 0.875rem;
      color: #333;
    }

    .project-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #eee;
    }

    .skills {
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

    .dates {
      font-size: 0.875rem;
      color: #666;
    }
  `]
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];

  constructor(
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.projects = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des projets:', error);
      }
    });
  }

  viewProject(id: string): void {
    this.router.navigate(['/projets', id]);
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
} 