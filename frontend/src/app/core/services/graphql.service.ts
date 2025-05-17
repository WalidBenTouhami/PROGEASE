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

  creerProjet(input: any): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
        mutation($input: ProjetInput!) {
          creerProjet(input: $input) {
            _id
            titre
            description
            statut
          }
        }
      `,
      variables: { input }
    });
  }
}
