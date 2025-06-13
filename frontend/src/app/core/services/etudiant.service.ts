import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Etudiant {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  statut: string;
  dateInscription: Date;
  derniereActivite: Date;
}

@Injectable({
  providedIn: 'root'
})
export class EtudiantService {
  private endpoint = '/etudiants';

  constructor(private apiService: ApiService) {}

  getEtudiants(): Observable<Etudiant[]> {
    return this.apiService.get<Etudiant[]>(this.endpoint);
  }

  getEtudiant(id: number): Observable<Etudiant> {
    return this.apiService.get<Etudiant>(`${this.endpoint}/${id}`);
  }

  createEtudiant(etudiant: Omit<Etudiant, 'id'>): Observable<Etudiant> {
    return this.apiService.post<Etudiant>(this.endpoint, etudiant);
  }

  updateEtudiant(id: number, etudiant: Partial<Etudiant>): Observable<Etudiant> {
    return this.apiService.put<Etudiant>(`${this.endpoint}/${id}`, etudiant);
  }

  deleteEtudiant(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  getEtudiantsRecents(): Observable<Etudiant[]> {
    return this.apiService.get<Etudiant[]>(`${this.endpoint}/recents`);
  }

  getEtudiantsActifs(): Observable<Etudiant[]> {
    return this.apiService.get<Etudiant[]>(`${this.endpoint}/actifs`);
  }
} 