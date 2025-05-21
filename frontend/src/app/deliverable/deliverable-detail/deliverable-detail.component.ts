import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Deliverable } from '../../core/models/deliverable.model';

@Component({
  selector: 'app-deliverable-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deliverable-detail.component.html',
  styleUrls: ['./deliverable-detail.component.css']
})
export class DeliverableDetailComponent implements OnInit {
  @Input() livrable?: Deliverable;

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
