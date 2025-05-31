import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { Projet, StatutProjet } from '../models/projet.model';
import { environment } from '../../../environments/environment';
import { LivrableService } from './livrable.service';
import { ApiService } from './api.service';
import { Livrable } from '../models/livrable.model';

@Injectable({
  providedIn: 'root'
})
export class ProjetService {
  private readonly path = '/api/projets';

  constructor(
    private http: HttpClient,
    private livrableService: LivrableService,
    private api: ApiService
  ) {}

  // Récupérer tous les projets avec filtrage et pagination
  getProjets(params: any = {}): Observable<{ success: boolean; data: Projet[] }> {
    return this.api.get(this.path, params);
  }

  // Créer un nouveau projet
  creerProjet(projet: Projet): Observable<{ success: boolean; data: Projet }> {
    return this.api.post(this.path, projet);
  }

  // Récupérer un projet par son ID
  getProjetParId(id: string): Observable<{ success: boolean; data: Projet }> {
    return this.api.get(`${this.path}/${id}`);
  }

  // Mettre à jour un projet
  updateProjet(id: string, projet: Projet): Observable<{ success: boolean; data: Projet }> {
    return this.api.put(`${this.path}/${id}`, projet);
  }

  // Supprimer un projet
  deleteProjet(id: string): Observable<{ success: boolean; message: string }> {
    return this.api.delete(`${this.path}/${id}`);
  }

  // Récupérer les livrables d'un projet
  getLivrables(projetId: string): Observable<{ success: boolean; data: Livrable[] }> {
    return this.api.get(`${this.path}/${projetId}/livrables`);
  }

  // Analyser les risques d'un projet
  analyserRisques(projetId: string): Observable<{ success: boolean; data: any }> {
    return this.api.post(`${this.path}/analyse-risques`, { projetId });
  }

  // Obtenir le suivi des tâches d'un projet
  suiviTaches(projetId: string): Observable<{ success: boolean; data: any }> {
    return this.api.post(`${this.path}/suivi-taches`, { projetId });
  }

  // Vérifier la santé du service
  checkHealth(): Observable<any> {
    return this.api.checkHealth(this.path);
  }

  getStatutOptions(): string[] {
    return Object.values(StatutProjet);
  }

  getLivrablesByProjetId(projetId: string) {
    return this.livrableService.getAllLivrables().pipe(
      map(livrables => livrables.filter(livrable => livrable.projetId === projetId)),
      catchError(this.handleError)
    );
  }

  // Méthode utilitaire pour transformer les dates
  private transformDates(projet: Projet): Projet {
    return {
      ...projet,
      dateDebut: new Date(projet.dateDebut),
      dateFin: new Date(projet.dateFin),
      creeLe: projet.creeLe ? new Date(projet.creeLe) : undefined,
      majLe: projet.majLe ? new Date(projet.majLe) : undefined
    };
  }

  // Gestion des erreurs
  private handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }

  // Maintenir les alias pour la compatibilité
  getAllProjets = this.getProjets;
  getProjetById = this.getProjetParId;
  createProjet = this.creerProjet;
  updateProjet = this.updateProjet;
  deleteProjet = this.deleteProjet;
}
