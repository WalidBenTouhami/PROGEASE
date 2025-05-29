import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { email: string; password: string }) {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, credentials)
      .pipe(tap(response => {
        localStorage.setItem('auth_token', response.token);
      }));
  }

  logout() {
    localStorage.removeItem('auth_token');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

    getUserName(): string {
    const token = localStorage.getItem('auth_token');
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.name || payload.email || 'Utilisateur';
    } catch (e) {
      return '';
    }
  }

      getId(): string {
    const token = localStorage.getItem('auth_token');
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || '0';
    } catch (e) {
      return '';
    }
  }

      getRole(): string {
    const token = localStorage.getItem('auth_token');
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || 'unknown';
    } catch (e) {
      return '';
    }
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  signup(data: { name: string, email: string, password: string,role?: string }) {
  return this.http.post(`${this.apiUrl}/register`, data);
}

}
