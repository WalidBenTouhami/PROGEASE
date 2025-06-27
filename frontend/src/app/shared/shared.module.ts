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

// Components (standalone)
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { ErrorBoundaryComponent } from './components/error-boundary/error-boundary.component';
import { FormFieldComponent } from './components/form-field/form-field.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';

// Directives (standalone)
import { DebounceClickDirective } from './directives/debounce-click.directive';
import { ScrollTrackerDirective } from './directives/scroll-tracker.directive';

// Pipes (standalone)
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

const standaloneComponents = [
  LoadingSpinnerComponent,
  ErrorBoundaryComponent,
  FormFieldComponent,
  PageHeaderComponent
];

const standaloneDirectives = [
  DebounceClickDirective,
  ScrollTrackerDirective
];

const standalonePipes = [
  FormatDatePipe,
  TruncatePipe
];

@NgModule({
  declarations: [
    // Remove standalone components, directives, and pipes from declarations
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ...materialModules,
    // Import standalone components, directives, and pipes
    ...standaloneComponents,
    ...standaloneDirectives,
    ...standalonePipes
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ...materialModules
    // Remove standalone components from exports since they can't be exported from NgModule
  ]
})
export class SharedModule { } 