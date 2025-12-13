import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SchedulingService, Rappel, Evenement } from '../../../core/services/scheduling.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-scheduling',
  templateUrl: './scheduling.component.html',
  styleUrls: ['./scheduling.component.css']
})
export class SchedulingComponent implements OnInit {
  projetId: string = '';
  rappels: Rappel[] = [];
  evenements: Evenement[] = [];
  conflits: any[] = [];
  loading = false;
  statistiques: any = {};

  // Options de configuration
  frequence: string = 'HEBDOMADAIRE';
  typeEvenement: string = 'REUNION';

  frequenceOptions = [
    { value: 'QUOTIDIEN', label: 'Quotidien' },
    { value: 'HEBDOMADAIRE', label: 'Hebdomadaire' },
    { value: 'BIHEBDOMADAIRE', label: 'Bihebdomadaire' },
    { value: 'MENSUEL', label: 'Mensuel' }
  ];

  typeOptions = [
    { value: 'REUNION', label: 'Réunion' },
    { value: 'REVUE', label: 'Revue' },
    { value: 'SOUTENANCE', label: 'Soutenance' }
  ];

  constructor(
    private schedulingService: SchedulingService,
    private notificationService: NotificationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['projetId']) {
        this.projetId = params['projetId'];
        this.chargerPlanningComplet();
      }
    });
  }

  chargerPlanningComplet(): void {
    if (!this.projetId) {
      this.notificationService.error('ID du projet manquant');
      return;
    }

    this.loading = true;
    this.schedulingService.genererPlanningComplet(this.projetId, { frequence: this.frequence })
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.rappels = response.data.rappels || [];
            this.evenements = response.data.evenements || [];
            this.conflits = response.data.conflits || [];
            this.statistiques = response.data.statistiques || {};
            this.notificationService.success('Planning chargé avec succès');
          }
          this.loading = false;
        },
        error: (error) => {
          this.notificationService.error('Erreur lors du chargement du planning: ' + error.message);
          this.loading = false;
        }
      });
  }

  genererRappels(): void {
    if (!this.projetId) return;

    this.loading = true;
    this.schedulingService.genererRappels(this.projetId).subscribe({
      next: (response) => {
        if (response.success) {
          this.rappels = response.data.rappels;
          this.notificationService.success(`${this.rappels.length} rappels générés`);
        }
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error('Erreur: ' + error.message);
        this.loading = false;
      }
    });
  }

  planifierEvenements(): void {
    if (!this.projetId) return;

    this.loading = true;
    this.schedulingService.planifierEvenements(this.projetId, {
      type: this.typeEvenement,
      frequence: this.frequence
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.evenements = response.data.evenements;
          this.notificationService.success(`${this.evenements.length} événements planifiés`);
        }
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error('Erreur: ' + error.message);
        this.loading = false;
      }
    });
  }

  detecterConflits(): void {
    if (this.evenements.length < 2) {
      this.notificationService.warning('Au moins 2 événements sont nécessaires pour détecter les conflits');
      return;
    }

    this.loading = true;
    this.schedulingService.detecterConflits(this.evenements).subscribe({
      next: (response) => {
        if (response.success) {
          this.conflits = response.data.conflits;
          if (this.conflits.length === 0) {
            this.notificationService.success('Aucun conflit détecté');
          } else {
            this.notificationService.warning(`${this.conflits.length} conflit(s) détecté(s)`);
          }
        }
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error('Erreur: ' + error.message);
        this.loading = false;
      }
    });
  }

  envoyerNotifications(): void {
    if (this.rappels.length === 0) {
      this.notificationService.warning('Aucun rappel à envoyer');
      return;
    }

    this.loading = true;
    this.schedulingService.envoyerNotifications(this.rappels).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.success(response.data.message);
        }
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error('Erreur: ' + error.message);
        this.loading = false;
      }
    });
  }

  getPrioriteClass(priorite: string): string {
    switch (priorite) {
      case 'URGENTE':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'HAUTE':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MOYENNE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  }

  getGraviteClass(gravite: string): string {
    switch (gravite) {
      case 'HAUTE':
        return 'bg-red-100 text-red-800';
      case 'MOYENNE':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  exporterPlanning(): void {
    const planning = {
      projetId: this.projetId,
      dateExport: new Date().toISOString(),
      rappels: this.rappels,
      evenements: this.evenements,
      conflits: this.conflits,
      statistiques: this.statistiques
    };

    const dataStr = JSON.stringify(planning, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'planning_' + this.projetId + '_' + new Date().toISOString() + '.json';
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
