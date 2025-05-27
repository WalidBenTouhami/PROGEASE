import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
    [_ in K]?: never;
};
export type Incremental<T> =
    | T
    | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
    ID: { input: string; output: string };
    String: { input: string; output: string };
    Boolean: { input: boolean; output: boolean };
    Int: { input: number; output: number };
    Float: { input: number; output: number };
    /** Scalar personnalisé pour manipuler les dates ISO-8601 */
    Date: { input: string; output: string };
}

/** Code d'erreur pour les résultats d'opération */
export const enum ErrorCode {
    DependencyError = 'DEPENDENCY_ERROR',
    DuplicateEntity = 'DUPLICATE_ENTITY',
    Forbidden = 'FORBIDDEN',
    InternalError = 'INTERNAL_ERROR',
    InvalidInput = 'INVALID_INPUT',
    NotFound = 'NOT_FOUND',
    Unauthorized = 'UNAUTHORIZED',
    ValidationError = 'VALIDATION_ERROR',
}

/** État de santé du serveur */
export interface HealthStatus {
    __typename?: 'HealthStatus';
    /** État de la base de données */
    databaseStatus?: Maybe<Scalars['String']['output']>;
    /** État actuel */
    status: Scalars['String']['output'];
    /** Horodatage */
    timestamp: Scalars['Date']['output'];
    /** Utilisateur */
    user: Scalars['String']['output'];
    /** Version de l'API */
    version?: Maybe<Scalars['String']['output']>;
}

/** Type de livrable pour un projet */
export interface Livrable extends Node, Traceable {
    __typename?: 'Livrable';
    /** Identifiant unique */
    _id: Scalars['ID']['output'];
    /** Utilisateur ayant créé le livrable */
    createur?: Maybe<Scalars['ID']['output']>;
    /** Date de création */
    creeLe: Scalars['Date']['output'];
    /** Date limite de livraison */
    dateLimite: Scalars['Date']['output'];
    /** Description détaillée */
    description: Scalars['String']['output'];
    /** Date de dernière modification */
    majLe: Scalars['Date']['output'];
    /** Utilisateur ayant modifié le livrable */
    majPar?: Maybe<Scalars['ID']['output']>;
    /** Nom du livrable */
    nom: Scalars['String']['output'];
    /** Projet associé au livrable */
    projet?: Maybe<Projet>;
    /** ID du projet associé */
    projetId: Scalars['ID']['output'];
    /** Statut actuel du livrable */
    statut: StatutLivrable;
    /** URL du dépôt */
    urlDepot?: Maybe<Scalars['String']['output']>;
}

/** Filtres pour la recherche de livrables */
export interface LivrableFilterInput {
    /** Date limite maximale */
    dateLimiteMax?: InputMaybe<Scalars['Date']['input']>;
    /** Date limite minimale */
    dateLimiteMin?: InputMaybe<Scalars['Date']['input']>;
    /** Terme de recherche (nom et description) */
    recherche?: InputMaybe<Scalars['String']['input']>;
    /** Statut du livrable */
    statut?: InputMaybe<StatutLivrable>;
}

/** Données d'entrée pour un livrable */
export interface LivrableInput {
    /** Date limite de livraison */
    dateLimite: Scalars['Date']['input'];
    /** Description détaillée */
    description: Scalars['String']['input'];
    /** Nom du livrable */
    nom: Scalars['String']['input'];
    /** Statut du livrable */
    statut: StatutLivrable;
    /** URL du dépôt */
    urlDepot?: InputMaybe<Scalars['String']['input']>;
}

/** Résultat d'opération avec un livrable */
export interface LivrableResult extends OperationResult {
    __typename?: 'LivrableResult';
    /** Code d'erreur en cas d'échec */
    errorCode?: Maybe<ErrorCode>;
    /** Livrable résultant de l'opération */
    livrable?: Maybe<Livrable>;
    /** Message associé à l'opération */
    message?: Maybe<Scalars['String']['output']>;
    /** Indique si l'opération a réussi */
    success: Scalars['Boolean']['output'];
}

