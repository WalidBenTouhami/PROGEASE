import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly utilisateur_KEY = 'utilisateur_data';

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, credentials).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          localStorage.setItem(this.utilisateur_KEY, JSON.stringify(response.utilisateur));
        }
      })
    );
  }

  logout(): Observable<void> {
    return new Observable(subscriber => {
      try {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.utilisateur_KEY);
        subscriber.next();
        subscriber.complete();
      } catch (error) {
        subscriber.error(error);
      }
    });
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentutilisateur(): any {
    const utilisateurData = localStorage.getItem(this.utilisateur_KEY);
    return utilisateurData ? JSON.parse(utilisateurData) : null;
  }
}
