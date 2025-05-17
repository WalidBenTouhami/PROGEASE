import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Project } from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private baseUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  recupererProjets() {
    return this.http.get<Project[]>(this.baseUrl);
  }

  recupererProjet(id: string) {
    return this.http.get<Project>(`${this.baseUrl}/${id}`);
  }

  creerProjet(data: Project) {
    return this.http.post<Project>(this.baseUrl, data);
  }

  mettreAJourProjet(id: string, data: Project) {
    return this.http.put<Project>(`${this.baseUrl}/${id}`, data);
  }

  supprimerProjet(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