/** Liste paginée de livrables */
export interface LivrablesConnection extends PaginatedResponse {
    __typename?: 'LivrablesConnection';
    /** Liste des livrables */
    items: Array<Livrable>;
    /** Informations de pagination */
    pagination: PaginationInfo;
}

/** Mutations disponibles */
export interface Mutation {
    __typename?: 'Mutation';
    /** Ajouter un livrable à un projet */
    ajouterLivrable: LivrableResult;
    /** Créer un nouveau projet */
    creerProjet: ProjetResult;
    /** Mettre à jour un livrable existant */
    mettreAJourLivrable: LivrableResult;
    /** Mettre à jour un projet existant */
    mettreAJourProjet: ProjetResult;
    /** Supprimer un livrable */
    supprimerLivrable: LivrableResult;
    /** Supprimer un projet et ses livrables associés */
    supprimerProjet: ProjetResult;
}

/** Mutations disponibles */
export interface MutationAjouterLivrableArgs {
    input: LivrableInput;
    projetId: Scalars['ID']['input'];
}

/** Mutations disponibles */
export interface MutationCreerProjetArgs {
    input: ProjetCreateInput;
}

/** Mutations disponibles */
export interface MutationMettreAJourLivrableArgs {
    input: LivrableInput;
    livrableId: Scalars['ID']['input'];
}

/** Mutations disponibles */
export interface MutationMettreAJourProjetArgs {
    id: Scalars['ID']['input'];
    input: ProjetUpdateInput;
}

/** Mutations disponibles */
export interface MutationSupprimerLivrableArgs {
    livrableId: Scalars['ID']['input'];
}

/** Mutations disponibles */
export interface MutationSupprimerProjetArgs {
    id: Scalars['ID']['input'];
}

/** Interface pour les entités avec identifiant */
export interface Node {
    /** Identifiant unique */
    _id: Scalars['ID']['output'];
}

/** Résultat d'opération standard */
export interface OperationResult {
    /** Code d'erreur en cas d'échec */
    errorCode?: Maybe<ErrorCode>;
    /** Message associé à l'opération */
    message?: Maybe<Scalars['String']['output']>;
    /** Indique si l'opération a réussi */
    success: Scalars['Boolean']['output'];
}

/** Type de base pour les réponses paginées */
export interface PaginatedResponse {
    /** Informations de pagination */
    pagination: PaginationInfo;
}

/** Informations de pagination pour les listes */
export interface PaginationInfo {
    __typename?: 'PaginationInfo';
    /** Indique s'il y a une page suivante */
    hasNextPage: Scalars['Boolean']['output'];
    /** Indique s'il y a une page précédente */
    hasPreviousPage: Scalars['Boolean']['output'];
    /** Nombre d'éléments par page */
    limit: Scalars['Int']['output'];
    /** Page actuelle */
    page: Scalars['Int']['output'];
    /** Nombre total de pages */
    pages: Scalars['Int']['output'];
    /** Nombre total d'éléments */
    total: Scalars['Int']['output'];
}

/** Type de projet */
export interface Projet extends Node, Traceable {
    __typename?: 'Projet';
    /** Identifiant unique */
    _id: Scalars['ID']['output'];
    /** Compétences requises */
    competences: Array<Scalars['String']['output']>;
    /** Utilisateur ayant créé le projet */
    createur?: Maybe<Scalars['ID']['output']>;
    /** Date de création */
    creeLe: Scalars['Date']['output'];
    /** Date de début du projet */
    dateDebut: Scalars['Date']['output'];
    /** Date de fin prévue */
    dateFin: Scalars['Date']['output'];
    /** Description détaillée */
    description: Scalars['String']['output'];
    /** Membres de l'équipe */
    equipe: Array<Scalars['ID']['output']>;
    /** Livrables associés */
    livrables: Array<Livrable>;
    /** Date de dernière modification */
    majLe: Scalars['Date']['output'];
    /** Utilisateur ayant modifié le projet */
    majPar?: Maybe<Scalars['ID']['output']>;
    /** Pourcentage de progression */
    progression?: Maybe<Scalars['Int']['output']>;
    /** Statut actuel du projet */
    statut: StatutProjet;
    /** Titre du projet */
    titre: Scalars['String']['output'];
    /** Tuteur du projet */
    tuteur?: Maybe<Scalars['ID']['output']>;
}

