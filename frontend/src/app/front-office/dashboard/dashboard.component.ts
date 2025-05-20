import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Project {
  _id: string;
  titre: string;
  progression?: number;
}

interface Notification {
  message: string;
  date: Date | string;
}

interface Deliverable {
  nom: string;
  statut: string;
  dateLimite: Date | string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  projects: Project[] = [];
  notifications: Notification[] = [];
  deliverables: Deliverable[] = [];
  users = [{ nom: 'Jean', role: 'Administrateur' }];
  roles = ['Administrateur', 'Tuteur', 'Étudiant'];
  projectTemplates = [{ nom: 'Modèle 1' }, { nom: 'Modèle 2' }];
  stats = { projetsActifs: 5, groupesRisque: 2, performanceMoyTuteur: 8.5 };
  tutorPerformance: { nom?: string; score?: number }[] = [];
  aiConfig = { algoEquipe: '', seuilRisque: 50, activerRecommandations: true };

  // Méthodes vides à implémenter
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
