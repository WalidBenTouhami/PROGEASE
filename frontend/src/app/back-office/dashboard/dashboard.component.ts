import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  roles = ['Administrateur', 'Tuteur', 'etudiant'];
  stats = { projetsActifs: 5, groupesRisque: 2, performanceMoyTuteur: 8.5 };
// Adding missing properties used in template
  projetsAValider: number = 0;
  livrablesACorriger: number = 0;
  dernieresActions: Array<{ date: string; description: string }> = [];

  ngOnInit() {
    // Initialize dashboard data
    this.projetsAValider = 5;
    this.livrablesACorriger = 10;
    this.dernieresActions = [
      { date: '2024-03-20', description: 'Nouveau projet soumis' },
      { date: '2024-03-19', description: 'Livrable corrige' }
    ];
  }
  createTemplate() {}
  editTemplate(template: any) {}
}
