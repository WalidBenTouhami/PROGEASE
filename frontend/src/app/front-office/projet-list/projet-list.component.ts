import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProjetService } from '../../core/services/projet.service';
import { Project } from '../../core/models/projet.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projet-list.component.html',
  styleUrls: ['./projet-list.component.css']
})
export class ProjetListComponent implements OnInit, OnDestroy {
  projets: Project[] = [];
  chargement = false;
  erreur = '';
  private subscription?: Subscription;

  constructor(
    private projectService: ProjetService,
    private router: Router
  ) {}

  ngOnInit() {
    this.chargerProjets();
  }

  chargerProjets() {
    this.chargement = true;
    this.subscription = this.projectService.recupererProjets().subscribe({
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
    this.router.navigate(['/project', id]);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
