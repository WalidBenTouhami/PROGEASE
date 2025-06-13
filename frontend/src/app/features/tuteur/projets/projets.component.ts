import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
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
  etudiant: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
  };
}

@Component({
  selector: 'app-projets',
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
    <div class="projets-container">
      <div class="header">
        <h1>Projets des étudiants</h1>
        <div class="actions">
          <mat-form-field>
            <mat-label>Filtrer</mat-label>
            <input matInput (keyup)="applyFilter($event)" placeholder="Ex. Projet de fin d'études" #input>
          </mat-form-field>
        </div>
      </div>

      <div class="table-container mat-elevation-z8">
        <table mat-table [dataSource]="dataSource" matSort>
          <!-- Nom du projet -->
          <ng-container matColumnDef="nom">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Nom du projet</th>
            <td mat-cell *matCellDef="let projet">{{ projet.nom }}</td>
          </ng-container>

          <!-- Étudiant -->
          <ng-container matColumnDef="etudiant">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Étudiant</th>
            <td mat-cell *matCellDef="let projet">
              {{ projet.etudiant.prenom }} {{ projet.etudiant.nom }}
            </td>
          </ng-container>

          <!-- Statut -->
          <ng-container matColumnDef="statut">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Statut</th>
            <td mat-cell *matCellDef="let projet">
              <mat-chip [color]="getStatusColor(projet.statut)" selected>
                {{ getStatusLabel(projet.statut) }}
              </mat-chip>
            </td>
          </ng-container>

          <!-- Progression -->
          <ng-container matColumnDef="progression">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Progression</th>
            <td mat-cell *matCellDef="let projet">
              <div class="progress-cell">
                <mat-progress-bar
                  mode="determinate"
                  [value]="projet.progression"
                  [color]="getProgressColor(projet.progression)">
                </mat-progress-bar>
                <span class="progress-value">{{ projet.progression }}%</span>
              </div>
            </td>
          </ng-container>

          <!-- Date de début -->
          <ng-container matColumnDef="dateDebut">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Date de début</th>
            <td mat-cell *matCellDef="let projet">{{ projet.dateDebut | date:'dd/MM/yyyy' }}</td>
          </ng-container>

          <!-- Date de fin prévue -->
          <ng-container matColumnDef="dateFinPrevue">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Date de fin prévue</th>
            <td mat-cell *matCellDef="let projet">{{ projet.dateFinPrevue | date:'dd/MM/yyyy' }}</td>
          </ng-container>

          <!-- Actions -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let projet">
              <button mat-icon-button [matMenuTriggerFor]="menu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item [routerLink]="['/tuteur/projets', projet.id]">
                  <mat-icon>visibility</mat-icon>
                  <span>Voir détails</span>
                </button>
                <button mat-menu-item [routerLink]="['/tuteur/projets', projet.id, 'modifier']">
                  <mat-icon>edit</mat-icon>
                  <span>Modifier</span>
                </button>
                <button mat-menu-item (click)="supprimer(projet)">
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
            <td class="mat-cell" colspan="7">Aucun projet trouvé "{{ input.value }}"</td>
          </tr>
        </table>

        <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Sélectionner la page des projets"></mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .projets-container {
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h1 {
        margin: 0;
      }
    }

    .actions {
      display: flex;
      gap: 16px;
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

      .progress-value {
        min-width: 48px;
        text-align: right;
      }
    }

    .mat-column-actions {
      width: 48px;
      text-align: center;
    }
  `]
})
export class ProjetsComponent implements OnInit {
  displayedColumns: string[] = ['nom', 'etudiant', 'statut', 'progression', 'dateDebut', 'dateFinPrevue', 'actions'];
  dataSource: MatTableDataSource<Projet>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit(): void {
    this.chargerProjets();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private chargerProjets(): void {
    // TODO: Charger les projets depuis le service
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
        dateModification: new Date('2024-03-15'),
        etudiant: {
          id: 1,
          nom: 'Dupont',
          prenom: 'Jean',
          email: 'jean.dupont@example.com'
        }
      },
      {
        id: 2,
        nom: 'Application mobile',
        description: 'Développement d\'une application mobile',
        statut: 'EN_ATTENTE',
        progression: 30,
        dateDebut: new Date('2024-02-01'),
        dateFinPrevue: new Date('2024-07-15'),
        dateCreation: new Date('2024-02-01'),
        dateModification: new Date('2024-03-15'),
        etudiant: {
          id: 2,
          nom: 'Martin',
          prenom: 'Sophie',
          email: 'sophie.martin@example.com'
        }
      }
    ];
    this.dataSource.data = projets;
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

  supprimer(projet: Projet): void {
    // TODO: Implémenter la suppression
    console.log('Suppression du projet:', projet.id);
  }
} 