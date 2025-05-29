import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { QuizService } from '../../../core/services/quiz.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-quiz',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,FormsModule],
  templateUrl: './create-quiz.component.html',
  styleUrl: './create-quiz.component.css'
})
export class CreateQuizComponent implements OnInit{

    constructor(private fb: FormBuilder, private quizService: QuizService, private router: Router) {}

      quizForm!: FormGroup;

  ngOnInit(): void {
    this.quizForm = this.fb.group({
      titre: ['', Validators.required],
      description: [''],
      questions: this.fb.array([
        this.initQuestion()
      ])
    });
  }

  get questions(): FormArray {
    return this.quizForm.get('questions') as FormArray;
  }

  initQuestion(): FormGroup {
    return this.fb.group({
      question: ['', Validators.required],
      options: this.fb.array([
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required)
      ]),
      answer: ['', Validators.required]
    }, { validators: this.answerInOptionsValidator() });
  }

  addQuestion() {
    this.questions.push(this.initQuestion());
  }

  addOption(questionIndex: number) {
    const options = this.questions.at(questionIndex).get('options') as FormArray;
    options.push(this.fb.control('', Validators.required));
  }

  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

    getOptions(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('options') as FormArray;
  }

submitQuiz() {
  if (this.quizForm.valid) {
    const newQuiz = this.quizForm.value;
    console.log('Submitting quiz:', newQuiz);
    this.quizService.createQuiz(newQuiz).subscribe({
      next: (response) => {
        console.log('Quiz created successfully:', response);
        this.router.navigate(['/back-office/quiz']);
      },
      error: (error) => {
        console.error('Error creating quiz:', error);
      }
    });
  } else {
    this.markAllControlsAsTouched(this.quizForm);
    console.log('Form not valid');
  }
}

 answerInOptionsValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const options = control.get('options')?.value;
    const answer = control.get('answer')?.value;

    if (Array.isArray(options) && options.length > 0 && answer !== null) {
      return options.includes(answer) ? null : { answerNotInOptions: true };
    }

    return null; 
  };
}

private markAllControlsAsTouched(formGroup: FormGroup | FormArray) {
  Object.values(formGroup.controls).forEach(control => {
    if (control instanceof FormGroup || control instanceof FormArray) {
      this.markAllControlsAsTouched(control);
    } else {
      control.markAsTouched();
    }
  });
}


}