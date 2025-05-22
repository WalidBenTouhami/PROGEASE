import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Livrable } from '../models/livrable.model';

@Injectable({
  providedIn: 'root'
})
export class LivrableService {
  private baseUrl = `${environment.apiUrl}/livrables`;

  constructor(private http: HttpClient) {}

  recupererLivrablesParProjet(projetId: string) {
    return this.http.get<Livrable[]>(`${this.baseUrl}/${projetId}`);
  }

  ajouterLivrable(data: Livrable) {
    return this.http.post<Livrable>(this.baseUrl, data);
  }

  mettreAJourLivrable(livrableId: string, data: Livrable) {
    return this.http.put<Livrable>(`${this.baseUrl}/${livrableId}`, data);
  }

  supprimerLivrable(livrableId: string) {
    return this.http.delete(`${this.baseUrl}/${livrableId}`);
  }
}
