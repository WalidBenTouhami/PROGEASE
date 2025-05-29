import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { QuizService } from '../../../core/services/quiz.service';
import { Router, RouterModule } from '@angular/router';
import { Quiz } from '../../../core/models/quiz.model';

@Component({
  selector: 'app-quiz-management',
  templateUrl: './quiz-management.component.html',
  standalone: true,
  imports: [CommonModule,RouterModule],
  styleUrls: ['./quiz-management.component.css'],
})
export class QuizManagementComponent implements OnInit {
  quizs: Quiz[] = [];
  paginatedQuizs: Quiz[] = [];

  pageSize = 5;
  currentPage = 1;
  totalPages = 1;

  constructor(private quizService: QuizService, private _router: Router) {}

ngOnInit(): void {
  this.quizService.getQuizs().subscribe({
    next: (response: any) => {
      console.log('API response:', response);

      this.quizs = Array.isArray(response) ? response : response.data || response.quizs || [];

      this.totalPages = Math.ceil(this.quizs.length / this.pageSize);
      this.updatePagination();
    },
    error: (err) => {
      console.error('Erreur lors du chargement des quizs:', err);
    }
  });
}

createQuiz() {
  this._router.navigate(['/back-office/quiz/create']);
}

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedQuizs = this.quizs.slice(start, end);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  viewQuiz(quiz: Quiz): void {
    this._router.navigate(['/back-office/quiz', quiz._id]);
  }




}
