import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private apiUrl = `${environment.apiUrl}/utilisateurs`;
  private tokenRefreshInterval = 15 * 60 * 1000; // 15 minutes
  private sessionTimeout = 30 * 60 * 1000; // 30 minutes
  private lastActivity = new Date().getTime();
  private sessionTimer: any;

  private isAuthenticated = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticated.asObservable();

  constructor(private http: HttpClient) {
    this.setupSessionTimer();
    this.setupActivityTracking();
  }

  private setupSessionTimer(): void {
    timer(this.tokenRefreshInterval, this.tokenRefreshInterval).subscribe(() => {
      this.rafraichirToken().subscribe();
    });
  }

  private setupActivityTracking(): void {
    document.addEventListener('click', () => this.updateLastActivity());
    document.addEventListener('keypress', () => this.updateLastActivity());
    document.addEventListener('mousemove', () => this.updateLastActivity());
  }

  private updateLastActivity(): void {
    this.lastActivity = new Date().getTime();
  }

  rafraichirToken(): Observable<any> {
    return this.http.post(`${this.apiUrl}/rafraichir-token`, {}).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          this.isAuthenticated.next(true);
        }
      })
    );
  }

  deconnexion(): Observable<any> {
    return this.http.post(`${this.apiUrl}/deconnexion`, {}).pipe(
      tap(() => {
        localStorage.removeItem('token');
        this.isAuthenticated.next(false);
      })
    );
  }

  verifierSession(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;

    const now = new Date().getTime();
    if (now - this.lastActivity > this.sessionTimeout) {
      this.deconnexion().subscribe();
      return false;
    }

    return true;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
    this.isAuthenticated.next(true);
  }
} 