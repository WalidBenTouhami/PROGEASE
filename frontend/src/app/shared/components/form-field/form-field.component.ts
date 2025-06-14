import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  template: `
    <mat-form-field [appearance]="appearance" [class]="fieldClass">
      <mat-label>{{ label }}</mat-label>
      <input
        matInput
        [type]="type"
        [placeholder]="placeholder"
        [formControl]="control"
        [required]="required"
        [readonly]="readonly"
        (input)="onInput($event)"
        (blur)="onBlur()"
      />
      <mat-error *ngIf="control?.errors?.['required'] && control?.touched">
        {{ label }} is required
      </mat-error>
      <mat-error *ngIf="control?.errors?.['email'] && control?.touched">
        Please enter a valid email address
      </mat-error>
      <mat-error *ngIf="control?.errors?.['minlength'] && control?.touched">
        {{ label }} must be at least {{ control?.errors?.['minlength'].requiredLength }} characters
      </mat-error>
      <mat-error *ngIf="control?.errors?.['maxlength'] && control?.touched">
        {{ label }} must not exceed {{ control?.errors?.['maxlength'].requiredLength }} characters
      </mat-error>
      <mat-error *ngIf="control?.errors?.['pattern'] && control?.touched">
        {{ errorMessage || 'Invalid format' }}
      </mat-error>
    </mat-form-field>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .mat-form-field {
      width: 100%;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormFieldComponent),
      multi: true
    }
  ]
})
export class FormFieldComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() required = false;
  @Input() readonly = false;
  @Input() appearance: 'fill' | 'outline' = 'outline';
  @Input() fieldClass = '';
  @Input() errorMessage = '';

  value = '';
  disabled = false;
  control: any;

  private onChange: any = () => {};
  private onTouched: any = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);
  }

  onBlur(): void {
    this.onTouched();
  }
} 