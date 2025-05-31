import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Livrable, StatutLivrable } from '../../../core/models/livrable.model';
import { LivrableService } from '../../../core/services/livrable.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { AlertService } from '../../../core/services/atert.service';
import { MatDialog } from '@angular/material/dialog';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'app-livrable-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatSelectModule,
    MatButtonModule,
    RouterModule,
    MatListModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatMenuModule
  ],
  templateUrl: './livrable-list.component.html',
  styles: [`
    :host {
      display: block;
      padding: 20px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
    }

    .loading-message {
      margin-top: 10px;
      color: rgba(0, 0, 0, 0.54);
    }

    .error-card {
      margin: 20px 0;
      background-color: #ffebee;
    }

    .error-message {
      color: #c62828;
      margin: 0;
    }

    .empty-card {
      margin: 20px 0;
      background-color: #f5f5f5;
    }

    .empty-message {
      color: rgba(0, 0, 0, 0.54);
      margin: 0;
    }

    mat-list-item {
      margin-bottom: 8px;
    }

    .stat-badge {
      margin-left: 8px;
    }

    a {
      color: #1976d2;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }

    .filters {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    mat-form-field {
      flex: 1;
    }

    mat-chip-set {
      display: inline-flex;
    }

    .ms-3 {
      margin-left: 12px;
    }

    .mb-4 {
      margin-bottom: 16px;
    }

    .mb-3 {
      margin-bottom: 12px;
    }
  `]
})
export class LivrableListComponent implements OnInit {
  @Input() projetId!: string;
  livrables: Livrable[] = [];
  filteredLivrables: Livrable[] = [];
  chargement = false;
  erreur = '';
  searchTerm = '';
  selectedStatus: StatutLivrable | null = null;
  statutOptions = [
    StatutLivrable.EN_COURS,
    StatutLivrable.TERMINE,
    StatutLivrable.EN_ATTENTE,
    StatutLivrable.SOUMIS
  ];

  constructor(
    private livrableService: LivrableService,
    private alertService: AlertService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    if (this.projetId) {
      this.loadLivrablesForProject();
    } else {
      this.loadLivrables();
    }
  }

  loadLivrables() {
    this.chargement = true;
    this.livrableService.getLivrables().subscribe({
      next: (livrables) => {
        this.livrables = livrables;
        this.filterLivrables();
        this.chargement = false;
      },
      error: (error) => {
        this.alertService.error('Erreur lors du chargement des livrables');
        console.error('Error loading livrables:', error);
        this.erreur = "Erreur lors du chargement des livrables.";
        this.chargement = false;
      }
    });
  }

  loadLivrablesForProject() {
    this.chargement = true;
    this.livrableService.getLivrablesByProjet(this.projetId).subscribe({
      next: (livrables) => {
        this.livrables = livrables;
        this.filterLivrables();
        this.chargement = false;
      },
      error: (error) => {
        this.alertService.error('Erreur lors du chargement des livrables');
        console.error('Error loading livrables:', error);
        this.erreur = "Erreur lors du chargement des livrables.";
        this.chargement = false;
      }
    });
  }

  filterLivrables() {
    this.filteredLivrables = this.livrables
      .filter(l => !this.searchTerm || l.titre.toLowerCase().includes(this.searchTerm.toLowerCase()))
      .filter(l => !this.selectedStatus || l.statut === this.selectedStatus);
  }

  getStatusColor(status: StatutLivrable): ThemePalette {
    switch (status) {
      case StatutLivrable.EN_COURS:
        return 'primary';
      case StatutLivrable.TERMINE:
        return 'accent';
      case StatutLivrable.SOUMIS:
        return 'warn';
      default:
        return undefined;
    }
  }

  openCreateDialog() {
    // TODO: Implement create dialog
  }

  openEditDialog(livrable: Livrable) {
    // TODO: Implement edit dialog
  }

  deleteLivrable(livrable: Livrable) {
    if (!livrable.id) return;

    if (confirm('Êtes-vous sûr de vouloir supprimer ce livrable ?')) {
      this.livrableService.deleteLivrable(livrable.id).subscribe({
        next: () => {
          this.alertService.success('Livrable supprimé avec succès');
          if (this.projetId) {
            this.loadLivrablesForProject();
          } else {
            this.loadLivrables();
          }
        },
        error: (error) => {
          this.alertService.error('Erreur lors de la suppression du livrable');
          console.error('Error deleting livrable:', error);
        }
      });
    }
  }
}
