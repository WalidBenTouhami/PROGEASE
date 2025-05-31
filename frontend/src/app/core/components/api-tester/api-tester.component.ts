import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiTesterService } from '../../services/api-tester.service';
import { ProjetService } from '../../services/projet.service';
import { LivrableService } from '../../services/livrable.service';
import { AlertService } from '../../services/atert.service';
import { Projet, StatutProjet, CreateProjetInput, UpdateProjetInput } from '../../models/projet.model';
import { Livrable, StatutLivrable, CreateLivrableInput, UpdateLivrableInput } from '../../models/livrable.model';
import { ApiResponse } from '../../models/api.model';

@Component({
  selector: 'app-api-tester',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-4">
      <h2>Testeur d'API</h2>
      
      <!-- Test de connexion -->
      <div class="card mb-4">
        <div class="card-header">Test de Connexion</div>
        <div class="card-body">
          <button (click)="testRestApi()" class="btn btn-primary me-2">Tester REST API</button>
          <button (click)="testGraphQLApi()" class="btn btn-secondary me-2">Tester GraphQL API</button>
        </div>
      </div>

      <!-- Test CRUD Projets -->
      <div class="card mb-4">
        <div class="card-header">Test CRUD Projets</div>
        <div class="card-body">
          <div class="mb-3">
            <button (click)="getAllProjets()" class="btn btn-info me-2">Lister Projets</button>
            <button (click)="createTestProjet()" class="btn btn-success me-2">Créer Projet Test</button>
          </div>
          
          <div *ngIf="selectedProjet" class="mb-3">
            <h5>Projet sélectionné: {{selectedProjet.titre}}</h5>
            <button (click)="updateSelectedProjet()" class="btn btn-warning me-2">Mettre à jour</button>
            <button (click)="deleteSelectedProjet()" class="btn btn-danger me-2">Supprimer</button>
          </div>

          <div *ngIf="projets.length > 0">
            <h5>Liste des projets:</h5>
            <ul class="list-group">
              <li *ngFor="let projet of projets" 
                  class="list-group-item"
                  (click)="selectProjet(projet)"
                  [class.active]="selectedProjet?.id === projet.id">
                {{projet.titre}} - {{projet.statut}}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Test CRUD Livrables -->
      <div class="card mb-4">
        <div class="card-header">Test CRUD Livrables</div>
        <div class="card-body">
          <div class="mb-3">
            <button (click)="getAllLivrables()" class="btn btn-info me-2">Lister Livrables</button>
            <button (click)="createTestLivrable()" 
                    class="btn btn-success me-2"
                    [disabled]="!selectedProjet">Créer Livrable Test</button>
          </div>

          <div *ngIf="selectedLivrable" class="mb-3">
            <h5>Livrable sélectionné: {{selectedLivrable.titre}}</h5>
            <button (click)="updateSelectedLivrable()" class="btn btn-warning me-2">Mettre à jour</button>
            <button (click)="deleteSelectedLivrable()" class="btn btn-danger me-2">Supprimer</button>
          </div>

          <div *ngIf="livrables.length > 0">
            <h5>Liste des livrables:</h5>
            <ul class="list-group">
              <li *ngFor="let livrable of livrables" 
                  class="list-group-item"
                  (click)="selectLivrable(livrable)"
                  [class.active]="selectedLivrable?.id === livrable.id">
                {{livrable.titre}} - {{livrable.statut}}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card { margin-bottom: 20px; }
    .list-group-item { cursor: pointer; }
    .list-group-item:hover { background-color: #f8f9fa; }
    .list-group-item.active:hover { background-color: #0d6efd; }
  `]
})
export class ApiTesterComponent implements OnInit {
  projets: Projet[] = [];
  livrables: Livrable[] = [];
  selectedProjet: Projet | null = null;
  selectedLivrable: Livrable | null = null;

  constructor(
    private apiTesterService: ApiTesterService,
    private projetService: ProjetService,
    private livrableService: LivrableService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.getAllProjets();
  }

  testRestApi() {
    this.apiTesterService.testRestConnection().subscribe({
      next: () => this.alertService.success('Connexion REST API réussie'),
      error: (error: Error) => this.alertService.error('Erreur connexion REST API')
    });
  }

  testGraphQLApi() {
    this.apiTesterService.testGraphQLConnection().subscribe({
      next: () => this.alertService.success('Connexion GraphQL API réussie'),
      error: (error: Error) => this.alertService.error('Erreur connexion GraphQL API')
    });
  }

  // CRUD Projets
  getAllProjets() {
    this.projetService.getProjets().subscribe({
      next: (response: ApiResponse<Projet[]>) => {
        if (response.success && response.data) {
          this.projets = response.data;
          this.alertService.success('Projets récupérés avec succès');
        } else {
          this.alertService.error('Erreur lors de la récupération des projets');
        }
      },
      error: (error: Error) => this.alertService.error('Erreur lors de la récupération des projets')
    });
  }

  createTestProjet() {
    const newProjet: CreateProjetInput = {
      titre: 'Projet Test ' + new Date().toISOString(),
      description: 'Description du projet test',
      statut: StatutProjet.EN_COURS,
      dateDebut: new Date().toISOString(),
      dateFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 jours
      responsableId: 'test-user-id', // You'll need to provide a valid user ID
      membres: [],
      competences: [],
      livrables: []
    };

    this.projetService.createProjet(newProjet).subscribe({
      next: (response: ApiResponse<Projet>) => {
        if (response.success) {
          this.alertService.success('Projet créé avec succès');
          this.getAllProjets();
        } else {
          this.alertService.error('Erreur lors de la création du projet');
        }
      },
      error: (error: Error) => this.alertService.error('Erreur lors de la création du projet')
    });
  }

  selectProjet(projet: Projet) {
    this.selectedProjet = projet;
    if (projet.id) {
      this.getLivrablesForProject(projet.id);
    }
  }

  updateSelectedProjet() {
    if (!this.selectedProjet?.id) return;
    
    const updatedProjet: UpdateProjetInput = {
      titre: this.selectedProjet.titre + ' (Modifié)',
      dateModification: new Date().toISOString()
    };

    this.projetService.updateProjet(this.selectedProjet.id, updatedProjet).subscribe({
      next: (response: ApiResponse<Projet>) => {
        if (response.success) {
          this.alertService.success('Projet mis à jour avec succès');
          this.getAllProjets();
        } else {
          this.alertService.error('Erreur lors de la mise à jour du projet');
        }
      },
      error: (error: Error) => this.alertService.error('Erreur lors de la mise à jour du projet')
    });
  }

  deleteSelectedProjet() {
    if (!this.selectedProjet?.id) return;

    this.projetService.deleteProjet(this.selectedProjet.id).subscribe({
      next: (response: ApiResponse<string>) => {
        if (response.success) {
          this.alertService.success('Projet supprimé avec succès');
          this.selectedProjet = null;
          this.getAllProjets();
        } else {
          this.alertService.error('Erreur lors de la suppression du projet');
        }
      },
      error: (error: Error) => this.alertService.error('Erreur lors de la suppression du projet')
    });
  }

  // CRUD Livrables
  getAllLivrables() {
    this.livrableService.getLivrables().subscribe({
      next: (response: ApiResponse<Livrable[]>) => {
        if (response.success && response.data) {
          this.livrables = response.data;
          this.alertService.success('Livrables récupérés avec succès');
        } else {
          this.alertService.error('Erreur lors de la récupération des livrables');
        }
      },
      error: (error: Error) => this.alertService.error('Erreur lors de la récupération des livrables')
    });
  }

  getLivrablesForProject(projetId: string) {
    this.livrableService.getLivrablesByProjet(projetId).subscribe({
      next: (response: ApiResponse<Livrable[]>) => {
        if (response.success && response.data) {
          this.livrables = response.data;
          this.alertService.success('Livrables du projet récupérés avec succès');
        } else {
          this.alertService.error('Erreur lors de la récupération des livrables du projet');
        }
      },
      error: (error: Error) => this.alertService.error('Erreur lors de la récupération des livrables du projet')
    });
  }

  createTestLivrable() {
    if (!this.selectedProjet?.id) return;

    const newLivrable: CreateLivrableInput = {
      titre: 'Livrable Test ' + new Date().toISOString(),
      intitule: 'Livrable Test ' + new Date().toISOString(),
      description: 'Description du livrable test',
      statut: StatutLivrable.EN_COURS,
      projetId: this.selectedProjet.id,
      dateLimite: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // +15 jours
    };

    this.livrableService.createLivrable(newLivrable).subscribe({
      next: (response: ApiResponse<Livrable>) => {
        if (response.success) {
          this.alertService.success('Livrable créé avec succès');
          this.getLivrablesForProject(this.selectedProjet!.id!);
        } else {
          this.alertService.error('Erreur lors de la création du livrable');
        }
      },
      error: (error: Error) => this.alertService.error('Erreur lors de la création du livrable')
    });
  }

  selectLivrable(livrable: Livrable) {
    this.selectedLivrable = livrable;
  }

  updateSelectedLivrable() {
    if (!this.selectedLivrable?.id) return;
    
    const updatedLivrable: UpdateLivrableInput = {
      titre: this.selectedLivrable.titre,
      intitule: this.selectedLivrable.intitule + ' (Modifié)',
      dateModification: new Date().toISOString()
    };

    this.livrableService.updateLivrable(this.selectedLivrable.id, updatedLivrable).subscribe({
      next: (response: ApiResponse<Livrable>) => {
        if (response.success) {
          this.alertService.success('Livrable mis à jour avec succès');
          if (this.selectedProjet?.id) {
            this.getLivrablesForProject(this.selectedProjet.id);
          }
        } else {
          this.alertService.error('Erreur lors de la mise à jour du livrable');
        }
      },
      error: (error: Error) => this.alertService.error('Erreur lors de la mise à jour du livrable')
    });
  }

  deleteSelectedLivrable() {
    if (!this.selectedLivrable?.id) return;

    this.livrableService.deleteLivrable(this.selectedLivrable.id).subscribe({
      next: (response: ApiResponse<boolean>) => {
        if (response.success) {
          this.alertService.success('Livrable supprimé avec succès');
          this.selectedLivrable = null;
          if (this.selectedProjet?.id) {
            this.getLivrablesForProject(this.selectedProjet.id);
          }
        } else {
          this.alertService.error('Erreur lors de la suppression du livrable');
        }
      },
      error: (error: Error) => this.alertService.error('Erreur lors de la suppression du livrable')
    });
  }
} 