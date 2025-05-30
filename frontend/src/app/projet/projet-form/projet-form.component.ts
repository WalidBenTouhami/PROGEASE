import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProjetService } from '../../core/services/projet.service';
import { Projet, StatutProjet } from '../../core/models/projet.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-projet-form',
  templateUrl: './projet-form.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./projet-form.component.css'],
})
export class ProjetFormComponent implements OnInit {
  projetForm: FormGroup;
  isEditing = false;
  projetId: string | null = null;
  statutOptions = Object.values(StatutProjet);
  availableUsers: any[] = [];

  constructor(
    private fb: FormBuilder,
    private projetService: ProjetService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.projetForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadUsers();

    this.projetId = this.route.snapshot.paramMap.get('id');
    if (this.projetId) {
      this.isEditing = true;
      this.projetService.recupererProjetParId(this.projetId).subscribe(projet => {
        this.updateFormWithProjet(projet);
      });
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      titre: ['', Validators.required],
      description: ['', Validators.required],
      equipe: [[]],
      tuteur: [''],
      competences: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      statut: [StatutProjet.BROUILLON, Validators.required]
    });
  }

  private updateFormWithProjet(projet: Projet): void {
    this.projetForm.patchValue({
      titre: projet.titre,
      description: projet.description,
      equipe: projet.equipe,
      tuteur: projet.tuteur,
      competences: projet.competences ? projet.competences.join(',') : '',
      dateDebut: this.formatDateForInput(projet.dateDebut),
      dateFin: this.formatDateForInput(projet.dateFin),
      statut: projet.statut
    });
  }

  private formatDateForInput(date: Date): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.projetForm.invalid) return;

    const formValue = this.projetForm.value;
    const projet: Projet = {
      titre: formValue.titre,
      description: formValue.description,
      equipe: formValue.equipe || [],
      tuteur: formValue.tuteur,
      competences: (formValue.competences || '').split(',').map((c: string) => c.trim()).filter((c: string) => c),
      dateDebut: new Date(formValue.dateDebut),
      dateFin: new Date(formValue.dateFin),
      livrables: [], // Sera rempli séparément
      statut: formValue.statut
    };

    let action$: Observable<Projet>;

    if (this.isEditing && this.projetId) {
      action$ = this.projetService.mettreAJourProjet(this.projetId, projet);
    } else {
      action$ = this.projetService.creerProjet(projet);
    }

    action$.subscribe({
      next: () => this.router.navigate(['/projets']),
      error: (error) => console.error('Error saving project:', error)
    });
  }

  // Placeholder pour le chargement des utilisateurs (à implémenter selon vos besoins)
  private loadUsers() {
    this.availableUsers = [];
  }
}
