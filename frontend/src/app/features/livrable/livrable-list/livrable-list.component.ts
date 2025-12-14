import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Livrable, StatutLivrable } from '../../../core/models/livrable.model';
import { LivrableService } from '../../../core/services/livrable.service';
import { ApiResponse } from '../../../core/models/api.model';

@Component({
  selector: 'app-livrable-list',
  template: `
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Liste des Livrables</h2>
      
      <div class="mat-elevation-z8">
        <table mat-table [dataSource]="dataSource" matSort>
          <ng-container matColumnDef="titre">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Titre</th>
            <td mat-cell *matCellDef="let livrable">{{livrable.titre}}</td>
          </ng-container>

          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>Description</th>
            <td mat-cell *matCellDef="let livrable">{{livrable.description}}</td>
          </ng-container>

          <ng-container matColumnDef="dateEcheance">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Date d'échéance</th>
            <td mat-cell *matCellDef="let livrable">{{livrable.dateEcheance | date:'dd/MM/yyyy'}}</td>
          </ng-container>

          <ng-container matColumnDef="statut">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Statut</th>
            <td mat-cell *matCellDef="let livrable">
              <mat-chip [ngClass]="{
                'bg-yellow-100': livrable.statut === 'EN_COURS',
                'bg-green-100': livrable.statut === 'TERMINE',
                'bg-red-100': livrable.statut === 'EN_RETARD',
                'bg-gray-100': livrable.statut === 'EN_ATTENTE'
              }">
                {{livrable.statut}}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let livrable">
              <button mat-icon-button color="primary" [routerLink]="['/livrables', livrable.id]">
                <mat-icon>visibility</mat-icon>
              </button>
              <button mat-icon-button color="accent" [routerLink]="['/livrables', livrable.id, 'edit']">
                <mat-icon>edit</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Select page of livrables"></mat-paginator>
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
export class LivrableListComponent implements OnInit {
  displayedColumns: string[] = ['titre', 'description', 'dateEcheance', 'statut', 'actions'];
  dataSource: MatTableDataSource<Livrable>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private livrableService: LivrableService) {
    this.dataSource = new MatTableDataSource<Livrable>();
  }

  ngOnInit() {
    this.loadLivrables();
  }

  loadLivrables() {
    this.livrableService.getLivrables().subscribe({
      next: (livrables: Livrable[]) => {
        this.dataSource.data = livrables;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (err) => {
        console.error('Error loading livrables:', err);
      }
    });
  }
}
