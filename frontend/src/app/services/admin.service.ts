import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Utilisateur {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  dateCreation: Date;
  derniereConnexion: Date;
}

export interface Statistiques {
  totalUtilisateurs: number;
  utilisateursActifs: number;
  projetsEnCours: number;
  projetsTermines: number;
  tauxCompletion: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/utilisateurs`;

  constructor(private http: HttpClient) {}

  getAllUtilisateurs(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(this.apiUrl);
  }

  getUtilisateurById(id: string): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.apiUrl}/${id}`);
  }

  mettreAJourUtilisateur(id: string, utilisateur: Partial<Utilisateur>): Observable<Utilisateur> {
    return this.http.put<Utilisateur>(`${this.apiUrl}/${id}`, utilisateur);
  }

  supprimerUtilisateur(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getStatistiques(): Observable<Statistiques> {
    return this.http.get<Statistiques>(`${this.apiUrl}/statistiques`);
  }

  getUtilisateursActifs(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.apiUrl}/actifs`);
  }

  getUtilisateursInactifs(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.apiUrl}/inactifs`);
  }

  getHistoriqueConnexions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/historique-connexions`);
  }
} 