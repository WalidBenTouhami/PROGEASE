import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Quiz } from '../models/quiz.model';
import { Observable } from 'rxjs';
import { QuizSubmission } from '../models/quizResult.model';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrl = 'http://localhost:3000/api';
  
    constructor(private http: HttpClient, private router: Router) {}
    getQuizs(): Observable<Quiz[]> {
        return this.http.get<Quiz[]>(`${this.apiUrl}/quiz/quizzes`);
    }

    deleteQuiz(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/quiz/${id}`);
    }

    createQuiz(quiz: Quiz): Observable<Quiz> {
        return this.http.post<Quiz>(`${this.apiUrl}/quiz/create`, quiz);
    }

    getQuizById(id: string): Observable<Quiz> {
        return this.http.get<Quiz>(`${this.apiUrl}/quiz/quizzes/${id}`);
    }

    updateQuiz(id: string, quiz: Quiz): Observable<Quiz> {
        return this.http.put<Quiz>(`${this.apiUrl}/quiz/${id}`, quiz);
    }

submitQuiz(answers: string[], quizId: string): Observable<any> {
  return this.http.post(
    `${this.apiUrl}/quiz/submit`, 
    { quizId,answers }  
  );
}


}
