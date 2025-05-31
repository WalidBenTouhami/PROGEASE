import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Utilisateur } from '../models/utilisateur.model';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private readonly path = '/api/utilisateurs';

  constructor(private api: ApiService) {}

  // Récupérer tous les utilisateurs avec filtrage et pagination optionnels
  getUtilisateurs(params: any = {}): Observable<{ success: boolean; data: Utilisateur[] }> {
    return this.api.get(this.path, params);
  }

  // Créer un nouvel utilisateur
  creerUtilisateur(utilisateur: Utilisateur): Observable<{ success: boolean; data: Utilisateur }> {
    return this.api.post(this.path, utilisateur);
  }

  // Récupérer un utilisateur par son ID
  getUtilisateurParId(id: string): Observable<{ success: boolean; data: Utilisateur }> {
    return this.api.get(`${this.path}/${id}`);
  }

  // Mettre à jour un utilisateur
  updateUtilisateur(id: string, utilisateur: Utilisateur): Observable<{ success: boolean; data: Utilisateur }> {
    return this.api.put(`${this.path}/${id}`, utilisateur);
  }

  // Supprimer un utilisateur
  deleteUtilisateur(id: string): Observable<{ success: boolean; message: string }> {
    return this.api.delete(`${this.path}/${id}`);
  }

  // Vérifier la santé du service
  checkHealth(): Observable<any> {
    return this.api.checkHealth(this.path);
  }
} 