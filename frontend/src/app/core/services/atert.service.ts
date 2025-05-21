import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertSubject = new BehaviorSubject<string | null>(null);
  private alertTypeSubject = new BehaviorSubject<'success' | 'error' | 'info' | null>(null);

  // Observable pour le message d'alerte
  get alert$(): Observable<string | null> {
    return this.alertSubject.asObservable();
  }

  // Observable pour le type d'alerte
  get alertType$(): Observable<'success' | 'error' | 'info' | null> {
    return this.alertTypeSubject.asObservable();
  }

  // Affiche une alerte de succès
  success(message: string): void {
    this.alertTypeSubject.next('success');
    this.alertSubject.next(message);
  }

  // Affiche une alerte d'erreur
  error(message: string): void {
    this.alertTypeSubject.next('error');
    this.alertSubject.next(message);
  }

  // Affiche une alerte d'information
  info(message: string): void {
    this.alertTypeSubject.next('info');
    this.alertSubject.next(message);
  }

  // Réinitialise les alertes
  clear(): void {
    this.alertTypeSubject.next(null);
    this.alertSubject.next(null);
  }
}
