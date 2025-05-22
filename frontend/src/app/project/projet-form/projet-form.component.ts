import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Project, ProjectStatuses } from '../../core/models/projet.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [],
  templateUrl: './projet-form.component.html',
  styleUrls: ['./projet-form.component.css']
})
export class ProjetFormComponent implements OnInit {
  @Input() projet?: Project;
  @Output() formSubmit = new EventEmitter<Project>();

  projetForm!: FormGroup;
  statutsProjet = [
    ProjectStatuses.BROUILLON,
    ProjectStatuses.EN_COURS,
    ProjectStatuses.TERMINE,
    ProjectStatuses.ARCHIVE
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.projetForm = this.fb.group({
      titre: [this.projet?.titre || '', Validators.required],
      description: [this.projet?.description || '', Validators.required],
      equipe: [this.projet?.equipe ? this.projet.equipe.join(',') : '', Validators.required],
      tuteur: [this.projet?.tuteur || '', Validators.required],
      competences: [this.projet?.competences ? this.projet.competences.join(',') : '', Validators.required],
      dateDebut: [this.projet?.dateDebut ? this.toDateInputValue(this.projet.dateDebut) : '', Validators.required],
      dateFin: [this.projet?.dateFin ? this.toDateInputValue(this.projet.dateFin) : '', Validators.required],
      statut: [this.projet?.statut || ProjectStatuses.BROUILLON, Validators.required]
    });
  }

  toDateInputValue(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().substring(0, 10);
  }

  onSubmit() {
    if (this.projetForm.valid) {
      const formValue = this.projetForm.value;
      const projet: Project = {
        ...formValue,
        equipe: formValue.equipe.split(',').map((id: string) => id.trim()).filter((id: string) => id),
        competences: formValue.competences.split(',').map((c: string) => c.trim()).filter((c: string) => c),
        dateDebut: formValue.dateDebut,
        dateFin: formValue.dateFin
      };
      this.formSubmit.emit(projet);
    }
  }
}
