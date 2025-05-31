import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertSubject = new BehaviorSubject<string | null>(null);
  private alertTypeSubject = new BehaviorSubject<'success' | 'error' | 'info' | null>(null);

  get alert$(): Observable<string | null> {
    return this.alertSubject.asObservable();
  }

  get alertType$(): Observable<'success' | 'error' | 'info' | null> {
    return this.alertTypeSubject.asObservable();
  }

  success(message: string): void {
    this.alertTypeSubject.next('success');
    this.alertSubject.next(message);
  }

  error(message: string): void {
    this.alertTypeSubject.next('error');
    this.alertSubject.next(message);
  }

  info(message: string): void {
    this.alertTypeSubject.next('info');
    this.alertSubject.next(message);
  }

  clear(): void {
    this.alertTypeSubject.next(null);
    this.alertSubject.next(null);
  }
}
