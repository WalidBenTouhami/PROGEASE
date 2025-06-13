import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable().pipe(
    map(error => error || '')
  );

  constructor() {}

  handleError(error: Error | HttpErrorResponse): void {
    let errorMessage: string;

    if (error instanceof HttpErrorResponse) {
      // Erreur côté serveur
      errorMessage = error.error?.message || error.message || 'Une erreur est survenue';
    } else {
      // Erreur côté client
      errorMessage = error.message || 'Une erreur est survenue';
    }

    this.errorSubject.next(errorMessage);
    
    // Effacer le message d'erreur après 5 secondes
    setTimeout(() => {
      this.clearError();
    }, 5000);
  }

  showError(message: string): void {
    this.errorSubject.next(message);
  }

  clearError(): void {
    this.errorSubject.next(null);
  }

  showSuccess(message: string) {
    // Implementation of showSuccess method
  }

  showWarning(message: string) {
    // Implementation of showWarning method
  }

  showInfo(message: string) {
    // Implementation of showInfo method
  }
} 