/** Type d'entrée pour création d'un projet */
export interface ProjetCreateInput {
    /** Liste des compétences requises */
    competences: Array<Scalars['String']['input']>;
    /** Date de début du projet */
    dateDebut: Scalars['Date']['input'];
    /** Date de fin prévue du projet */
    dateFin: Scalars['Date']['input'];
    /** Description détaillée du projet */
    description: Scalars['String']['input'];
    /** Liste des membres de l'équipe */
    equipe: Array<Scalars['ID']['input']>;
    /** Statut initial du projet */
    statut?: InputMaybe<StatutProjet>;
    /** Titre du projet */
    titre: Scalars['String']['input'];
    /** Tuteur assigné au projet */
    tuteur?: InputMaybe<Scalars['ID']['input']>;
}

/** Filtres pour la recherche de projets */
export interface ProjetFilterInput {
    /** Compétences requises */
    competence?: InputMaybe<Scalars['String']['input']>;
    /** Date de début minimale */
    dateDebutMin?: InputMaybe<Scalars['Date']['input']>;
    /** Date de fin maximale */
    dateFinMax?: InputMaybe<Scalars['Date']['input']>;
    /** Identifiants des membres de l'équipe */
    membreEquipe?: InputMaybe<Scalars['ID']['input']>;
    /** Terme de recherche (titre et description) */
    recherche?: InputMaybe<Scalars['String']['input']>;
    /** Statut du projet */
    statut?: InputMaybe<StatutProjet>;
    /** Identifiant du tuteur */
    tuteurId?: InputMaybe<Scalars['ID']['input']>;
}

/** Résultat d'opération avec un projet */
export interface ProjetResult extends OperationResult {
    __typename?: 'ProjetResult';
    /** Code d'erreur en cas d'échec */
    errorCode?: Maybe<ErrorCode>;
    /** Message associé à l'opération */
    message?: Maybe<Scalars['String']['output']>;
    /** Projet résultant de l'opération */
    projet?: Maybe<Projet>;
    /** Indique si l'opération a réussi */
    success: Scalars['Boolean']['output'];
}

/** Type d'entrée pour mise à jour d'un projet */
export interface ProjetUpdateInput {
    /** Liste des compétences requises */
    competences?: InputMaybe<Array<Scalars['String']['input']>>;
    /** Date de début du projet */
    dateDebut?: InputMaybe<Scalars['Date']['input']>;
    /** Date de fin prévue du projet */
    dateFin?: InputMaybe<Scalars['Date']['input']>;
    /** Description détaillée du projet */
    description?: InputMaybe<Scalars['String']['input']>;
    /** Liste des membres de l'équipe */
    equipe?: InputMaybe<Array<Scalars['ID']['input']>>;
    /** Statut du projet */
    statut?: InputMaybe<StatutProjet>;
    /** Titre du projet */
    titre?: InputMaybe<Scalars['String']['input']>;
    /** Tuteur assigné au projet */
    tuteur?: InputMaybe<Scalars['ID']['input']>;
}

/** Liste paginée de projets */
export interface ProjetsConnection extends PaginatedResponse {
    __typename?: 'ProjetsConnection';
    /** Liste des projets */
    items: Array<Projet>;
    /** Informations de pagination */
    pagination: PaginationInfo;
}

