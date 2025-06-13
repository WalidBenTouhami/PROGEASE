import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Livrable } from '../models/livrable.model';

@Injectable({
  providedIn: 'root'
})
export class LivrableService {
  private endpoint = '/livrables';

  constructor(private apiService: ApiService) {}

  getLivrables(): Observable<Livrable[]> {
    return this.apiService.get<Livrable[]>(this.endpoint);
  }

  getLivrable(id: string): Observable<Livrable> {
    return this.apiService.get<Livrable>(`${this.endpoint}/${id}`);
  }

  createLivrable(livrable: Omit<Livrable, '_id' | 'creeLe' | 'majLe'>): Observable<Livrable> {
    return this.apiService.post<Livrable>(this.endpoint, livrable);
  }

  updateLivrable(id: string, livrable: Partial<Livrable>): Observable<Livrable> {
    return this.apiService.put<Livrable>(`${this.endpoint}/${id}`, livrable);
  }

  deleteLivrable(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }
}
