import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** Type Date personnalisé */
  Date: { input: any; output: any; }
};

export type AiRecommendationResult = {
  recommendations?: Maybe<Array<Scalars['String']['output']>>;
};

export type AnalyseIa = {
  entites?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  motsCles?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  resume?: Maybe<Scalars['String']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
  sentiment?: Maybe<Scalars['String']['output']>;
};

export type AnalyzeTextOptions = {
  language?: InputMaybe<Scalars['String']['input']>;
  model?: InputMaybe<Scalars['String']['input']>;
};

export type AnalyzeTextResult = {
  confidence?: Maybe<Scalars['Float']['output']>;
  keywords?: Maybe<Array<Scalars['String']['output']>>;
  language?: Maybe<Scalars['String']['output']>;
  sentiment?: Maybe<Scalars['String']['output']>;
  summary?: Maybe<Scalars['String']['output']>;
};

export type GenerateContentMetadata = {
  generationTime?: Maybe<Scalars['String']['output']>;
  modelUsed?: Maybe<Scalars['String']['output']>;
  tokens?: Maybe<Scalars['Int']['output']>;
};

export type GenerateContentOptions = {
  maxTokens?: InputMaybe<Scalars['Int']['input']>;
  model?: InputMaybe<Scalars['String']['input']>;
  temperature?: InputMaybe<Scalars['Float']['input']>;
};

export type GenerateContentResult = {
  content?: Maybe<Scalars['String']['output']>;
  metadata?: Maybe<GenerateContentMetadata>;
};

export type HealthCheckResult = {
  message?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  timestamp?: Maybe<Scalars['String']['output']>;
  version?: Maybe<Scalars['String']['output']>;
};

export type Livrable = {
  _id: Scalars['ID']['output'];
  creeLe?: Maybe<Scalars['String']['output']>;
  dateEcheance?: Maybe<Scalars['String']['output']>;
  dateLimite?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  intitule: Scalars['String']['output'];
  majLe?: Maybe<Scalars['String']['output']>;
  nom: Scalars['String']['output'];
  projet?: Maybe<Projet>;
  projetId: Scalars['ID']['output'];
  statut?: Maybe<Scalars['String']['output']>;
  titre: Scalars['String']['output'];
  urlDepot?: Maybe<Scalars['String']['output']>;
};

export type LivrableInput = {
  dateEcheance?: InputMaybe<Scalars['String']['input']>;
  dateLimite?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  intitule: Scalars['String']['input'];
  nom?: InputMaybe<Scalars['String']['input']>;
  projetId: Scalars['ID']['input'];
  statut?: InputMaybe<Scalars['String']['input']>;
  titre?: InputMaybe<Scalars['String']['input']>;
  urlDepot?: InputMaybe<Scalars['String']['input']>;
};

export type LivrableUpdateInput = {
  dateEcheance?: InputMaybe<Scalars['String']['input']>;
  dateLimite?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  intitule?: InputMaybe<Scalars['String']['input']>;
  nom?: InputMaybe<Scalars['String']['input']>;
  statut?: InputMaybe<Scalars['String']['input']>;
  titre?: InputMaybe<Scalars['String']['input']>;
  urlDepot?: InputMaybe<Scalars['String']['input']>;
};

export type Mutation = {
  ajouterLivrable?: Maybe<Livrable>;
  creerLivrable?: Maybe<Livrable>;
  creerProjet?: Maybe<Projet>;
  generateContent?: Maybe<GenerateContentResult>;
  mettreAJourLivrable?: Maybe<Livrable>;
  mettreAJourProjet?: Maybe<Projet>;
  optimizeProjectDescription?: Maybe<OptimizeProjectDescriptionResult>;
  ping?: Maybe<PingResult>;
  supprimerLivrable?: Maybe<Livrable>;
  supprimerProjet?: Maybe<Projet>;
};


export type MutationAjouterLivrableArgs = {
  input: LivrableInput;
  projetId: Scalars['ID']['input'];
};


export type MutationCreerLivrableArgs = {
  input: LivrableInput;
};


export type MutationCreerProjetArgs = {
  input: ProjetInput;
};


export type MutationGenerateContentArgs = {
  contentType: Scalars['String']['input'];
  options?: InputMaybe<GenerateContentOptions>;
  prompt: Scalars['String']['input'];
};


