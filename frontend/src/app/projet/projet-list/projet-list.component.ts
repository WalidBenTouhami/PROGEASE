import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
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
    RouterModule
  ]
}) export class ProjetListComponent implements OnInit, OnDestroy {
  chargement = true;
  erreur = '';
  projets: (Projet & { _id: string })[] = [];
  projetsFiltres: (Projet & { _id: string })[] = []; // Ajout de cette propriété
  private subscription?: Subscription;
  StatutProjet = StatutProjet;

  constructor(
    private projetService: ProjetService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.chargerProjets();
  }

  chargerProjets(): void {
    this.chargement = true;
    this.subscription = this.projetService.recupererProjets().subscribe({
      next: (projets: any[]) => {
        this.projets = projets.filter((p: any) => !!p._id) as (Projet & { _id: string })[];
        this.projetsFiltres = [...this.projets]; // Initialiser projetsFiltres
        this.chargement = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des projets:', error);
        this.erreur = 'Impossible de charger les projets.';
        this.chargement = false;
      }
    });
  }

  filtrerProjets(critere: string): void {
    if (!critere) {
      this.projetsFiltres = [...this.projets];
      return;
    }

    this.projetsFiltres = this.projets.filter(projet =>
      projet.titre.toLowerCase().includes(critere.toLowerCase())
    );
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
