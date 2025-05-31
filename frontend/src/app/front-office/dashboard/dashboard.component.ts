import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

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

interface utilisateur {
  nom: string;
  role: string;
}

interface Template {
  nom: string;
}

@Component({
  selector: 'app-frontoffice-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatButtonModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class FrontOfficeDashboardComponent implements OnInit {
  projets: Projet[] = [];
  notifications: Notification[] = [];
  livrables: Livrable[] = [];
  utilisateurs: utilisateur[] = [{ nom: 'Jean', role: 'Administrateur' }];
  roles: string[] = ['Administrateur', 'Tuteur', 'etudiant'];
  projetTemplates: Template[] = [{ nom: 'Modele 1' }, { nom: 'Modele 2' }];
  stats = { projetsActifs: 5, groupesRisque: 2, performanceMoyTuteur: 8.5 };
  tutorPerformance: { nom?: string; score?: number }[] = [];
  aiConfig = { algoEquipe: '', seuilRisque: 50, activerRecommandations: true };

  // Adding missing properties used in template
  projetsEnCours: number = 0;
  livrablesSoumis: number = 0;
  retoursRecus: number = 0;
  projetsRecents: Projet[] = [];

  chargement = true;

  constructor() {}

  ngOnInit() {
    // Initialize dashboard data
    this.projetsEnCours = 3;
    this.livrablesSoumis = 7;
    this.retoursRecus = 4;
    this.projetsRecents = [
      { id: '1', nom: 'Projet A' },
      { id: '2', nom: 'Projet B' }
    ];

    // Simuler un chargement
    setTimeout(() => {
      this.chargement = false;
    }, 1000);
  }

  // Ouvre le formulaire pour ajouter un utilisateur
  openutilisateurForm(): void {}

  // Met à jour le rôle d'un utilisateur
  updateRole(utilisateur: utilisateur): void {}

  // Modifie les informations d'un utilisateur
  editutilisateur(utilisateur: utilisateur): void {}

  // Supprime un utilisateur
  deleteutilisateur(utilisateur: utilisateur): void {}

  // Exporte la liste des utilisateurs
  exportutilisateurs(): void {}

  // Importe une liste d'utilisateurs
  importutilisateurs(): void {}

  // Cree un nouveau modele de projet
  createTemplate(): void {}

  // Modifie un modele de projet existant
  editTemplate(template: Template): void {}

  // Met à jour la configuration de l'IA
  updateAICfg(): void {}
}