/** Requêtes disponibles */
export interface Query {
    __typename?: 'Query';
    /** État de santé du serveur */
    health: HealthStatus;
    /** Récupérer un livrable par son ID */
    livrable?: Maybe<Livrable>;
    /** Liste des livrables avec pagination et filtres */
    livrables: LivrablesConnection;
    /** Récupérer un projet par son ID */
    projet?: Maybe<Projet>;
    /** Liste des projets avec pagination et filtres */
    projets: ProjetsConnection;
}

/** Requêtes disponibles */
export interface QueryLivrableArgs {
    id: Scalars['ID']['input'];
}

/** Requêtes disponibles */
export interface QueryLivrablesArgs {
    filter?: InputMaybe<LivrableFilterInput>;
    limit?: InputMaybe<Scalars['Int']['input']>;
    page?: InputMaybe<Scalars['Int']['input']>;
    projetId?: InputMaybe<Scalars['ID']['input']>;
}

/** Requêtes disponibles */
export interface QueryProjetArgs {
    id: Scalars['ID']['input'];
}

/** Requêtes disponibles */
export interface QueryProjetsArgs {
    filter?: InputMaybe<ProjetFilterInput>;
    limit?: InputMaybe<Scalars['Int']['input']>;
    page?: InputMaybe<Scalars['Int']['input']>;
}

/** Énumération des statuts de livrable */
export const enum StatutLivrable {
    AValider = 'A_VALIDER',
    EnAttente = 'EN_ATTENTE',
    EnCours = 'EN_COURS',
    EnRetard = 'EN_RETARD',
    Planifie = 'PLANIFIE',
    Rejete = 'REJETE',
    Termine = 'TERMINE',
    Valide = 'VALIDE',
}

/** Énumération des statuts de projet */
export const enum StatutProjet {
    Annule = 'ANNULE',
    Archive = 'ARCHIVE',
    EnCours = 'EN_COURS',
    Propose = 'PROPOSE',
    Termine = 'TERMINE',
}

/** Interface pour les entités traçables */
export interface Traceable {
    /** Utilisateur ayant créé l'entité */
    createur?: Maybe<Scalars['ID']['output']>;
    /** Date de création */
    creeLe: Scalars['Date']['output'];
    /** Date de dernière modification */
    majLe: Scalars['Date']['output'];
    /** Utilisateur ayant modifié l'entité */
    majPar?: Maybe<Scalars['ID']['output']>;
}

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
    resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
    | ResolverFn<TResult, TParent, TContext, TArgs>
    | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
    parent: TParent,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
    parent: TParent,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
    parent: TParent,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<
    TResult,
    TKey extends string,
    TParent,
    TContext,
    TArgs,
