import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Projet } from '../../core/models/projet.model';
import { ProjetService } from '../../core/services/projet.service';

@Component({
  selector: 'app-projet-list',
  templateUrl: './projet-list.component.html',
  styleUrls: ['./projet-list.component.css']
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
      next: (projets) => {
        this.projets = projets.filter(p => !!p._id) as (Projet & { _id: string })[];
        this.chargement = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des projets:', error);
        this.erreur = 'Impossible de charger les projets.';
        this.chargement = false;
      }
    });
  }

  voirDetails(id: string): void {
    this.router.navigate(['/projet', id]);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
