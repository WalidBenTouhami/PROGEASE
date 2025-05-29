import { Component, OnInit } from '@angular/core';
import { Quiz } from '../../../core/models/quiz.model';
import { QuizService } from '../../../core/services/quiz.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';


@Component({
  selector: 'app-quiz-list',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './quiz-list.component.html',
  styleUrl: './quiz-list.component.css'
})
export class QuizListComponent implements OnInit{

  
  quizs: Quiz[] = [];
  loading = false;
  error = '';

  constructor(private quizService: QuizService, private router : Router,private auth: AuthService) {}


  ngOnInit(): void {
    this.loading = true;
      this.userId = this.auth.getId();
  this.quizService.getQuizs().subscribe({
    next: (response: any) => {
      console.log('API response:', response);
        this.loading = false;

      this.quizs = Array.isArray(response) ? response : response.data || response.quizs || [];

    },
    error: (err) => {
      console.error('Erreur lors du chargement des quizs:', err);
    }
  });
  }
  userId: string =''; 


  goToQuiz(quizId: string): void {
    if (!this.auth.isAuthenticated()) {
      this.error = 'Vous devez être connecté pour accéder à un quiz';
      return;
    }
    this.quizService.getQuizById(quizId).subscribe({
      next: (quiz) => {
        this.router.navigate(['/quiz', quizId]);
      },
      error: (err) => {
        this.error = 'Erreur lors de la récupération du quiz';
      }
    });
  }


}
