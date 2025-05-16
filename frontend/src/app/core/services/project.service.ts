//src/app/core/services/project.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private baseUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  getProjects() {
    return this.http.get(this.baseUrl);
  }

  getProject(id: string) {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  createProject(data: any) {
    return this.http.post(this.baseUrl, data);
  }

  updateProject(id: string, data: any) {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  deleteProject(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
