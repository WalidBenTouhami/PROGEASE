import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Deliverable, StatutLivrable } from '../../core/models/deliverable.model';
import { DeliverableService } from '../../core/services/deliverable.service';

@Component({
  selector: 'app-deliverable-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './deliverable-list.component.html',
  styleUrl: './deliverable-list.component.css'
})
export class DeliverableListComponent implements OnInit {
  @Input() projetId!: string;
  livrables: Deliverable[] = [];
  chargement = false;
  erreur = '';

  constructor(private deliverableService: DeliverableService) {}

  ngOnInit() {
    if (this.projetId) {
      this.chargement = true;
      this.deliverableService.recupererLivrablesParProjet(this.projetId).subscribe({
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
