import { Injectable } from '@angular/core';
  import { HttpClient, HttpErrorResponse } from '@angular/common/http';
  import { Observable, map, catchError, throwError } from 'rxjs';
  import { Projet, StatutProjet } from '../models/projet.model';
  import { environment } from '../../../environments/environment';
  import { LivrableService } from './livrable.service';

  @Injectable({
    providedIn: 'root'
  })
  export class ProjetService {
    private apiUrl = `${environment.apiUrl}/projets`;

    constructor(
      private http: HttpClient,
      private livrableService: LivrableService
    ) {}

    recupererProjets(): Observable<Projet[]> {
      return this.http.get<Projet[]>(this.apiUrl).pipe(
        map(projets => projets.map(projet => this.transformDates(projet))),
        catchError(this.handleError)
      );
    }

    recupererProjetParId(id: string): Observable<Projet> {
      return this.http.get<Projet>(`${this.apiUrl}/${id}`).pipe(
        map(projet => this.transformDates(projet)),
        catchError(this.handleError)
      );
    }

    creerProjet(projet: Projet): Observable<Projet> {
      return this.http.post<Projet>(this.apiUrl, projet).pipe(
        catchError(this.handleError)
      );
    }

    mettreAJourProjet(id: string, projet: Projet): Observable<Projet> {
      return this.http.put<Projet>(`${this.apiUrl}/${id}`, projet).pipe(
        catchError(this.handleError)
      );
    }

    supprimerProjet(id: string): Observable<void> {
      return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
        catchError(this.handleError)
      );
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
    getAllProjets = this.recupererProjets;
    getProjetById = this.recupererProjetParId;
    createProjet = this.creerProjet;
    updateProjet = this.mettreAJourProjet;
    deleteProjet = this.supprimerProjet;
  }
