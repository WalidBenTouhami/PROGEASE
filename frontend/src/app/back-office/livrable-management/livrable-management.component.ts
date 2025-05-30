import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface Livrable {
  id: string;
  intitule: string;
  statut: string;
  dateLimite: string;
}

@Component({
  selector: 'app-livrable-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatBadgeModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatListModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './livrable-management.component.html',
  styleUrls: ['./livrable-management.component.css']
})
export class LivrableManagementComponent {
  searchTerm = '';
  selectedStatus = '';
  statuts = ['En attente', 'Terminé', 'En retard'];
  livrables: Livrable[] = [
    { id: '1', intitule: 'Livrable 1', statut: 'En attente', dateLimite: '2024-06-10' },
    { id: '2', intitule: 'Livrable 2', statut: 'Terminé', dateLimite: '2024-06-01' },
    { id: '3', intitule: 'Livrable 3', statut: 'En retard', dateLimite: '2024-05-20' }
  ];

  get livrablesFiltres() {
    return this.livrables
      .filter(l => !this.searchTerm || l.intitule.toLowerCase().includes(this.searchTerm.toLowerCase()))
      .filter(l => !this.selectedStatus || l.statut === this.selectedStatus);
  }
}