export type MutationMettreAJourLivrableArgs = {
  input: LivrableUpdateInput;
  livrableId: Scalars['ID']['input'];
};


export type MutationMettreAJourProjetArgs = {
  id: Scalars['ID']['input'];
  input: ProjetInput;
};


export type MutationOptimizeProjectDescriptionArgs = {
  options?: InputMaybe<OptimizeProjectDescriptionOptions>;
  projetId: Scalars['ID']['input'];
};


export type MutationPingArgs = {
  message?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSupprimerLivrableArgs = {
  livrableId: Scalars['ID']['input'];
};


export type MutationSupprimerProjetArgs = {
  id: Scalars['ID']['input'];
};

export type OptimizeProjectDescriptionOptions = {
  language?: InputMaybe<Scalars['String']['input']>;
  style?: InputMaybe<Scalars['String']['input']>;
};

export type OptimizeProjectDescriptionResult = {
  improvements?: Maybe<Array<Scalars['String']['output']>>;
  optimizedDescription?: Maybe<Scalars['String']['output']>;
  originalDescription?: Maybe<Scalars['String']['output']>;
};

export type PingResult = {
  message?: Maybe<Scalars['String']['output']>;
  success?: Maybe<Scalars['Boolean']['output']>;
  timestamp?: Maybe<Scalars['String']['output']>;
};

export type Projet = {
  _id: Scalars['ID']['output'];
  competences?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  creeLe?: Maybe<Scalars['String']['output']>;
  dateDebut?: Maybe<Scalars['String']['output']>;
  dateFin?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  equipe?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  livrables?: Maybe<Array<Maybe<Livrable>>>;
  majLe?: Maybe<Scalars['String']['output']>;
  progression?: Maybe<Scalars['Int']['output']>;
  statut?: Maybe<Scalars['String']['output']>;
  titre: Scalars['String']['output'];
  tuteur?: Maybe<Scalars['String']['output']>;
};

export type ProjetInput = {
  competences?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  dateDebut?: InputMaybe<Scalars['String']['input']>;
  dateFin?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  equipe?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  statut?: InputMaybe<Scalars['String']['input']>;
  titre: Scalars['String']['input'];
  tuteur?: InputMaybe<Scalars['String']['input']>;
};

export type Query = {
  aiRecommendations?: Maybe<AiRecommendationResult>;
  analyzeText?: Maybe<AnalyzeTextResult>;
  healthCheck?: Maybe<HealthCheckResult>;
  livrable?: Maybe<Livrable>;
  livrables?: Maybe<Array<Maybe<Livrable>>>;
  livrablesByProjet?: Maybe<Array<Maybe<Livrable>>>;
  projet?: Maybe<Projet>;
  projets?: Maybe<Array<Maybe<Projet>>>;
};


export type QueryAiRecommendationsArgs = {
  projetId: Scalars['ID']['input'];
};


export type QueryAnalyzeTextArgs = {
  options?: InputMaybe<AnalyzeTextOptions>;
  text: Scalars['String']['input'];
};


export type QueryLivrableArgs = {
  id: Scalars['ID']['input'];
};


export type QueryLivrablesByProjetArgs = {
  projetId: Scalars['ID']['input'];
};


export type QueryProjetArgs = {
  id: Scalars['ID']['input'];
};

export enum StatutLivrable {
  EnAttente = 'EN_ATTENTE',
  EnCours = 'EN_COURS',
  EnRetard = 'EN_RETARD',
  Rejete = 'REJETE',
  Termine = 'TERMINE',
  Valide = 'VALIDE'
}

export enum StatutProjet {
  Annule = 'ANNULE',
  Archive = 'ARCHIVE',
  EnCours = 'EN_COURS',
  Propose = 'PROPOSE',
  Termine = 'TERMINE'
}

export type GetProjetsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProjetsQuery = { projets?: Array<{ _id: string, titre: string, statut?: string | null } | null> | null };

export const GetProjetsDocument = gql`
    query GetProjets {
  projets {
    _id
    titre
    statut
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GetProjetsGQL extends Apollo.Query<GetProjetsQuery, GetProjetsQueryVariables> {
    document = GetProjetsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }