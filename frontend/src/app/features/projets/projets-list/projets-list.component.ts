import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

interface Projet {
  id: string;
  nom: string;
  description: string;
  statut: 'EN_COURS' | 'TERMINE' | 'EN_ATTENTE';
  dateCreation: Date;
  dateModification: Date;
}

@Component({
  selector: 'app-projets-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatMenuModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <div class="projets-container">
      <div class="header">
        <h1>Projets</h1>
        <button mat-raised-button color="primary" routerLink="nouveau">
          <mat-icon>add</mat-icon>
          Nouveau projet
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <mat-form-field>
            <mat-label>Filtrer</mat-label>
            <input matInput (keyup)="applyFilter($event)" placeholder="Ex. Projet X" #input>
          </mat-form-field>

          <div class="table-container">
            <table mat-table [dataSource]="dataSource" matSort>
              <!-- Nom -->
              <ng-container matColumnDef="nom">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Nom</th>
                <td mat-cell *matCellDef="let projet">{{projet.nom}}</td>
              </ng-container>

              <!-- Description -->
              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Description</th>
                <td mat-cell *matCellDef="let projet">{{projet.description}}</td>
              </ng-container>

              <!-- Statut -->
              <ng-container matColumnDef="statut">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Statut</th>
                <td mat-cell *matCellDef="let projet">
                  <mat-chip [color]="getStatutColor(projet.statut)" selected>
                    {{getStatutLabel(projet.statut)}}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Date de création -->
              <ng-container matColumnDef="dateCreation">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Date de création</th>
                <td mat-cell *matCellDef="let projet">{{projet.dateCreation | date:'dd/MM/yyyy'}}</td>
              </ng-container>

              <!-- Actions -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let projet">
                  <button mat-icon-button [matMenuTriggerFor]="menu" [matTooltip]="'Actions'">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item [routerLink]="[projet.id]">
                      <mat-icon>visibility</mat-icon>
                      <span>Voir</span>
                    </button>
                    <button mat-menu-item [routerLink]="[projet.id, 'modifier']">
                      <mat-icon>edit</mat-icon>
                      <span>Modifier</span>
                    </button>
                    <button mat-menu-item (click)="deleteProjet(projet)">
                      <mat-icon>delete</mat-icon>
                      <span>Supprimer</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

              <!-- Row shown when there is no matching data. -->
              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell" colspan="5">Aucun projet trouvé</td>
              </tr>
            </table>

            <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Sélectionner la page des projets"></mat-paginator>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .projets-container {
      padding: 2rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    h1 {
      margin: 0;
      color: #333;
    }

    mat-form-field {
      width: 100%;
      margin-bottom: 1rem;
    }

    .table-container {
      overflow: auto;
    }

    table {
      width: 100%;
    }

    .mat-column-actions {
      width: 80px;
      text-align: center;
    }

    .mat-column-statut {
      width: 120px;
    }

    .mat-column-dateCreation {
      width: 150px;
    }
  `]
})
export class ProjetsListComponent implements OnInit {
  displayedColumns: string[] = ['nom', 'description', 'statut', 'dateCreation', 'actions'];
  dataSource: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Projet>;

  constructor() {
    // TODO: Injecter le service de projets
  }

  ngOnInit(): void {
    // TODO: Charger les projets
    this.loadProjets();
  }

  loadProjets(): void {
    // Données de test
    const projets: Projet[] = [
      {
        id: '1',
        nom: 'Projet A',
        description: 'Description du projet A',
        statut: 'EN_COURS',
        dateCreation: new Date(),
        dateModification: new Date()
      },
      {
        id: '2',
        nom: 'Projet B',
        description: 'Description du projet B',
        statut: 'TERMINE',
        dateCreation: new Date(),
        dateModification: new Date()
      }
    ];

    // TODO: Configurer la source de données avec les vrais projets
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getStatutColor(statut: string): string {
    switch (statut) {
      case 'EN_COURS':
        return 'primary';
      case 'TERMINE':
        return 'accent';
      case 'EN_ATTENTE':
        return 'warn';
      default:
        return '';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'EN_COURS':
        return 'En cours';
      case 'TERMINE':
        return 'Terminé';
      case 'EN_ATTENTE':
        return 'En attente';
      default:
        return statut;
    }
  }

  deleteProjet(projet: Projet): void {
    // TODO: Implémenter la suppression
    console.log('Suppression du projet:', projet);
  }
} 