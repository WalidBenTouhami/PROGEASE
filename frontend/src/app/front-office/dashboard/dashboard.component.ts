import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Projet {
  id: string;
  nom: string;
  progression?: number;
}

interface Notification {
  message: string;
  date: Date | string;
}

interface Livrable {
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
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  projets: Projet[] = [];
  notifications: Notification[] = [];
  livrables: Livrable[] = [];
  users: User[] = [{ nom: 'Jean', role: 'Administrateur' }];
  roles: string[] = ['Administrateur', 'Tuteur', 'Étudiant'];
  projetTemplates: Template[] = [{ nom: 'Modèle 1' }, { nom: 'Modèle 2' }];
  stats = { projetsActifs: 5, groupesRisque: 2, performanceMoyTuteur: 8.5 };
  tutorPerformance: { nom?: string; score?: number }[] = [];
  aiConfig = { algoEquipe: '', seuilRisque: 50, activerRecommandations: true };

  // Adding missing properties used in template
  projetsEnCours: number = 0;
  livrablesSoumis: number = 0;
  retoursRecus: number = 0;
  projetsRecents: Projet[] = [];

  ngOnInit() {
    // Initialize dashboard data
    this.projetsEnCours = 3;
    this.livrablesSoumis = 7;
    this.retoursRecus = 4;
    this.projetsRecents = [
      { id: '1', nom: 'Projet A' },
      { id: '2', nom: 'Projet B' }
    ];
  }

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
