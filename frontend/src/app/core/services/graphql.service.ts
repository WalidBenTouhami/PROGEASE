import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GraphqlService {
  constructor(private apollo: Apollo) {}

  recupererProjets(): Observable<any> {
    return this.apollo.query({
      query: gql`
        query {
          projets {
            _id
            titre
            description
            equipe
            tuteur
            competences
            dateDebut
            dateFin
            statut
            livrables {
              _id
              nom
              description
              dateLimite
              urlDepot
              statut
              projetId
            }
          }
        }
      `
    });
  }

  creerProjet(data: any): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
        mutation(
          $titre: String!
          $description: String!
          $equipe: [ID!]!
          $tuteur: ID
          $competences: [String!]!
          $dateDebut: String!
          $dateFin: String!
          $statut: String
        ) {
          creerProjet(
            titre: $titre
            description: $description
            equipe: $equipe
            tuteur: $tuteur
            competences: $competences
            dateDebut: $dateDebut
            dateFin: $dateFin
            statut: $statut
          ) {
            _id
            titre
            description
            statut
          }
        }
      `,
      variables: {
        titre: data.titre,
        description: data.description,
        equipe: data.equipe,
        tuteur: data.tuteur,
        competences: data.competences,
        dateDebut: data.dateDebut,
        dateFin: data.dateFin,
        statut: data.statut
      }
    });
  }
}