> {
    subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
    resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
    subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
    resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
    | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
    | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
    TResult,
    TKey extends string,
    TParent = {},
    TContext = {},
    TArgs = {},
> =
    | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
    | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
    parent: TParent,
    context: TContext,
    info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
    obj: T,
    context: TContext,
    info: GraphQLResolveInfo
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
    next: NextResolverFn<TResult>,
    parent: TParent,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping of interface types */
export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
    Node: Livrable | Projet;
    OperationResult: LivrableResult | ProjetResult;
    PaginatedResponse: LivrablesConnection | ProjetsConnection;
    Traceable: Livrable | Projet;
};

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
    Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
    Date: ResolverTypeWrapper<Scalars['Date']['output']>;
    ErrorCode: ErrorCode;
    HealthStatus: ResolverTypeWrapper<HealthStatus>;
    ID: ResolverTypeWrapper<Scalars['ID']['output']>;
    Int: ResolverTypeWrapper<Scalars['Int']['output']>;
    Livrable: ResolverTypeWrapper<Livrable>;
    LivrableFilterInput: LivrableFilterInput;
    LivrableInput: LivrableInput;
    LivrableResult: ResolverTypeWrapper<LivrableResult>;
    LivrablesConnection: ResolverTypeWrapper<LivrablesConnection>;
    Mutation: ResolverTypeWrapper<{}>;
    Node: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Node']>;
    OperationResult: ResolverTypeWrapper<
        ResolversInterfaceTypes<ResolversTypes>['OperationResult']
    >;
    PaginatedResponse: ResolverTypeWrapper<
        ResolversInterfaceTypes<ResolversTypes>['PaginatedResponse']
    >;
    PaginationInfo: ResolverTypeWrapper<PaginationInfo>;
    Projet: ResolverTypeWrapper<Projet>;
    ProjetCreateInput: ProjetCreateInput;
    ProjetFilterInput: ProjetFilterInput;
    ProjetResult: ResolverTypeWrapper<ProjetResult>;
    ProjetUpdateInput: ProjetUpdateInput;
    ProjetsConnection: ResolverTypeWrapper<ProjetsConnection>;
    Query: ResolverTypeWrapper<{}>;
    StatutLivrable: StatutLivrable;
    StatutProjet: StatutProjet;
    String: ResolverTypeWrapper<Scalars['String']['output']>;
    Traceable: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Traceable']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
    Boolean: Scalars['Boolean']['output'];
    Date: Scalars['Date']['output'];
    HealthStatus: HealthStatus;
    ID: Scalars['ID']['output'];
    Int: Scalars['Int']['output'];
    Livrable: Livrable;
    LivrableFilterInput: LivrableFilterInput;
    LivrableInput: LivrableInput;
    LivrableResult: LivrableResult;
    LivrablesConnection: LivrablesConnection;
    Mutation: {};
    Node: ResolversInterfaceTypes<ResolversParentTypes>['Node'];
    OperationResult: ResolversInterfaceTypes<ResolversParentTypes>['OperationResult'];
    PaginatedResponse: ResolversInterfaceTypes<ResolversParentTypes>['PaginatedResponse'];
    PaginationInfo: PaginationInfo;
    Projet: Projet;
    ProjetCreateInput: ProjetCreateInput;
    ProjetFilterInput: ProjetFilterInput;
    ProjetResult: ProjetResult;
    ProjetUpdateInput: ProjetUpdateInput;
    ProjetsConnection: ProjetsConnection;
    Query: {};
    String: Scalars['String']['output'];
    Traceable: ResolversInterfaceTypes<ResolversParentTypes>['Traceable'];
};

export type ExternalDirectiveArgs = {};

export type ExternalDirectiveResolver<
    Result,
    Parent,
    ContextType = any,
    Args = ExternalDirectiveArgs,
> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type KeyDirectiveArgs = {
    fields: Scalars['String']['input'];
    resolvable?: Maybe<Scalars['Boolean']['input']>;
};

export type KeyDirectiveResolver<
    Result,
    Parent,
    ContextType = any,
    Args = KeyDirectiveArgs,
> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type ProvidesDirectiveArgs = {
    fields: Scalars['String']['input'];
};

export type ProvidesDirectiveResolver<
    Result,
    Parent,
    ContextType = any,
    Args = ProvidesDirectiveArgs,
> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type RequiresDirectiveArgs = {
    fields: Scalars['String']['input'];
};

export type RequiresDirectiveResolver<
    Result,
    Parent,
    ContextType = any,
    Args = RequiresDirectiveArgs,
> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type ShareableDirectiveArgs = {};

export type ShareableDirectiveResolver<
    Result,
    Parent,
    ContextType = any,
    Args = ShareableDirectiveArgs,
> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type TagDirectiveArgs = {
    name: Scalars['String']['input'];
};

export type TagDirectiveResolver<
    Result,
    Parent,
    ContextType = any,
    Args = TagDirectiveArgs,
> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
    name: 'Date';
}

