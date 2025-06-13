import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { map, tap } from 'rxjs/operators';

export interface Utilisateur {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  roles: string[];
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private utilisateurSubject = new BehaviorSubject<Utilisateur | null>(null);
  public utilisateur$ = this.utilisateurSubject.asObservable();
  public isAuthenticated$ = this.utilisateur$.pipe(
    map(utilisateur => !!utilisateur)
  );

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.chargerUtilisateur();
  }

  private chargerUtilisateur(): void {
    const utilisateur = localStorage.getItem('utilisateur');
    if (utilisateur) {
      this.utilisateurSubject.next(JSON.parse(utilisateur));
    }
  }

  login(email: string, motDePasse: string): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(`${environment.apiUrl}/auth/login`, {
      email,
      motDePasse
    }).pipe(
      tap(utilisateur => {
        localStorage.setItem('utilisateur', JSON.stringify(utilisateur));
        this.utilisateurSubject.next(utilisateur);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('utilisateur');
    this.utilisateurSubject.next(null);
    this.router.navigate(['/connexion']);
  }

  getToken(): string | null {
    const utilisateur = this.utilisateurSubject.value;
    return utilisateur ? utilisateur.token : null;
  }

  hasRole(role: string): boolean {
    const utilisateur = this.utilisateurSubject.value;
    return utilisateur ? utilisateur.roles.includes(role) : false;
  }
} 