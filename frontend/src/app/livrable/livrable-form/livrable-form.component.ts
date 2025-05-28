import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Livrable, StatutLivrable } from '../../core/models/livrable.model';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';

@Component({
  selector: 'app-livrable-form',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './livrable-form.component.html',
  styleUrl: './livrable-form.component.css'
})
export class LivrableFormComponent implements OnInit {
  @Input() livrable?: Livrable;
  @Output() formSubmit = new EventEmitter<Livrable>();

  livrableForm!: FormGroup;
  statutsLivrable = [
    StatutLivrable.EN_ATTENTE,
    StatutLivrable.EN_RETARD,
    StatutLivrable.TERMINE
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.livrableForm = this.fb.group({
      intitule: [this.livrable?.intitule || '', Validators.required],
      description: [this.livrable?.description || '', Validators.required],
      dateLimite: [this.livrable?.dateLimite ? this.livrable.dateLimite.toString().substring(0, 10) : '', Validators.required],
      // urlDepot: [this.livrable?.urlDepot || '', [Validators.required]],
      statut: [this.livrable?.statut || StatutLivrable.EN_ATTENTE, Validators.required]
    });
  }

  onSubmit() {
    if (this.livrableForm.valid) {
      this.formSubmit.emit(this.livrableForm.value);
    }
  }
}
