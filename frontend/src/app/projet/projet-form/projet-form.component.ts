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
      competences: this.fb.array([]),
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      statut: [StatutProjet.BROUILLON, Validators.required]
    });
  }

  private updateFormWithProjet(projet: Projet): void {
    // Reset competences FormArray
    while (this.competences.length) {
      this.competences.removeAt(0);
    }

    // Add each competence to FormArray
    if (projet.competences && projet.competences.length) {
      projet.competences.forEach(comp => {
        this.competences.push(this.fb.control(comp));
      });
    }

    // Update form values
    this.projetForm.patchValue({
      titre: projet.titre,
      description: projet.description,
      equipe: projet.equipe,
      tuteur: projet.tuteur,
      dateDebut: this.formatDateForInput(projet.dateDebut),
      dateFin: this.formatDateForInput(projet.dateFin),
      statut: projet.statut
    });
  }

  private formatDateForInput(date: Date): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  get competences(): FormArray {
    return this.projetForm.get('competences') as FormArray;
  }

  addCompetence(): void {
    this.competences.push(this.fb.control(''));
  }

  removeCompetence(index: number): void {
    this.competences.removeAt(index);
  }

  onSubmit(): void {
    if (this.projetForm.invalid) return;

    const formValue = this.projetForm.value;
    const projet: Projet = {
      titre: formValue.titre,
      description: formValue.description,
      equipe: formValue.equipe || [],
      tuteur: formValue.tuteur,
      competences: formValue.competences.filter((c: string) => c.trim() !== ''),
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
