import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Utilisateur, UtilisateurRole } from '../models/utilisateur.model';
import { map, tap } from 'rxjs/operators';

export interface LoginResponse {
  token: string;
  user: Utilisateur;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  role: UtilisateurRole;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<Utilisateur | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';
  private readonly API_URL = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Vérifier si un utilisateur est déjà connecté au chargement
    const storedUser = localStorage.getItem('current_user');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, { email, password }).pipe(
      tap(response => {
        this.setToken(response.token);
        this.setCurrentUser(response.user);
      })
    );
  }

  register(userData: RegisterRequest): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(`${this.API_URL}/register`, userData);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/reset-password`, { token, password });
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): Observable<Utilisateur> {
    const cachedUser = this.getCurrentUserFromStorage();
    if (cachedUser) {
      return of(cachedUser);
    }
    return this.http.get<Utilisateur>(`${this.API_URL}/me`).pipe(
      tap(user => this.setCurrentUser(user))
    );
  }

  getUserRole(): Observable<UtilisateurRole> {
    return this.getCurrentUser().pipe(
      map(user => user.role)
    );
  }

  hasRole(role: UtilisateurRole): Observable<boolean> {
    return this.getUserRole().pipe(
      map(userRole => userRole === role)
    );
  }

  refreshToken(): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/refresh-token`, {})
      .pipe(
        tap(response => {
          this.setToken(response.token);
          this.setCurrentUser(response.user);
        })
      );
  }

  updateUser(user: Partial<Utilisateur>): Observable<Utilisateur> {
    return this.http.patch<Utilisateur>(`${this.API_URL}/me`, user).pipe(
      tap(updatedUser => this.setCurrentUser(updatedUser))
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/change-password`, {
      currentPassword,
      newPassword
    });
  }

  private getCurrentUserFromStorage(): Utilisateur | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    try {
      const user = JSON.parse(userStr);
      return {
        ...user,
        creeLe: user.creeLe,
        majLe: user.majLe,
        derniereConnexion: user.derniereConnexion
      };
    } catch {
      return null;
    }
  }

  private setCurrentUser(user: Utilisateur): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }
}
