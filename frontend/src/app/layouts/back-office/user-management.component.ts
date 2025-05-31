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

interface Utilisateur {
  id: string;
  nom: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-utilisateur-management',
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
  templateUrl: './utilisateur-management.component.html',
  styleUrls: ['./utilisateur-management.component.css']
})
export class utilisateurManagementComponent {
  searchTerm = '';
  selectedRole = '';
  roles = ['Administrateur', 'Tuteur', 'Étudiant'];
  utilisateurs: Utilisateur[] = [
    { id: '1', nom: 'Alice', email: 'alice@progease.com', role: 'Administrateur' },
    { id: '2', nom: 'Bob', email: 'bob@progease.com', role: 'Tuteur' },
    { id: '3', nom: 'Charlie', email: 'charlie@progease.com', role: 'Étudiant' }
  ];
  displayedColumns: string[] = ['nom', 'email', 'role', 'actions'];

  get utilisateursFiltres() {
    return this.utilisateurs
      .filter(u => !this.searchTerm || u.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) || u.email.toLowerCase().includes(this.searchTerm.toLowerCase()))
      .filter(u => !this.selectedRole || u.role === this.selectedRole);
  }
}
