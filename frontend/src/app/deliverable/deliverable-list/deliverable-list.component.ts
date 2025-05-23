//src/app/deliverable/deliverable-list/deliverable-list.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-deliverable-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h2>Livrables</h2>
      <p>Liste des livrables en cours de développement...</p>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
    }
  `]
})
export class DeliverableListComponent {}
