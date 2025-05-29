import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Quiz } from '../../../core/models/quiz.model';
import { FormationService } from '../../../core/services/formation.service';
import { QuizService } from '../../../core/services/quiz.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-formation',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-formation.component.html',
  styleUrl: './create-formation.component.css'
})
export class CreateFormationComponent implements OnInit {

  formationForm!: FormGroup;
  allQuizzes: Quiz[] = [];
  selectedQuizIds: string[] = [];

  constructor(
    private fb: FormBuilder,
    private formationService: FormationService,
    private quizService: QuizService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.fetchQuizzes();
  }

  initForm() {
    this.formationForm = this.fb.group({
      titre: ['', Validators.required],
      description: [''],
      categorie: ['Developpement', Validators.required],
      duree: [0, [Validators.required, Validators.min(1)]],
      modules: this.fb.array([]),
      videos: this.fb.array([]),
      pdfs: this.fb.array([]),
      quizIds: this.fb.control([]),
    } , { validators: [this.formationCustomValidator] });
  }

  get modules(): FormArray {
    return this.formationForm.get('modules') as FormArray;
  }

  get videos(): FormArray {
    return this.formationForm.get('videos') as FormArray;
  }

  get pdfs(): FormArray {
    return this.formationForm.get('pdfs') as FormArray;
  }

  addModule() {
    this.modules.push(this.fb.control('', Validators.required));
  }

  addVideo() {
    this.videos.push(this.fb.control('', Validators.required));
  }

  addPdf() {
    this.pdfs.push(this.fb.control('', Validators.required));
  }

  fetchQuizzes() {
 this.quizService.getQuizs().subscribe({
    next: (response: any) => {
      console.log('API response:', response);

      // Adjust based on the real structure:
      this.allQuizzes = Array.isArray(response) ? response : response.data || response.quizs || [];
    },
    error: (err) => {
      console.error('Erreur lors du chargement des quizs:', err);
    }
  });
  }

  onQuizChange(id: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedQuizIds.push(id);
    } else {
      this.selectedQuizIds = this.selectedQuizIds.filter(qid => qid !== id);
    }
    this.formationForm.get('quizIds')?.setValue(this.selectedQuizIds);
    console.log('Selected Quiz IDs:', this.selectedQuizIds);
  }

  formationCustomValidator: ValidatorFn = (form: AbstractControl): ValidationErrors | null => {
  const videos = form.get('videos')?.value || [];
  const pdfs = form.get('pdfs')?.value || [];
  const quizIds = form.get('quizIds')?.value || [];

  if (videos.length === 0 || pdfs.length === 0 || quizIds.length === 0) {
    return { requiredArraysMissing: true };
  }

  return null;
};

onSubmit() {

  if (this.formationForm.invalid) {
    this.markAllControlsAsTouched(this.formationForm);
    console.log('Form is invalid');
    return;
  }

  const formValue = this.formationForm.value;

  const formationPayload = {
    titre: formValue.titre,
    description: formValue.description,
    categorie: formValue.categorie,
    duree: formValue.duree,
    modules: formValue.modules,
    contenu: {
      videos: formValue.videos,
      pdfs: formValue.pdfs,
      quiz: this.allQuizzes.filter(q => formValue.quizIds.includes(q._id))
    },
    utilisateursInscrits: []
  };

  this.formationService.createFormation(formationPayload).subscribe({
    next: () => this.router.navigate(['/back-office/formations']),
    error: err => console.error('Erreur lors de la création de la formation', err)
  });
}
markAllControlsAsTouched(formGroup: FormGroup | FormArray) {
  Object.values(formGroup.controls).forEach(control => {
    if (control instanceof FormGroup || control instanceof FormArray) {
      this.markAllControlsAsTouched(control);
    } else {
      control.markAsTouched();
    }
  });
}

}
