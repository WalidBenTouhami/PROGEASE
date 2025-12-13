import { Component, OnInit } from '@angular/core';
import { AIService } from '../../../core/services/ai.service';
import { NotificationService } from '../../../core/services/notification.service';

interface Membre {
  id?: string;
  nom: string;
  prenom?: string;
  email?: string;
  competences: string[];
  niveau?: string;
  disponibilite?: string;
}

interface Equipe {
  id: string;
  membres: string[];
  competencesPrincipales: string[];
  forceEstimee: number;
}

@Component({
  selector: 'app-team-formation',
  templateUrl: './team-formation.component.html',
  styleUrls: ['./team-formation.component.css']
})
export class TeamFormationComponent implements OnInit {
  membres: Membre[] = [];
  nouveauMembre: Membre = {
    nom: '',
    competences: []
  };
  equipes: Equipe[] = [];
  loading = false;
  competenceInput = '';

  constructor(
    private aiService: AIService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Initialisation si nécessaire
  }

  ajouterMembre(): void {
    if (this.nouveauMembre.nom && this.nouveauMembre.competences.length > 0) {
      this.membres.push({ ...this.nouveauMembre, id: this.generateId() });
      this.nouveauMembre = {
        nom: '',
        competences: []
      };
      this.competenceInput = '';
    }
  }

  supprimerMembre(index: number): void {
    this.membres.splice(index, 1);
  }

  ajouterCompetence(): void {
    if (this.competenceInput && !this.nouveauMembre.competences.includes(this.competenceInput)) {
      this.nouveauMembre.competences.push(this.competenceInput);
      this.competenceInput = '';
    }
  }

  supprimerCompetence(index: number): void {
    this.nouveauMembre.competences.splice(index, 1);
  }

  formerEquipes(): void {
    if (this.membres.length < 2) {
      this.notificationService.error('Au moins 2 membres sont nécessaires pour former des équipes');
      return;
    }

    this.loading = true;
    this.aiService.formerEquipes(this.membres).subscribe({
      next: (response) => {
        if (response.success && response.data?.equipes) {
          this.equipes = response.data.equipes;
          this.notificationService.success('Équipes formées avec succès !');
        }
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error('Erreur lors de la formation des équipes: ' + error.message);
        this.loading = false;
      }
    });
  }

  getMembresEquipe(membreIds: string[]): string {
    return membreIds
      .map(id => this.membres.find(m => m.id === id)?.nom || id)
      .join(', ');
  }

  private generateId(): string {
    return 'membre_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  importerMembres(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const data = JSON.parse(e.target.result);
          if (Array.isArray(data)) {
            this.membres = data.map(m => ({ ...m, id: this.generateId() }));
            this.notificationService.success(`${data.length} membres importés avec succès`);
          }
        } catch (error) {
          this.notificationService.error('Erreur lors de l\'import du fichier');
        }
      };
      reader.readAsText(file);
    }
  }

  exporterEquipes(): void {
    const dataStr = JSON.stringify(this.equipes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'equipes_' + new Date().toISOString() + '.json';
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
