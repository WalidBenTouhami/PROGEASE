import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from '../../core/models/projet.model';
import { Deliverable } from '../../core/models/livrable.model';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projet-detail.component.html',
  styleUrls: ['./projet-detail.component.css']
})
export class ProjetDetailComponent implements OnInit {
  @Input() projet?: Project;

  ngOnInit(): void {}

  statutClass(statut: string): string {
    switch (statut) {
      case 'Brouillon': return 'status brouillon';
      case 'En cours': return 'status encours';
      case 'Terminé': return 'status termine';
      case 'Archivé': return 'status archive';
      default: return 'status';
    }
  }
}
