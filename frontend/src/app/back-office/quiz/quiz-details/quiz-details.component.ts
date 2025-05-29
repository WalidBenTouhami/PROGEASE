import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuizService } from '../../../core/services/quiz.service';
import { Quiz } from '../../../core/models/quiz.model';

@Component({
  selector: 'app-quiz-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-details.component.html',
  styleUrl: './quiz-details.component.css'
})
export class QuizDetailsComponent {

    quiz: Quiz | null = null;
  loading = true;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private quizService: QuizService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.quizService.getQuizById(id).subscribe({
        next: (data) => {
          this.quiz = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Quiz introuvable ou erreur serveur.';
          this.loading = false;
        }
      });
    }
  }

}
