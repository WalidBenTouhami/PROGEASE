import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiTesterService } from '../../services/api-tester.service';
import { ProjetService } from '../../services/projet.service';
import { LivrableService } from '../../services/livrable.service';
import { AlertService } from '../../services/atert.service';
import { Projet, StatutProjet } from '../../models/projet.model';
import { Livrable, StatutLivrable } from '../../models/livrable.model';

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
                  [class.active]="selectedProjet?._id === projet._id">
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
            <h5>Livrable sélectionné: {{selectedLivrable.intitule}}</h5>
            <button (click)="updateSelectedLivrable()" class="btn btn-warning me-2">Mettre à jour</button>
            <button (click)="deleteSelectedLivrable()" class="btn btn-danger me-2">Supprimer</button>
          </div>

          <div *ngIf="livrables.length > 0">
            <h5>Liste des livrables:</h5>
            <ul class="list-group">
              <li *ngFor="let livrable of livrables" 
                  class="list-group-item"
                  (click)="selectLivrable(livrable)"
                  [class.active]="selectedLivrable?._id === livrable._id">
                {{livrable.intitule}} - {{livrable.statut}}
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
      next: (response) => this.alertService.success('Connexion REST API réussie'),
      error: (error) => this.alertService.error('Erreur connexion REST API')
    });
  }

  testGraphQLApi() {
    this.apiTesterService.testGraphQLConnection().subscribe({
      next: (response) => this.alertService.success('Connexion GraphQL API réussie'),
      error: (error) => this.alertService.error('Erreur connexion GraphQL API')
    });
  }

  // CRUD Projets
  getAllProjets() {
    this.projetService.getAllProjets().subscribe({
      next: (projets) => {
        this.projets = projets;
        this.alertService.success('Projets récupérés avec succès');
      },
      error: (error) => this.alertService.error('Erreur lors de la récupération des projets')
    });
  }

  createTestProjet() {
    const newProjet: Projet = {
      titre: 'Projet Test ' + new Date().toISOString(),
      description: 'Description du projet test',
      statut: StatutProjet.EN_COURS,
      dateDebut: new Date(),
      dateFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours
      equipe: [],
      competences: [],
      livrables: []
    };

    this.projetService.createProjet(newProjet).subscribe({
      next: (projet) => {
        this.alertService.success('Projet créé avec succès');
        this.getAllProjets();
      },
      error: (error) => this.alertService.error('Erreur lors de la création du projet')
    });
  }

  selectProjet(projet: Projet) {
    this.selectedProjet = projet;
    if (projet._id) {
      this.getLivrablesForProject(projet._id);
    }
  }

  updateSelectedProjet() {
    if (!this.selectedProjet?._id) return;
    
    const updatedProjet = {
      ...this.selectedProjet,
      titre: this.selectedProjet.titre + ' (Modifié)',
      majLe: new Date()
    };

    this.projetService.updateProjet(this.selectedProjet._id, updatedProjet).subscribe({
      next: (projet) => {
        this.alertService.success('Projet mis à jour avec succès');
        this.getAllProjets();
      },
      error: (error) => this.alertService.error('Erreur lors de la mise à jour du projet')
    });
  }

  deleteSelectedProjet() {
    if (!this.selectedProjet?._id) return;

    this.projetService.deleteProjet(this.selectedProjet._id).subscribe({
      next: () => {
        this.alertService.success('Projet supprimé avec succès');
        this.selectedProjet = null;
        this.getAllProjets();
      },
      error: (error) => this.alertService.error('Erreur lors de la suppression du projet')
    });
  }

  // CRUD Livrables
  getAllLivrables() {
    this.livrableService.getAllLivrables().subscribe({
      next: (livrables) => {
        this.livrables = livrables;
        this.alertService.success('Livrables récupérés avec succès');
      },
      error: (error) => this.alertService.error('Erreur lors de la récupération des livrables')
    });
  }

  getLivrablesForProject(projetId: string) {
    this.livrableService.getLivrablesForProject(projetId).subscribe({
      next: (livrables) => {
        this.livrables = livrables;
        this.alertService.success('Livrables du projet récupérés avec succès');
      },
      error: (error) => this.alertService.error('Erreur lors de la récupération des livrables du projet')
    });
  }

  createTestLivrable() {
    if (!this.selectedProjet?._id) return;

    const newLivrable: Livrable = {
      intitule: 'Livrable Test ' + new Date().toISOString(),
      description: 'Description du livrable test',
      statut: StatutLivrable.EN_COURS,
      projetId: this.selectedProjet._id,
      dateLimite: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // +15 jours
    };

    this.livrableService.createLivrable(newLivrable).subscribe({
      next: (livrable) => {
        this.alertService.success('Livrable créé avec succès');
        this.getLivrablesForProject(this.selectedProjet!._id!);
      },
      error: (error) => this.alertService.error('Erreur lors de la création du livrable')
    });
  }

  selectLivrable(livrable: Livrable) {
    this.selectedLivrable = livrable;
  }

  updateSelectedLivrable() {
    if (!this.selectedLivrable?._id) return;
    
    const updatedLivrable = {
      ...this.selectedLivrable,
      intitule: this.selectedLivrable.intitule + ' (Modifié)',
      majLe: new Date()
    };

    this.livrableService.updateLivrable(this.selectedLivrable._id, updatedLivrable).subscribe({
      next: (livrable) => {
        this.alertService.success('Livrable mis à jour avec succès');
        if (this.selectedProjet?._id) {
          this.getLivrablesForProject(this.selectedProjet._id);
        }
      },
      error: (error) => this.alertService.error('Erreur lors de la mise à jour du livrable')
    });
  }

  deleteSelectedLivrable() {
    if (!this.selectedLivrable?._id) return;

    this.livrableService.deleteLivrable(this.selectedLivrable._id).subscribe({
      next: () => {
        this.alertService.success('Livrable supprimé avec succès');
        this.selectedLivrable = null;
        if (this.selectedProjet?._id) {
          this.getLivrablesForProject(this.selectedProjet._id);
        }
      },
      error: (error) => this.alertService.error('Erreur lors de la suppression du livrable')
    });
  }
} 