import { Quiz } from "./quiz.model";

export interface Formation {
  _id?: string;
  titre: string;
  description?: string;
  categorie: 'Développement' | 'IA' | 'Gestion de projet';
  duree: number;
  contenu: {
    videos: string[];
    pdfs: string[];
    quiz: Quiz[]; 
  };
  modules: string[];
  utilisateursInscrits: string[]; 
  dateCreation?: Date;
}
