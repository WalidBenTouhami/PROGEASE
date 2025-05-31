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

export interface EvaluationCritere {
  nom: string;
  score: number;
  poids: number;
}

export interface Evaluation {
  id: string;
  projet: Projet;
  evaluateur: User;
  score: number;
  commentaires: string;
  criteres: EvaluationCritere[];
  aiRecommendations?: string;
  creeLe: string;
  majLe: string;
}

export interface EvaluationStats {
  moyenneScore: number;
  scoreMax: number;
  scoreMin: number;
  totalEvaluations: number;
}

export interface UpdateEvaluationInput {
  score?: number;
  commentaires?: string;
  criteres?: EvaluationCritere[];
}

export interface CreateEvaluationInput {
  projetId: string;
  evaluateurId: string;
  score: number;
  commentaires: string;
  criteres: EvaluationCritere[];
} 