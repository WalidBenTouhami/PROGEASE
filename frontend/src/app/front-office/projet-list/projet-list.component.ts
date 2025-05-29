import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProjetService } from '../../core/services/projet.service';
import { Projet } from '../../core/models/projet.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-projet-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projet-list.component.html',
  styleUrls: ['./projet-list.component.css']
})
export class ProjetListComponent implements OnInit, OnDestroy {
  projets: Projet[] = [];
  chargement = false;
  erreur = '';
  private subscription?: Subscription;

  constructor(
    private projetService: ProjetService,
    private router: Router
  ) {}

  ngOnInit() {
    this.chargerProjets();
  }

  chargerProjets() {
    this.chargement = true;
    this.subscription = this.projetService.recupererProjets().subscribe({
      next: (projets) => {
        this.projets = projets;
        this.chargement = false;
      },
      error: (err) => {
        this.erreur = "Erreur lors du chargement des projets.";
        this.chargement = false;
        console.error('Erreur:', err);
      }
    });
  }

  voirDetails(id: string) {
    this.router.navigate(['/projet', id]);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
