import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { Projet, StatutProjet } from '../../core/models/projet.model';
import { ProjetService } from '../../core/services/projet.service';

@Component({
  selector: 'app-projet-list',
  templateUrl: './projet-list.component.html',
  styleUrls: ['./projet-list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ]
})
export class ProjetListComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  chargement = true;
  erreur = '';
  projets: (Projet & { _id: string })[] = [];
  projetsFiltres: (Projet & { _id: string })[] = [];
  dataSource = new MatTableDataSource<Projet & { _id: string }>();
  private subscription?: Subscription;
  StatutProjet = StatutProjet;
  searchTerm = '';
  selectedStatus = '';
  statuts = Object.values(StatutProjet);

  constructor(
    private projetService: ProjetService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.chargerProjets();
  }

  chargerProjets(): void {
    this.chargement = true;
    this.projetService.recupererProjets().subscribe({
      next: (projets) => {
        this.projets = projets.filter(p => p._id !== undefined) as (Projet & { _id: string })[];
        this.projetsFiltres = [...this.projets];
        this.dataSource.data = this.projets;
        this.chargement = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des projets:', error);
        this.erreur = 'Une erreur est survenue lors du chargement des projets.';
        this.chargement = false;
      }
    });
  }

  filtrerProjets(terme: string): void {
    this.projetsFiltres = this.projets.filter(projet => {
      const matchTitre = projet.titre.toLowerCase().includes(terme.toLowerCase());
      const matchStatus = !this.selectedStatus || projet.statut === this.selectedStatus;
      return matchTitre && matchStatus;
    });
  }

  async voirDetails(id: string): Promise<void> {
    try {
      const success = await this.router.navigate(['/projet', id]);
      if (!success) {
        console.warn(`Navigation vers le projet ${id} impossible`);
      }
    } catch (error) {
      console.error('Erreur de navigation:', error);
      this.erreur = 'Impossible d\'acceder au projet demande.';
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
