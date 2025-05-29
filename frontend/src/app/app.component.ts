// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  titre = 'Application de gestion de projets';

  constructor(public auth: AuthService) {}

  get isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

  get userName(): string {
    return this.auth.getUserName(); 
  }
}
