import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Livrable } from '../../core/models/livrable.model';

@Component({
  selector: 'app-livrable-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './livrable-detail.component.html',
  styleUrls: ['./livrable-detail.component.css']
})
export class LivrableDetailComponent implements OnInit {
  @Input() livrable?: Livrable;

  ngOnInit(): void {}

  statutClass(statut: string): string {
    switch (statut) {
      case 'Terminé': return 'status termine';
      case 'En attente': return 'status attente';
      case 'En retard': return 'status retard';
      default: return 'status';
    }
  }
}
