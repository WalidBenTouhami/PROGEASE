import { Component, OnInit } from '@angular/core';
import { Quiz } from '../../../core/models/quiz.model';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { QuizService } from '../../../core/services/quiz.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [RouterModule,CommonModule,ReactiveFormsModule,FormsModule],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.css'
})
export class QuizComponent implements OnInit {
  quiz!: Quiz;
  userAnswers: string[] = [];
  resultMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    const quizId = this.route.snapshot.paramMap.get('id');
    if (quizId) {
      this.quizService.getQuizById(quizId).subscribe({
        next: (quiz) => {
          this.quiz = quiz;
          this.userAnswers = new Array(quiz.questions.length).fill('');
        },
        error: () => {
          this.resultMessage = "Erreur lors du chargement du quiz.";
        }
      });
    }
  }

  submit(): void {
        const quizId = this.route.snapshot.paramMap.get('id');

    this.quizService.submitQuiz(this.userAnswers,quizId!).subscribe({
      next: (res) => {
        this.resultMessage = `Résultat : ${res.note}`;
      },
      error: () => {
        this.resultMessage = "Erreur lors de la soumission.";
      }
    });
  }
}
