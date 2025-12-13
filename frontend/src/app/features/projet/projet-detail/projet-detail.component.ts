import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Projet } from '../../../core/models/projet.model';
import { Livrable } from '../../../core/models/livrable.model';

@Component({
  selector: 'app-projet-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projet-detail.component.html',
  styleUrls: ['./projet-detail.component.css']
})
export class ProjetDetailComponent implements OnInit {
  @Input() projet?: Projet;

  ngOnInit(): void {}

  statutClass(statut: string): string {
    switch (statut) {
      case 'brouillon': return 'status brouillon';
      case 'en_cours': return 'status encours';
      case 'termine': return 'status termine';
      case 'archive': return 'status archive';
      default: return 'status';
    }
  }
}
