import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Livrable, StatutLivrable } from '../../core/models/livrable.model';
import { LivrableService } from '../../core/services/livrable.service';

@Component({
  selector: 'app-livrable-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './livrable-list.component.html',
  styleUrls: ['./livrable-list.component.css']
})
export class LivrableListComponent implements OnInit, OnDestroy {
  @Input() projetId!: string;
  chargement = true;
  erreur = '';
  livrables: Livrable[] = [];
  private subscription?: Subscription;
  StatutLivrable = StatutLivrable;

  constructor(
    private livrableService: LivrableService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.chargerLivrables();
  }

  chargerLivrables(): void {
    this.chargement = true;
    this.subscription = this.livrableService.recupererLivrablesParProjet(this.projetId).subscribe({
      next: (livrables) => {
        this.livrables = livrables;
        this.chargement = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des livrables:', error);
        this.erreur = 'Impossible de charger les livrables.';
        this.chargement = false;
      }
    });
  }

  voirDetails(id: string): void {
    this.router.navigate(['/livrable', id]);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
