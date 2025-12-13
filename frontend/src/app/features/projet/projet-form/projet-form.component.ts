import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { ProjetService } from '../../../core/services/projet.service';
import { Projet, StatutProjet } from '../../../core/models/projet.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-projet-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule
  ],
  templateUrl: './projet-form.component.html',
  styleUrls: ['./projet-form.component.css']
})
export class ProjetFormComponent implements OnInit {
  projetForm: FormGroup;
  isEditing = false;
  projetId?: string;
  erreur = '';
  statutOptions = Object.values(StatutProjet);
  availableutilisateurs: any[] = [];

  constructor(
    private fb: FormBuilder,
    private projetService: ProjetService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.projetForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      statut: [StatutProjet.EN_COURS, Validators.required],
      equipe: [[], Validators.required],
      competences: [[], Validators.required],
      tuteur: ['']
    }, { validators: this.dateRangeValidator });
  }

  ngOnInit(): void {
    this.loadutilisateurs();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing = true;
      this.projetId = id;
      this.chargerProjet(id);
    }
  }

  onSubmit(): void {
    if (this.projetForm.valid) {
      const projet: Projet = this.projetForm.value;

      if (this.isEditing && this.projetId) {
        this.projetService.mettreAJourProjet(this.projetId, projet).subscribe({
          next: () => this.router.navigate(['/projets']),
          error: () => this.erreur = 'Erreur lors de la sauvegarde du projet.'
        });
      } else {
        this.projetService.creerProjet(projet).subscribe({
          next: () => this.router.navigate(['/projets']),
          error: () => this.erreur = 'Erreur lors de la sauvegarde du projet.'
        });
      }
    }
  }

  resetForm(): void {
    this.projetForm.reset({
      titre: '',
      description: '',
      dateDebut: '',
      dateFin: '',
      statut: StatutProjet.EN_COURS,
      equipe: [],
      competences: [],
      tuteur: ''
    });
    this.erreur = '';
  }

  private chargerProjet(id: string): void {
    this.projetService.recupererProjetParId(id).subscribe({
      next: (projet: Projet) => {
        this.projetForm.patchValue({
          titre: projet.titre,
          description: projet.description,
          dateDebut: projet.dateDebut,
          dateFin: projet.dateFin,
          statut: projet.statut,
          equipe: projet.equipe,
          competences: projet.competences,
          tuteur: projet.tuteur
        });
      },
      error: () => {
        this.erreur = 'Erreur lors du chargement du projet.';
        this.router.navigate(['/projets']);
      }
    });
  }

  private dateRangeValidator(group: FormGroup): { [key: string]: any } | null {
    const dateDebut = group.get('dateDebut')?.value;
    const dateFin = group.get('dateFin')?.value;

    if (dateDebut && dateFin && dateDebut > dateFin) {
      return { dateRange: true };
    }
    return null;
  }

  // Placeholder pour le chargement des utilisateurs (à implémenter selon vos besoins)
  private loadutilisateurs() {
    this.availableutilisateurs = [];
  }
}
