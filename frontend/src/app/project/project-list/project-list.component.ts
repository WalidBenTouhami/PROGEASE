//src/app/project/project-list/project-list.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProjectService, Project } from '../../core/services/project.service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50/50">
      <div class="max-w-[1400px] mx-auto px-4 py-8">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-2xl font-semibold text-gray-900">Projets</h1>
          <button class="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            + Nouveau Projet
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (project of projects; track project.id) {
            <div class="group bg-white rounded-xl border border-gray-200 transition-all duration-300 hover:border-gray-400">
              <div class="p-6 flex flex-col h-full">
                <!-- Header -->
                <div class="flex justify-between items-start gap-4 mb-4">
                  <div class="min-w-0 flex-1">
                    <h3 class="text-lg font-medium text-gray-900 truncate mb-1">
                      {{ project.title }}
                    </h3>
                    <span [class]="getStatusClass(project.status)"
                          class="inline-flex text-xs font-medium rounded-full px-2 py-0.5">
                      {{ getStatusLabel(project.status) }}
                    </span>
                  </div>
                  <button (click)="evaluateProject(project.id)" 
                          class="shrink-0 text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors">
                    Évaluer
                  </button>
                </div>

                <!-- Description -->
                <p class="text-sm text-gray-600 mb-6 line-clamp-2">{{ project.description }}</p>

                <!-- Progress and Stats -->
                <div class="mb-6 space-y-4">
                  <!-- Progress Bar -->
                  <div class="space-y-1.5">
                    <div class="flex items-center justify-between text-sm">
                      <span class="font-medium text-gray-900">Progression</span>
                      <span class="font-medium text-gray-900">{{ project.progression }}%</span>
                    </div>
                    <div class="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div class="h-full bg-gray-900 rounded-full transition-all"
                           [style.width.%]="project.progression"></div>
                    </div>
                  </div>

                  <!-- Scores -->
                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                      <span class="text-xs text-gray-500">Score actuel</span>
                      <p class="text-sm font-semibold text-gray-900">{{ project.averageScore }}/20</p>
                    </div>
                    <div class="space-y-1">
                      <span class="text-xs text-gray-500">Score prévu</span>
                      <p class="text-sm font-semibold text-gray-900">{{ project.predictedPerformance }}/20</p>
                    </div>
                  </div>
                </div>

                <!-- Team Members -->
                <div class="mb-6">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-medium text-gray-700">Équipe</span>
                    @if (project.tutor) {
                      <span class="text-xs text-gray-500">
                        Tuteur: <span class="font-medium text-gray-700">{{ project.tutor.prenom }} {{ project.tutor.nom }}</span>
                      </span>
                    }
                  </div>
                  <div class="flex flex-wrap gap-1">
                    @for (member of project.team; track member.id) {
                      <span class="inline-flex text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700 rounded-md">
                        {{ member.prenom }} {{ member.nom }}
                      </span>
                    }
                  </div>
                </div>

                <!-- Skills -->
                <div class="flex flex-wrap gap-1 mb-6">
                  @for (skill of project.skills; track skill) {
                    <span class="inline-flex text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                      {{ skill }}
                    </span>
                  }
                </div>

                <!-- Footer -->
                <div class="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                  <span class="text-xs text-gray-500">
                    {{ project.startDate | date:'dd/MM/yyyy' }} - {{ project.endDate | date:'dd/MM/yyyy' }}
                  </span>
                  <button (click)="viewProject(project.id)" 
                          class="text-sm font-medium text-gray-900 hover:underline">
                    Voir détails
                  </button>
                </div>
              </div>
            </div>
          } @empty {
            <div class="col-span-full flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
              <p class="text-base text-gray-600 mb-1">Aucun projet trouvé</p>
              <p class="text-sm text-gray-500">Commencez par créer un nouveau projet</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class ProjectListComponent implements OnInit {
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
    this.router.navigate(['/projects', id]);
  }

  evaluateProject(id: string): void {
    this.router.navigate(['/evaluations/new'], { queryParams: { projectId: id } });
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

  getStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'DRAFT': 'bg-gray-100 text-gray-700',
      'IN_PROGRESS': 'bg-blue-50 text-blue-700',
      'COMPLETED': 'bg-green-50 text-green-700',
      'ARCHIVED': 'bg-yellow-50 text-yellow-700'
    };
    return classMap[status] || 'bg-gray-100 text-gray-700';
  }
}
