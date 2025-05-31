import { Injectable } from '@angular/core';

import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { map, Observable } from 'rxjs';
import { Projet, CreateProjetInput, UpdateProjetInput } from '../models/projet.model';

const GET_PROJETS = gql`
  query GetProjets {
    projets {
      id
      titre
      description
      dateDebut
      dateFin
      statut
      responsableId
      responsable {
        id
        nom
        prenom
      }
      membres {
        id
        nom
        prenom
        role
      }
      livrables {
        id
        titre
        dateLimite
        statut
      }
      evaluations {
        id
        note
        commentaires
        dateEvaluation
      }
      tags
      progression
      dateCreation
      dateModification
    }
  }
`;

const GET_PROJET = gql`
  query GetProjet($id: ID!) {
    projet(id: $id) {
      id
      titre
      description
      dateDebut
      dateFin
      statut
      responsableId
      responsable {
        id
        nom
        prenom
      }
      membres {
        id
        nom
        prenom
        role
      }
      livrables {
        id
        titre
        dateLimite
        statut
      }
      evaluations {
        id
        note
        commentaires
        dateEvaluation
      }
      tags
      progression
      dateCreation
      dateModification
    }
  }
`;

const CREATE_PROJET = gql`
  mutation CreateProjet($input: CreateProjetInput!) {
    createProjet(input: $input) {
      id
      titre
      description
      dateDebut
      dateFin
      statut
      responsableId
      tags
      dateCreation
    }
  }
`;

const UPDATE_PROJET = gql`
  mutation UpdateProjet($id: ID!, $input: UpdateProjetInput!) {
    updateProjet(id: $id, input: $input) {
      id
      titre
      description
      dateDebut
      dateFin
      statut
      responsableId
      membres {
        id
        nom
        prenom
        role
      }
      tags
      dateModification
    }
  }
`;

const DELETE_PROJET = gql`
  mutation DeleteProjet($id: ID!) {
    deleteProjet(id: $id) {
      id
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class ProjetService {
  constructor(private apollo: Apollo) {}

  getProjets(): Observable<Projet[]> {
    return this.apollo
      .watchQuery<{ projets: Projet[] }>({
        query: GET_PROJETS
      })
      .valueChanges.pipe(map((result) => result.data.projets));
  }

  getProjet(id: string): Observable<Projet> {
    return this.apollo
      .watchQuery<{ projet: Projet }>({
        query: GET_PROJET,
        variables: { id }
      })
      .valueChanges.pipe(map((result) => result.data.projet));
  }

  createProjet(input: CreateProjetInput): Observable<Projet> {
    return this.apollo
      .mutate<{ createProjet: Projet }>({
        mutation: CREATE_PROJET,
        variables: { input },
        refetchQueries: [{ query: GET_PROJETS }]
      })
      .pipe(map((result) => result.data!.createProjet));
  }

  updateProjet(id: string, input: UpdateProjetInput): Observable<Projet> {
    return this.apollo
      .mutate<{ updateProjet: Projet }>({
        mutation: UPDATE_PROJET,
        variables: { id, input },
        refetchQueries: [{ query: GET_PROJETS }]
      })
      .pipe(map((result) => result.data!.updateProjet));
  }

  deleteProjet(id: string): Observable<string> {
    return this.apollo
      .mutate<{ deleteProjet: { id: string } }>({
        mutation: DELETE_PROJET,
        variables: { id },
        refetchQueries: [{ query: GET_PROJETS }]
      })
      .pipe(map((result) => result.data!.deleteProjet.id));
  }
=======
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
