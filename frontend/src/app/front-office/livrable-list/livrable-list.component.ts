import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Livrable, StatutLivrable } from '../../core/models/livrable.model';
import { LivrableService } from '../../core/services/livrable.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

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
    RouterModule
  ],
  templateUrl: './livrable-list.component.html',
  styleUrl: './livrable-list.component.css'
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
      .filter(l => !this.searchTerm || l.intitule.toLowerCase().includes(this.searchTerm.toLowerCase()))
      .filter(l => !this.selectedStatus || l.statut === this.selectedStatus);
  }

  constructor(private livrableService: LivrableService) {}

  ngOnInit() {
    if (this.projetId) {
      this.chargement = true;
      this.livrableService.recupererLivrablesParProjet(this.projetId).subscribe({
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

  isEnRetard(statut: StatutLivrable): boolean {
    return statut === StatutLivrable.EN_RETARD;
  }

  isTermine(statut: StatutLivrable): boolean {
    return statut === StatutLivrable.TERMINE;
  }

  // Generic status checker for template
  isStatus(statut: StatutLivrable, status: StatutLivrable): boolean {
    return statut === status;
  }
}
