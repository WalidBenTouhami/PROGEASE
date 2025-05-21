import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Deliverable, DeliverableStatuses } from '../../core/models/deliverable.model';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';

@Component({
  selector: 'app-deliverable-form',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './deliverable-form.component.html',
  styleUrl: './deliverable-form.component.css'
})
export class DeliverableFormComponent implements OnInit {
  @Input() livrable?: Deliverable;
  @Output() formSubmit = new EventEmitter<Deliverable>();

  livrableForm!: FormGroup;
  statutsLivrable = [
    DeliverableStatuses.EN_ATTENTE,
    DeliverableStatuses.EN_RETARD,
    DeliverableStatuses.TERMINE
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.livrableForm = this.fb.group({
      nom: [this.livrable?.nom || '', Validators.required],
      description: [this.livrable?.description || '', Validators.required],
      dateLimite: [this.livrable?.dateLimite ? this.livrable.dateLimite.toString().substring(0, 10) : '', Validators.required],
      urlDepot: [this.livrable?.urlDepot || '', [Validators.required]],
      statut: [this.livrable?.statut || DeliverableStatuses.EN_ATTENTE, Validators.required]
    });
  }

  onSubmit() {
    if (this.livrableForm.valid) {
      this.formSubmit.emit(this.livrableForm.value);
    }
  }
}
