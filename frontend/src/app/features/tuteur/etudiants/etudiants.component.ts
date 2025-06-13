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

interface Etudiant {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  statut: string;
  projetsEnCours: number;
  derniereActivite: Date;
}

@Component({
  selector: 'app-etudiants',
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
    <div class="etudiants-container">
      <div class="header">
        <h1>Étudiants</h1>
        <div class="actions">
          <mat-form-field>
            <mat-label>Filtrer</mat-label>
            <input matInput (keyup)="applyFilter($event)" placeholder="Ex. Jean Dupont" #input>
          </mat-form-field>
        </div>
      </div>

      <div class="table-container mat-elevation-z8">
        <table mat-table [dataSource]="dataSource" matSort>
          <!-- Nom -->
          <ng-container matColumnDef="nom">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Nom</th>
            <td mat-cell *matCellDef="let etudiant">{{ etudiant.nom }}</td>
          </ng-container>

          <!-- Prénom -->
          <ng-container matColumnDef="prenom">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Prénom</th>
            <td mat-cell *matCellDef="let etudiant">{{ etudiant.prenom }}</td>
          </ng-container>

          <!-- Email -->
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
            <td mat-cell *matCellDef="let etudiant">{{ etudiant.email }}</td>
          </ng-container>

          <!-- Statut -->
          <ng-container matColumnDef="statut">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Statut</th>
            <td mat-cell *matCellDef="let etudiant">
              <mat-chip [color]="getStatusColor(etudiant.statut)" selected>
                {{ getStatusLabel(etudiant.statut) }}
              </mat-chip>
            </td>
          </ng-container>

          <!-- Projets en cours -->
          <ng-container matColumnDef="projetsEnCours">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Projets en cours</th>
            <td mat-cell *matCellDef="let etudiant">
              <div class="projets-cell">
                <span class="projets-count">{{ etudiant.projetsEnCours }}</span>
                <mat-progress-bar
                  mode="determinate"
                  [value]="getProjetsProgress(etudiant.projetsEnCours)"
                  [color]="getProjetsColor(etudiant.projetsEnCours)">
                </mat-progress-bar>
              </div>
            </td>
          </ng-container>

          <!-- Dernière activité -->
          <ng-container matColumnDef="derniereActivite">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Dernière activité</th>
            <td mat-cell *matCellDef="let etudiant">
              {{ etudiant.derniereActivite | date:'dd/MM/yyyy HH:mm' }}
            </td>
          </ng-container>

          <!-- Actions -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let etudiant">
              <button mat-icon-button [matMenuTriggerFor]="menu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item [routerLink]="['/tuteur/etudiants', etudiant.id]">
                  <mat-icon>visibility</mat-icon>
                  <span>Voir détails</span>
                </button>
                <button mat-menu-item [routerLink]="['/tuteur/etudiants', etudiant.id, 'modifier']">
                  <mat-icon>edit</mat-icon>
                  <span>Modifier</span>
                </button>
                <button mat-menu-item [routerLink]="['/tuteur/etudiants', etudiant.id, 'projets']">
                  <mat-icon>assignment</mat-icon>
                  <span>Voir les projets</span>
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

          <!-- Row shown when there is no matching data. -->
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell" colspan="7">Aucun étudiant trouvé "{{ input.value }}"</td>
          </tr>
        </table>

        <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Sélectionner la page des étudiants"></mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .etudiants-container {
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

    .projets-cell {
      display: flex;
      align-items: center;
      gap: 8px;

      .projets-count {
        min-width: 24px;
        text-align: center;
        font-weight: 500;
      }

      mat-progress-bar {
        flex: 1;
        max-width: 100px;
      }
    }

    .mat-column-actions {
      width: 48px;
      text-align: center;
    }
  `]
})
export class EtudiantsComponent implements OnInit {
  displayedColumns: string[] = ['nom', 'prenom', 'email', 'statut', 'projetsEnCours', 'derniereActivite', 'actions'];
  dataSource: MatTableDataSource<Etudiant>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit(): void {
    this.chargerEtudiants();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private chargerEtudiants(): void {
    // TODO: Charger les étudiants depuis le service
    const etudiants: Etudiant[] = [
      {
        id: 1,
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
        statut: 'ACTIF',
        projetsEnCours: 2,
        derniereActivite: new Date('2024-03-15T14:30:00')
      },
      {
        id: 2,
        nom: 'Martin',
        prenom: 'Sophie',
        email: 'sophie.martin@example.com',
        statut: 'ACTIF',
        projetsEnCours: 1,
        derniereActivite: new Date('2024-03-14T16:45:00')
      },
      {
        id: 3,
        nom: 'Dubois',
        prenom: 'Pierre',
        email: 'pierre.dubois@example.com',
        statut: 'INACTIF',
        projetsEnCours: 0,
        derniereActivite: new Date('2024-03-10T09:15:00')
      }
    ];
    this.dataSource.data = etudiants;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getStatusColor(statut: string): string {
    switch (statut) {
      case 'ACTIF':
        return 'accent';
      case 'INACTIF':
        return 'warn';
      default:
        return 'primary';
    }
  }

  getStatusLabel(statut: string): string {
    switch (statut) {
      case 'ACTIF':
        return 'Actif';
      case 'INACTIF':
        return 'Inactif';
      default:
        return statut;
    }
  }

  getProjetsProgress(projetsEnCours: number): number {
    // Supposons que 3 projets est le maximum
    return (projetsEnCours / 3) * 100;
  }

  getProjetsColor(projetsEnCours: number): string {
    if (projetsEnCours === 0) return 'warn';
    if (projetsEnCours >= 2) return 'accent';
    return 'primary';
  }
} 