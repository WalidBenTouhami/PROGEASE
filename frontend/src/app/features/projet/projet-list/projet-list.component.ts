import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Projet, StatutProjet } from '../../../core/models/projet.model';
import { ProjetService } from '../../../core/services/projet.service';
import { ApiResponse } from '../../../core/models/api.model';

@Component({
  selector: 'app-projet-list',
  template: `
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Liste des Projets</h2>
      
      <div class="mat-elevation-z8">
        <table mat-table [dataSource]="dataSource" matSort>
          <ng-container matColumnDef="nom">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Nom</th>
            <td mat-cell *matCellDef="let projet">{{projet.nom}}</td>
          </ng-container>

          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>Description</th>
            <td mat-cell *matCellDef="let projet">{{projet.description}}</td>
          </ng-container>

          <ng-container matColumnDef="dateDebut">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Date de début</th>
            <td mat-cell *matCellDef="let projet">{{projet.dateDebut | date:'dd/MM/yyyy'}}</td>
          </ng-container>

          <ng-container matColumnDef="dateFin">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Date de fin</th>
            <td mat-cell *matCellDef="let projet">{{projet.dateFin | date:'dd/MM/yyyy'}}</td>
          </ng-container>

          <ng-container matColumnDef="statut">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Statut</th>
            <td mat-cell *matCellDef="let projet">
              <mat-chip [ngClass]="{
                'bg-yellow-100': projet.statut === 'EN_COURS',
                'bg-green-100': projet.statut === 'TERMINE',
                'bg-red-100': projet.statut === 'ANNULE',
                'bg-gray-100': projet.statut === 'EN_ATTENTE'
              }">
                {{projet.statut}}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let projet">
              <button mat-icon-button color="primary" [routerLink]="['/projets', projet.id]">
                <mat-icon>visibility</mat-icon>
              </button>
              <button mat-icon-button color="accent" [routerLink]="['/projets', projet.id, 'edit']">
                <mat-icon>edit</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Select page of projets"></mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .mat-mdc-row:hover {
      background-color: #f5f5f5;
    }
    .mat-column-actions {
      width: 120px;
      text-align: center;
    }
    .mat-mdc-chip {
      min-height: 24px;
      padding: 4px 8px;
    }
  `]
})
export class ProjetListComponent implements OnInit {
  displayedColumns: string[] = ['nom', 'description', 'dateDebut', 'dateFin', 'statut', 'actions'];
  dataSource: MatTableDataSource<Projet>;
  projets: Projet[] = [];
  projetsFiltres: Projet[] = [];
  erreur = '';
  chargement = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private projetService: ProjetService) {
    this.dataSource = new MatTableDataSource<Projet>();
  }

  ngOnInit() {
    this.loadProjets();
  }

  loadProjets() {
    this.chargement = true;
    this.projetService.getProjets().subscribe({
      next: (projets: Projet[]) => {
        this.projets = projets;
        this.projetsFiltres = projets;
        this.dataSource.data = projets;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.chargement = false;
      },
      error: (err) => {
        this.erreur = 'Une erreur est survenue lors du chargement des projets.';
        this.chargement = false;
        console.error('Error loading projets:', err);
      }
    });
  }

  filtrerProjets(term: string): void {
    if (!term) {
      this.projetsFiltres = this.projets;
    } else {
      this.projetsFiltres = this.projets.filter(p =>
        (p.titre || p.nom || '').toLowerCase().includes(term.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(term.toLowerCase())
      );
    }
    this.dataSource.data = this.projetsFiltres;
  }
}
