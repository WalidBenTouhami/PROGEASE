import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Projet } from '../../core/models/projet.model';
import { ProjetService } from '../../core/services/projet.service';

@Component({
  selector: 'app-projet-list',
  templateUrl: './projet-list.component.html',
  styleUrls: ['./projet-list.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ProjetListComponent implements OnInit, OnDestroy {
  chargement = true;
  erreur = '';
  projets: (Projet & { _id: string })[] = [];
  private subscription?: Subscription;

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
        this.chargement = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des projets:', error);
        this.erreur = 'Impossible de charger les projets.';
        this.chargement = false;
      }
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
