import { Component, OnInit } from '@angular/core';
import { Formation } from '../../../core/models/formation.model';
import { FormationService } from '../../../core/services/formation.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-formation-list',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './formation-list.component.html',
  styleUrl: './formation-list.component.css'
})
export class FormationListComponent implements OnInit{

  
  formations: Formation[] = [];
  loading = false;
  error = '';

  constructor(private formationService: FormationService, private auth: AuthService) {}

  checkIfUserIsEnrolled(formationId: string): boolean {
    return this.formations.some(formation => formation.utilisateursInscrits.includes(this.userId) && formation._id === formationId);
  }

  ngOnInit(): void {
    this.loading = true;
      this.userId = this.auth.getId();
    this.formationService.getAllFormations().subscribe({
      next: (data) => {
        this.formations = data;
        console.log('Formations chargées:', this.formations[0]);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des formations';
        this.loading = false;
      }
    });
  }
  userId: string =''; 

joinFormation(formationId: string): void {
  if (!this.auth.isAuthenticated()) {
    this.error = 'Vous devez être connecté pour rejoindre une formation';
    return;
  }


  this.formationService.addUserToFormation(formationId, this.userId).subscribe({
    next: (response) => {
      this.error = ''; 
    },
    error: (err) => {
      if (typeof err.error === 'string') {
        this.error = err.error;
      } else if (err.error?.error) {
        this.error = err.error.error; 
      } else {
        this.error = 'Erreur lors de l\'inscription à la formation';
      }
    }
  });
}


}
