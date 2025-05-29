import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Formation } from '../models/formation.model';

@Injectable({
  providedIn: 'root'
})
export class FormationService {
    private apiUrl = 'http://localhost:3000/api';

  constructor(private http : HttpClient, private router: Router) { }

  getAllFormations(): Observable<Formation[]> {
    return this.http.get<Formation[]>(`${this.apiUrl}/formations`);
  }

  getFormationById(id: string): Observable<Formation> {
    return this.http.get<Formation>(`${this.apiUrl}/formations/${id}`);
  }

  createFormation(formation: Formation): Observable<Formation> {
    return this.http.post<Formation>(`${this.apiUrl}/formations`, formation);
  }

    addUserToFormation(formationId: string, userId: string) {
    return this.http.post(`${this.apiUrl}/formations/${formationId}/ajouter-utilisateur`, { userId });
  }

}
