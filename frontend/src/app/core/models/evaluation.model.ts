export interface Projet {
  id: string;
  titre: string;
  description: string;
  statut: string;
  dateDebut: string;
  dateFin: string;
}

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
}

export interface CritereEvaluation {
  nom: string;
  note: number;
  poids: number;
}

export interface Evaluation {
  _id?: string;
  projetId: string;
  evaluateurId: string;
  note: number;
  commentaire?: string;
  criteres: CritereEvaluation[];
  dateEvaluation?: string;
  creeLe?: string;
  majLe?: string;
  
  projet?: Projet;
  evaluateur?: User;
}

export interface EvaluationStats {
  moyenneNote: number;
  noteMax: number;
  noteMin: number;
  totalEvaluations: number;
}

export interface UpdateEvaluationInput {
  note?: number;
  commentaire?: string;
  criteres?: CritereEvaluation[];
}

export interface CreateEvaluationInput {
  projetId: string;
  evaluateurId: string;
  note: number;
  commentaire: string;
  criteres: CritereEvaluation[];
} 