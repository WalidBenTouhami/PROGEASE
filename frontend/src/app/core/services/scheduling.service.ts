import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Rappel {
  type: string;
  titre: string;
  message: string;
  priorite: string;
  dateRappel: Date;
  destinataires: string[];
}

export interface Evenement {
  type: string;
  titre: string;
  description: string;
  date: Date;
  duree: number;
  participants: string[];
  tuteur?: string;
  lieu: string;
  statut: string;
}

export interface Conflit {
  type: string;
  evenement1: any;
  evenement2: any;
  participantsCommuns: string[];
  gravite: string;
}

@Injectable({
  providedIn: 'root'
})
export class SchedulingService {
  private readonly path = '/api/scheduling';

  constructor(private api: ApiService) {}

  // Générer des rappels pour un projet
  genererRappels(projetId: string): Observable<{ success: boolean; data: { rappels: Rappel[]; statistiques: any } }> {
    return this.api.get(`${this.path}/reminders/${projetId}`);
  }

  // Planifier des événements pour un projet
  planifierEvenements(projetId: string, options: { type?: string; frequence?: string }): Observable<{ success: boolean; data: any }> {
    return this.api.post(`${this.path}/events/${projetId}`, options);
  }

  // Envoyer des notifications
  envoyerNotifications(rappels: Rappel[]): Observable<{ success: boolean; data: any }> {
    return this.api.post(`${this.path}/notifications`, { rappels });
  }

  // Détecter les conflits de planning
  detecterConflits(evenements: Evenement[]): Observable<{ success: boolean; data: { conflits: Conflit[]; statistiques: any } }> {
    return this.api.post(`${this.path}/conflicts`, { evenements });
  }

  // Générer un planning complet
  genererPlanningComplet(projetId: string, options?: { frequence?: string }): Observable<{ success: boolean; data: any }> {
    if (options) {
      return this.api.post(`${this.path}/complete/${projetId}`, options);
    }
    return this.api.get(`${this.path}/complete/${projetId}`);
  }

  // Vérifier la santé du service
  checkHealth(): Observable<any> {
    return this.api.get(`${this.path}/health`);
  }
}
