import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Livrable, StatutLivrable } from '../../core/models/livrable.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-livrable-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './livrable-form.component.html',
  styleUrl: './livrable-form.component.css'
})
export class LivrableFormComponent implements OnInit {
  @Input() livrable?: Livrable;
  @Input() projetId?: string;
  @Output() formSubmit = new EventEmitter<Livrable>();

  livrableForm!: FormGroup;
  statutsLivrable = Object.values(StatutLivrable);

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.livrableForm = this.fb.group({
      intitule: [this.livrable?.intitule || '', Validators.required],
      description: [this.livrable?.description || '', Validators.required],
      dateLimite: [
        this.livrable?.dateLimite ? this.formatDate(this.livrable.dateLimite) : '',
        Validators.required
      ],
      projetId: [this.projetId || this.livrable?.projetId || '', Validators.required],
      statut: [this.livrable?.statut || StatutLivrable.EN_ATTENTE, Validators.required]
    });
  }

  private formatDate(date: Date): string {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    return date.toISOString().substring(0, 10);
  }

  onSubmit() {
    if (this.livrableForm.valid) {
      const formValue = this.livrableForm.value;
      const livrable: Livrable = {
        intitule: formValue.intitule,
        description: formValue.description,
        dateLimite: new Date(formValue.dateLimite),
        projetId: formValue.projetId,
        statut: formValue.statut
      };

      if (this.livrable?._id) {
        livrable._id = this.livrable._id;
      }

      this.formSubmit.emit(livrable);
    }
  }
}
