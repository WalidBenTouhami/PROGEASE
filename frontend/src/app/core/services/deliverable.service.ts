import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Deliverable } from '../models/deliverable.model';

@Injectable({
  providedIn: 'root'
})
export class DeliverableService {
  private baseUrl = `${environment.apiUrl}/deliverables`;

  constructor(private http: HttpClient) {}

  recupererLivrablesParProjet(projetId: string) {
    return this.http.get<Deliverable[]>(`${this.baseUrl}/${projetId}`);
  }

  ajouterLivrable(data: Deliverable) {
    return this.http.post<Deliverable>(this.baseUrl, data);
  }

  mettreAJourLivrable(livrableId: string, data: Deliverable) {
    return this.http.put<Deliverable>(`${this.baseUrl}/${livrableId}`, data);
  }

  supprimerLivrable(livrableId: string) {
    return this.http.delete(`${this.baseUrl}/${livrableId}`);
  }
}
