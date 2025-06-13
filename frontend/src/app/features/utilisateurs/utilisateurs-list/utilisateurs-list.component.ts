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

interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  roles: string[];
  dateCreation: Date;
  dateModification: Date;
}

@Component({
  selector: 'app-utilisateurs-list',
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
    <div class="utilisateurs-container">
      <div class="header">
        <h1>Utilisateurs</h1>
        <button mat-raised-button color="primary" routerLink="nouveau">
          <mat-icon>add</mat-icon>
          Nouvel utilisateur
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <mat-form-field>
            <mat-label>Filtrer</mat-label>
            <input matInput (keyup)="applyFilter($event)" placeholder="Ex. John Doe" #input>
          </mat-form-field>

          <div class="table-container">
            <table mat-table [dataSource]="dataSource" matSort>
              <!-- Nom -->
              <ng-container matColumnDef="nom">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Nom</th>
                <td mat-cell *matCellDef="let utilisateur">{{utilisateur.nom}}</td>
              </ng-container>

              <!-- Prénom -->
              <ng-container matColumnDef="prenom">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Prénom</th>
                <td mat-cell *matCellDef="let utilisateur">{{utilisateur.prenom}}</td>
              </ng-container>

              <!-- Email -->
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
                <td mat-cell *matCellDef="let utilisateur">{{utilisateur.email}}</td>
              </ng-container>

              <!-- Rôles -->
              <ng-container matColumnDef="roles">
                <th mat-header-cell *matHeaderCellDef>Rôles</th>
                <td mat-cell *matCellDef="let utilisateur">
                  <mat-chip *ngFor="let role of utilisateur.roles" [color]="getRoleColor(role)" selected>
                    {{getRoleLabel(role)}}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Date de création -->
              <ng-container matColumnDef="dateCreation">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Date de création</th>
                <td mat-cell *matCellDef="let utilisateur">{{utilisateur.dateCreation | date:'dd/MM/yyyy'}}</td>
              </ng-container>

              <!-- Actions -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let utilisateur">
                  <button mat-icon-button [matMenuTriggerFor]="menu" [matTooltip]="'Actions'">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item [routerLink]="[utilisateur.id]">
                      <mat-icon>visibility</mat-icon>
                      <span>Voir</span>
                    </button>
                    <button mat-menu-item [routerLink]="[utilisateur.id, 'modifier']">
                      <mat-icon>edit</mat-icon>
                      <span>Modifier</span>
                    </button>
                    <button mat-menu-item (click)="deleteUtilisateur(utilisateur)">
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
                <td class="mat-cell" colspan="6">Aucun utilisateur trouvé</td>
              </tr>
            </table>

            <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Sélectionner la page des utilisateurs"></mat-paginator>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .utilisateurs-container {
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

    .mat-column-roles {
      width: 200px;
    }

    .mat-column-dateCreation {
      width: 150px;
    }

    mat-chip {
      margin: 2px;
    }
  `]
})
export class UtilisateursListComponent implements OnInit {
  displayedColumns: string[] = ['nom', 'prenom', 'email', 'roles', 'dateCreation', 'actions'];
  dataSource: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Utilisateur>;

  constructor() {
    // TODO: Injecter le service d'utilisateurs
  }

  ngOnInit(): void {
    // TODO: Charger les utilisateurs
    this.loadUtilisateurs();
  }

  loadUtilisateurs(): void {
    // Données de test
    const utilisateurs: Utilisateur[] = [
      {
        id: '1',
        nom: 'Doe',
        prenom: 'John',
        email: 'john.doe@example.com',
        roles: ['ADMIN'],
        dateCreation: new Date(),
        dateModification: new Date()
      },
      {
        id: '2',
        nom: 'Smith',
        prenom: 'Jane',
        email: 'jane.smith@example.com',
        roles: ['USER'],
        dateCreation: new Date(),
        dateModification: new Date()
      }
    ];

    // TODO: Configurer la source de données avec les vrais utilisateurs
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'warn';
      case 'USER':
        return 'primary';
      default:
        return '';
    }
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'USER':
        return 'Utilisateur';
      default:
        return role;
    }
  }

  deleteUtilisateur(utilisateur: Utilisateur): void {
    // TODO: Implémenter la suppression
    console.log('Suppression de l\'utilisateur:', utilisateur);
  }
} 