export type HealthStatusResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['HealthStatus'] = ResolversParentTypes['HealthStatus'],
> = {
    databaseStatus?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    timestamp?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
    user?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    version?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LivrableResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Livrable'] = ResolversParentTypes['Livrable'],
> = {
    _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    createur?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
    creeLe?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
    dateLimite?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
    description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    majLe?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
    majPar?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
    nom?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    projet?: Resolver<Maybe<ResolversTypes['Projet']>, ParentType, ContextType>;
    projetId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    statut?: Resolver<ResolversTypes['StatutLivrable'], ParentType, ContextType>;
    urlDepot?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LivrableResultResolvers<
    ContextType = any,
    ParentType extends
        ResolversParentTypes['LivrableResult'] = ResolversParentTypes['LivrableResult'],
> = {
    errorCode?: Resolver<Maybe<ResolversTypes['ErrorCode']>, ParentType, ContextType>;
    livrable?: Resolver<Maybe<ResolversTypes['Livrable']>, ParentType, ContextType>;
    message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LivrablesConnectionResolvers<
    ContextType = any,
    ParentType extends
        ResolversParentTypes['LivrablesConnection'] = ResolversParentTypes['LivrablesConnection'],
> = {
    items?: Resolver<Array<ResolversTypes['Livrable']>, ParentType, ContextType>;
    pagination?: Resolver<ResolversTypes['PaginationInfo'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation'],
> = {
    ajouterLivrable?: Resolver<
        ResolversTypes['LivrableResult'],
        ParentType,
        ContextType,
        RequireFields<MutationAjouterLivrableArgs, 'input' | 'projetId'>
    >;
    creerProjet?: Resolver<
        ResolversTypes['ProjetResult'],
        ParentType,
        ContextType,
        RequireFields<MutationCreerProjetArgs, 'input'>
    >;
    mettreAJourLivrable?: Resolver<
        ResolversTypes['LivrableResult'],
        ParentType,
        ContextType,
        RequireFields<MutationMettreAJourLivrableArgs, 'input' | 'livrableId'>
    >;
    mettreAJourProjet?: Resolver<
        ResolversTypes['ProjetResult'],
        ParentType,
        ContextType,
        RequireFields<MutationMettreAJourProjetArgs, 'id' | 'input'>
    >;
    supprimerLivrable?: Resolver<
        ResolversTypes['LivrableResult'],
        ParentType,
        ContextType,
        RequireFields<MutationSupprimerLivrableArgs, 'livrableId'>
    >;
    supprimerProjet?: Resolver<
        ResolversTypes['ProjetResult'],
        ParentType,
        ContextType,
        RequireFields<MutationSupprimerProjetArgs, 'id'>
    >;
};

export type NodeResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node'],
> = {
    __resolveType: TypeResolveFn<'Livrable' | 'Projet', ParentType, ContextType>;
    _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type OperationResultResolvers<
    ContextType = any,
    ParentType extends
        ResolversParentTypes['OperationResult'] = ResolversParentTypes['OperationResult'],
> = {
    __resolveType: TypeResolveFn<'LivrableResult' | 'ProjetResult', ParentType, ContextType>;
    errorCode?: Resolver<Maybe<ResolversTypes['ErrorCode']>, ParentType, ContextType>;
    message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
};

export type PaginatedResponseResolvers<
    ContextType = any,
    ParentType extends
        ResolversParentTypes['PaginatedResponse'] = ResolversParentTypes['PaginatedResponse'],
> = {
    __resolveType: TypeResolveFn<
        'LivrablesConnection' | 'ProjetsConnection',
        ParentType,
        ContextType
    >;
    pagination?: Resolver<ResolversTypes['PaginationInfo'], ParentType, ContextType>;
};

export type PaginationInfoResolvers<
    ContextType = any,
    ParentType extends
        ResolversParentTypes['PaginationInfo'] = ResolversParentTypes['PaginationInfo'],
> = {
    hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    hasPreviousPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    limit?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    pages?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProjetResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Projet'] = ResolversParentTypes['Projet'],
> = {
    _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    competences?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
    createur?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
    creeLe?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
    dateDebut?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
    dateFin?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
    description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    equipe?: Resolver<Array<ResolversTypes['ID']>, ParentType, ContextType>;
    livrables?: Resolver<Array<ResolversTypes['Livrable']>, ParentType, ContextType>;
    majLe?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
    majPar?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
    progression?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
    statut?: Resolver<ResolversTypes['StatutProjet'], ParentType, ContextType>;
    titre?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    tuteur?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProjetResultResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['ProjetResult'] = ResolversParentTypes['ProjetResult'],
> = {
    errorCode?: Resolver<Maybe<ResolversTypes['ErrorCode']>, ParentType, ContextType>;
    message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    projet?: Resolver<Maybe<ResolversTypes['Projet']>, ParentType, ContextType>;
    success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProjetsConnectionResolvers<
    ContextType = any,
    ParentType extends
        ResolversParentTypes['ProjetsConnection'] = ResolversParentTypes['ProjetsConnection'],
> = {
    items?: Resolver<Array<ResolversTypes['Projet']>, ParentType, ContextType>;
    pagination?: Resolver<ResolversTypes['PaginationInfo'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query'],
> = {
    health?: Resolver<ResolversTypes['HealthStatus'], ParentType, ContextType>;
    livrable?: Resolver<
        Maybe<ResolversTypes['Livrable']>,
        ParentType,
        ContextType,
        RequireFields<QueryLivrableArgs, 'id'>
    >;
    livrables?: Resolver<
        ResolversTypes['LivrablesConnection'],
        ParentType,
        ContextType,
        RequireFields<QueryLivrablesArgs, 'limit' | 'page'>
    >;
    projet?: Resolver<
        Maybe<ResolversTypes['Projet']>,
        ParentType,
        ContextType,
        RequireFields<QueryProjetArgs, 'id'>
    >;
    projets?: Resolver<
        ResolversTypes['ProjetsConnection'],
        ParentType,
        ContextType,
        RequireFields<QueryProjetsArgs, 'limit' | 'page'>
    >;
};

export type TraceableResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Traceable'] = ResolversParentTypes['Traceable'],
> = {
    __resolveType: TypeResolveFn<'Livrable' | 'Projet', ParentType, ContextType>;
    createur?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
    creeLe?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
    majLe?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
    majPar?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
    Date?: GraphQLScalarType;
    HealthStatus?: HealthStatusResolvers<ContextType>;
    Livrable?: LivrableResolvers<ContextType>;
    LivrableResult?: LivrableResultResolvers<ContextType>;
    LivrablesConnection?: LivrablesConnectionResolvers<ContextType>;
    Mutation?: MutationResolvers<ContextType>;
    Node?: NodeResolvers<ContextType>;
    OperationResult?: OperationResultResolvers<ContextType>;
    PaginatedResponse?: PaginatedResponseResolvers<ContextType>;
    PaginationInfo?: PaginationInfoResolvers<ContextType>;
    Projet?: ProjetResolvers<ContextType>;
    ProjetResult?: ProjetResultResolvers<ContextType>;
    ProjetsConnection?: ProjetsConnectionResolvers<ContextType>;
    Query?: QueryResolvers<ContextType>;
    Traceable?: TraceableResolvers<ContextType>;
};

export type DirectiveResolvers<ContextType = any> = {
    external?: ExternalDirectiveResolver<any, any, ContextType>;
    key?: KeyDirectiveResolver<any, any, ContextType>;
    provides?: ProvidesDirectiveResolver<any, any, ContextType>;
    requires?: RequiresDirectiveResolver<any, any, ContextType>;
    shareable?: ShareableDirectiveResolver<any, any, ContextType>;
    tag?: TagDirectiveResolver<any, any, ContextType>;
};
