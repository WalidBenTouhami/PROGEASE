import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Livrable, StatutLivrable } from '../../core/models/livrable.model';
import { LivrableService } from '../../core/services/livrable.service';

@Component({
  selector: 'app-livrable-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './livrable-list.component.html',
  styleUrl: './livrable-list.component.css'
})
export class LivrableListComponent implements OnInit {
  @Input() projetId!: string;
  livrables: Livrable[] = [];
  chargement = false;
  erreur = '';

  constructor(private livrableService: LivrableService) {}

  ngOnInit() {
    if (this.projetId) {
      this.chargement = true;
      this.livrableService.recupererLivrablesParProjet(this.projetId).subscribe({
        next: (livrables) => {
          this.livrables = livrables;
          this.chargement = false;
        },
        error: () => {
          this.erreur = "Erreur lors du chargement des livrables.";
          this.chargement = false;
        }
      });
    }
  }

  // Helper method to check status
  isStatus(status: StatutLivrable, expectedStatus: string): boolean {
    return status.toLowerCase() === expectedStatus.toLowerCase();
  }
}
