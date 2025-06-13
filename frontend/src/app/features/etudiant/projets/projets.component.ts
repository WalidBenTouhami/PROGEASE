import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';

interface Projet {
  id: number;
  nom: string;
  description: string;
  statut: string;
  progression: number;
  dateDebut: Date;
  dateFinPrevue: Date;
  dateCreation: Date;
  dateModification: Date;
}

@Component({
  selector: 'app-projets-etudiant',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressBarModule,
    RouterModule
  ],
  template: `
    <div class="projects-container">
      <div class="header">
        <h1>Mes projets</h1>
        <button mat-raised-button color="primary" routerLink="nouveau">
          <mat-icon>add</mat-icon>
          Nouveau projet
        </button>
      </div>

      <mat-form-field class="filter-field">
        <mat-label>Filtrer</mat-label>
        <input matInput (keyup)="applyFilter($event)" placeholder="Rechercher un projet..." #input>
      </mat-form-field>

      <div class="table-container mat-elevation-z8">
        <table mat-table [dataSource]="dataSource" matSort>
          <!-- Nom -->
          <ng-container matColumnDef="nom">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Nom</th>
            <td mat-cell *matCellDef="let row">{{ row.nom }}</td>
          </ng-container>

          <!-- Description -->
          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Description</th>
            <td mat-cell *matCellDef="let row">{{ row.description }}</td>
          </ng-container>

          <!-- Statut -->
          <ng-container matColumnDef="statut">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Statut</th>
            <td mat-cell *matCellDef="let row">
              <mat-chip [color]="getStatusColor(row.statut)" selected>
                {{ getStatusLabel(row.statut) }}
              </mat-chip>
            </td>
          </ng-container>

          <!-- Progression -->
          <ng-container matColumnDef="progression">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Progression</th>
            <td mat-cell *matCellDef="let row">
              <div class="progress-cell">
                <mat-progress-bar
                  mode="determinate"
                  [value]="row.progression"
                  [color]="getProgressColor(row.progression)">
                </mat-progress-bar>
                <span>{{ row.progression }}%</span>
              </div>
            </td>
          </ng-container>

          <!-- Date de début -->
          <ng-container matColumnDef="dateDebut">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Date de début</th>
            <td mat-cell *matCellDef="let row">{{ row.dateDebut | date:'dd/MM/yyyy' }}</td>
          </ng-container>

          <!-- Date de fin prévue -->
          <ng-container matColumnDef="dateFinPrevue">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Date de fin prévue</th>
            <td mat-cell *matCellDef="let row">{{ row.dateFinPrevue | date:'dd/MM/yyyy' }}</td>
          </ng-container>

          <!-- Actions -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let row">
              <button mat-icon-button [matMenuTriggerFor]="menu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item [routerLink]="[row.id]">
                  <mat-icon>visibility</mat-icon>
                  <span>Voir les détails</span>
                </button>
                <button mat-menu-item [routerLink]="[row.id, 'modifier']">
                  <mat-icon>edit</mat-icon>
                  <span>Modifier</span>
                </button>
                <button mat-menu-item (click)="supprimerProjet(row)">
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
            <td class="mat-cell" colspan="7">Aucun projet trouvé</td>
          </tr>
        </table>

        <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Sélectionner la page des projets"></mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .projects-container {
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h1 {
        margin: 0;
        color: #333;
      }
    }

    .filter-field {
      width: 100%;
      margin-bottom: 20px;
    }

    .table-container {
      overflow: auto;
    }

    table {
      width: 100%;
    }

    .progress-cell {
      display: flex;
      align-items: center;
      gap: 8px;

      mat-progress-bar {
        flex: 1;
      }

      span {
        min-width: 48px;
        text-align: right;
      }
    }

    .mat-column-actions {
      width: 80px;
      text-align: center;
    }

    .mat-column-progression {
      width: 200px;
    }

    .mat-column-statut {
      width: 120px;
    }

    .mat-column-dateDebut,
    .mat-column-dateFinPrevue {
      width: 150px;
    }
  `]
})
export class ProjetsComponent implements OnInit {
  displayedColumns: string[] = [
    'nom',
    'description',
    'statut',
    'progression',
    'dateDebut',
    'dateFinPrevue',
    'actions'
  ];
  dataSource: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Projet>;

  constructor() {}

  ngOnInit(): void {
    // TODO: Charger les données depuis le service
    this.chargerDonneesTest();
  }

  private chargerDonneesTest(): void {
    const projets: Projet[] = [
      {
        id: 1,
        nom: 'Projet de fin d\'études',
        description: 'Développement d\'une application web',
        statut: 'EN_COURS',
        progression: 65,
        dateDebut: new Date('2024-01-15'),
        dateFinPrevue: new Date('2024-06-30'),
        dateCreation: new Date('2024-01-15'),
        dateModification: new Date('2024-03-15')
      },
      {
        id: 2,
        nom: 'Stage en entreprise',
        description: 'Analyse des besoins utilisateurs',
        statut: 'EN_ATTENTE',
        progression: 30,
        dateDebut: new Date('2024-02-01'),
        dateFinPrevue: new Date('2024-05-15'),
        dateCreation: new Date('2024-02-01'),
        dateModification: new Date('2024-03-14')
      }
    ];

    this.dataSource = new MatTableDataSource(projets);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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

  supprimerProjet(projet: Projet): void {
    // TODO: Implémenter la suppression avec confirmation
    console.log('Suppression du projet:', projet);
  }
} 