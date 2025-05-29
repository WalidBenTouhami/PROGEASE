import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
    private apiUrl = 'http://localhost:3000/api';
  
    constructor(private http: HttpClient, private router: Router) {}

    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/users`);
    }

    getUserById(id: string): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/users/${id}`);
    }

    deleteUser(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
    }
    
    updateUser(user: User): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/users/${user._id}`, user);
    }

}
