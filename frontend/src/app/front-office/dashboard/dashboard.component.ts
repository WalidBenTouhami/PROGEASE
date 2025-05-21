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

interface User {
  nom: string;
  role: string;
}

interface Template {
  nom: string;
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
  users: User[] = [{ nom: 'Jean', role: 'Administrateur' }];
  roles: string[] = ['Administrateur', 'Tuteur', 'Étudiant'];
  projectTemplates: Template[] = [{ nom: 'Modèle 1' }, { nom: 'Modèle 2' }];
  stats = { projetsActifs: 5, groupesRisque: 2, performanceMoyTuteur: 8.5 };
  tutorPerformance: { nom?: string; score?: number }[] = [];
  aiConfig = { algoEquipe: '', seuilRisque: 50, activerRecommandations: true };

  // Ouvre le formulaire pour ajouter un utilisateur
  openUserForm(): void {}

  // Met à jour le rôle d'un utilisateur
  updateRole(user: User): void {}

  // Modifie les informations d'un utilisateur
  editUser(user: User): void {}

  // Supprime un utilisateur
  deleteUser(user: User): void {}

  // Exporte la liste des utilisateurs
  exportUsers(): void {}

  // Importe une liste d'utilisateurs
  importUsers(): void {}

  // Crée un nouveau modèle de projet
  createTemplate(): void {}

  // Modifie un modèle de projet existant
  editTemplate(template: Template): void {}

  // Met à jour la configuration de l'IA
  updateAICfg(): void {}
}
