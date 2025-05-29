export interface Quiz {
  _id?: string; 
  titre: string;
  description?: string;
  questions: Question[];
  dateCreation?: Date;
}

export interface Question {
  question: string;
  options: string[];
  answer: string;
}
