import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface Projet {
  id: string;
  titre: string;
  description: string;
  statut: string;
  dateDebut: string;
  dateFin: string;
}

@Component({
  selector: 'app-projet-management',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './projet-management.component.html',
  styleUrls: ['./projet-management.component.css']
})
export class ProjetManagementComponent {
  searchTerm = '';
  selectedStatus = '';
  statuts = ['Brouillon', 'En cours', 'Terminé', 'Archive'];
  projets: Projet[] = [
    { id: '1', titre: 'Projet 1', description: 'Desc 1', statut: 'En cours', dateDebut: '2024-05-01', dateFin: '2024-06-01' },
    { id: '2', titre: 'Projet 2', description: 'Desc 2', statut: 'Terminé', dateDebut: '2024-04-01', dateFin: '2024-05-01' },
    { id: '3', titre: 'Projet 3', description: 'Desc 3', statut: 'Brouillon', dateDebut: '2024-06-01', dateFin: '2024-07-01' }
  ];
  displayedColumns: string[] = ['titre', 'description', 'statut', 'dateDebut', 'dateFin', 'actions'];

  get projetsFiltres() {
    return this.projets
      .filter(p => !this.searchTerm || p.titre.toLowerCase().includes(this.searchTerm.toLowerCase()))
      .filter(p => !this.selectedStatus || p.statut === this.selectedStatus);
  }
}
