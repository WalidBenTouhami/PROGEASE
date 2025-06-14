import { Component, OnInit } from '@angular/core';
import { AdminService, Utilisateur } from '../../../services/admin.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  displayedColumns: string[] = ['nom', 'email', 'role', 'dateCreation', 'derniereConnexion', 'actions'];
  dataSource = new MatTableDataSource<Utilisateur>();
  loading = false;

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.chargerUtilisateurs();
  }

  chargerUtilisateurs(): void {
    this.loading = true;
    this.adminService.getAllUtilisateurs().subscribe({
      next: (utilisateurs) => {
        this.dataSource.data = utilisateurs;
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Erreur lors du chargement des utilisateurs', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  supprimerUtilisateur(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.adminService.supprimerUtilisateur(id).subscribe({
        next: () => {
          this.snackBar.open('Utilisateur supprimé avec succès', 'Fermer', { duration: 3000 });
          this.chargerUtilisateurs();
        },
        error: (error) => {
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  mettreAJourRole(utilisateur: Utilisateur, nouveauRole: string): void {
    this.adminService.mettreAJourUtilisateur(utilisateur.id, { role: nouveauRole }).subscribe({
      next: () => {
        this.snackBar.open('Rôle mis à jour avec succès', 'Fermer', { duration: 3000 });
        this.chargerUtilisateurs();
      },
      error: (error) => {
        this.snackBar.open('Erreur lors de la mise à jour du rôle', 'Fermer', { duration: 3000 });
      }
    });
  }

  appliquerFiltre(event: Event): void {
    const filtre = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filtre.trim().toLowerCase();
  }
} 