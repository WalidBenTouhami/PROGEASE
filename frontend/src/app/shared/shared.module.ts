import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Material imports
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

// Components
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { ErrorBoundaryComponent } from './components/error-boundary/error-boundary.component';
import { FormFieldComponent } from './components/form-field/form-field.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';

// Directives
import { DebounceClickDirective } from './directives/debounce-click.directive';
import { ScrollTrackerDirective } from './directives/scroll-tracker.directive';

// Pipes
import { FormatDatePipe } from './pipes/format-date.pipe';
import { TruncatePipe } from './pipes/truncate.pipe';

const materialModules = [
  MatButtonModule,
  MatCardModule,
  MatInputModule,
  MatFormFieldModule,
  MatIconModule,
  MatProgressBarModule,
  MatSnackBarModule,
  MatDialogModule,
  MatTooltipModule
];

const components = [
  LoadingSpinnerComponent,
  ErrorBoundaryComponent,
  FormFieldComponent,
  PageHeaderComponent
];

const directives = [
  DebounceClickDirective,
  ScrollTrackerDirective
];

const pipes = [
  FormatDatePipe,
  TruncatePipe
];

@NgModule({
  declarations: [
    ...components,
    ...directives,
    ...pipes
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ...materialModules
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ...materialModules,
    ...components,
    ...directives,
    ...pipes
  ]
})
export class SharedModule { } 