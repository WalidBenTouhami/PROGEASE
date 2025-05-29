export interface QuizResult {
  _id?: string;
  userId: string;
  quizId: string;
  isPassed: boolean;
}

export interface QuizSubmission {
  answers: string[];
}