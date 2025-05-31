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
    MatProgressSpinnerModule
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
  `]
})
export class LivrableListComponent implements OnInit {
  @Input() projetId!: string;
  livrables: Livrable[] = [];
  chargement = false;
  erreur = '';
  searchTerm = '';
  selectedStatus = '';
  statuts = Object.values(StatutLivrable);

  // Exposer l'énumération pour le template
  StatutLivrable = StatutLivrable;

  get livrablesFiltres() {
    return this.livrables
      .filter(l => !this.searchTerm || l.titre.toLowerCase().includes(this.searchTerm.toLowerCase()))
      .filter(l => !this.selectedStatus || l.statut === this.selectedStatus);
  }

  constructor(private livrableService: LivrableService) {}

  ngOnInit() {
    if (this.projetId) {
      this.chargement = true;
      this.livrableService.getLivrables(this.projetId).subscribe({
        next: (livrables) => {
          this.livrables = livrables;
          this.chargement = false;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des livrables:', err);
          this.erreur = "Erreur lors du chargement des livrables.";
          this.chargement = false;
        }
      });
    }
  }

  // Fonctions utilitaires pour le template
  isEnAttente(statut: StatutLivrable): boolean {
    return statut === StatutLivrable.EN_ATTENTE;
  }

  isSoumis(statut: StatutLivrable): boolean {
    return statut === StatutLivrable.SOUMIS;
  }

  isEnRevision(statut: StatutLivrable): boolean {
    return statut === StatutLivrable.EN_REVISION;
  }

  isValide(statut: StatutLivrable): boolean {
    return statut === StatutLivrable.VALIDE;
  }

  isRejete(statut: StatutLivrable): boolean {
    return statut === StatutLivrable.REJETE;
  }

  // Generic status checker for template
  isStatus(statut: StatutLivrable, status: StatutLivrable): boolean {
    return statut === status;
  }
}
