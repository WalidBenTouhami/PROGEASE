import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { RouterModule } from '@angular/router';

interface Livrable {
  id: number;
  titre: string;
  description: string;
  dateCreation: Date;
  statut: string;
  projet: string;
}

@Component({
  selector: 'app-livrable-management',
  templateUrl: './livrable-management.component.html',
  styleUrls: ['./livrable-management.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatListModule,
    MatBadgeModule,
    RouterModule
  ]
})
export class LivrableManagementComponent implements OnInit {
  searchTerm = '';
  selectedStatus = '';
  livrables: Livrable[] = [];
  filteredLivrables: Livrable[] = [];

  constructor() {
    // Données de test
    this.livrables = [
      {
        id: 1,
        titre: 'Documentation API',
        description: 'Documentation complète de l\'API REST',
        dateCreation: new Date(),
        statut: 'En cours',
        projet: 'PROGEASE'
      },
      {
        id: 2,
        titre: 'Schéma de base de données',
        description: 'Modélisation de la base de données',
        dateCreation: new Date(),
        statut: 'Terminé',
        projet: 'PROGEASE'
      }
    ];
    this.filteredLivrables = [...this.livrables];
  }

  ngOnInit(): void {
    this.filterLivrables();
  }

  filterLivrables(): void {
    this.filteredLivrables = this.livrables
      .filter(l => l.titre.toLowerCase().includes(this.searchTerm.toLowerCase()))
      .filter(l => !this.selectedStatus || l.statut === this.selectedStatus);
  }
}
