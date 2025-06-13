import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Projet } from '../models/projet.model';

@Injectable({
  providedIn: 'root'
})
export class ProjetService {
  private endpoint = '/projets';

  constructor(private apiService: ApiService) {}

  getProjets(): Observable<Projet[]> {
    return this.apiService.get<Projet[]>(this.endpoint);
  }

  getProjet(id: string): Observable<Projet> {
    return this.apiService.get<Projet>(`${this.endpoint}/${id}`);
  }

  createProjet(projet: Omit<Projet, '_id' | 'creeLe' | 'majLe'>): Observable<Projet> {
    return this.apiService.post<Projet>(this.endpoint, projet);
  }

  updateProjet(id: string, projet: Partial<Projet>): Observable<Projet> {
    return this.apiService.put<Projet>(`${this.endpoint}/${id}`, projet);
  }

  deleteProjet(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  getProjetsEnCours(): Observable<Projet[]> {
    return this.apiService.get<Projet[]>(`${this.endpoint}/en-cours`);
  }

  getProjetsParEtudiant(etudiantId: number): Observable<Projet[]> {
    return this.apiService.get<Projet[]>(`${this.endpoint}/etudiant/${etudiantId}`);
  }

  updateProgression(id: number, progression: number): Observable<Projet> {
    return this.apiService.put<Projet>(`${this.endpoint}/${id}/progression`, { progression });
  }

  updateStatut(id: number, statut: string): Observable<Projet> {
    return this.apiService.put<Projet>(`${this.endpoint}/${id}/statut`, { statut });
  }
}
