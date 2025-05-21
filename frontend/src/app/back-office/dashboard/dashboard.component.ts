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
  users = [{ nom: 'Jean', role: 'Administrateur' }];
  roles = ['Administrateur', 'Tuteur', 'Étudiant'];
  projectTemplates = [{ nom: 'Modèle 1' }, { nom: 'Modèle 2' }];
  stats = { projetsActifs: 5, groupesRisque: 2, performanceMoyTuteur: 8.5 };
  tutorPerformance: { nom?: string; score?: number }[] = [];
  aiConfig = { algoEquipe: '', seuilRisque: 50, activerRecommandations: true };

  // Adding missing properties used in template
  projetsAValider: number = 0;
  livrablesACorriger: number = 0;
  nbEtudiants: number = 0;
  dernieresActions: Array<{ date: string; description: string }> = [];

  ngOnInit() {
    // Initialize dashboard data
    this.projetsAValider = 5;
    this.livrablesACorriger = 10;
    this.nbEtudiants = 150;
    this.dernieresActions = [
      { date: '2024-03-20', description: 'Nouveau projet soumis' },
      { date: '2024-03-19', description: 'Livrable corrigé' }
    ];
  }

  openUserForm() {}
  updateRole(user: any) {}
  editUser(user: any) {}
  deleteUser(user: any) {}
  exportUsers() {}
  importUsers() {}
  createTemplate() {}
  editTemplate(template: any) {}
  updateAICfg() {}
}
