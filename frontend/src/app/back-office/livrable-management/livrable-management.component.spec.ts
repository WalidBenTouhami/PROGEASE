import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LivrableManagementComponent } from './livrable-management.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';

describe('LivrableManagementComponent', () => {
  let component: LivrableManagementComponent;
  let fixture: ComponentFixture<LivrableManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        HttpClientTestingModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatCardModule,
        MatChipsModule,
        LivrableManagementComponent
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LivrableManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter livrables based on search term', () => {
    component.searchTerm = 'Documentation';
    component.filterLivrables();
    expect(component.filteredLivrables.length).toBe(1);
    expect(component.filteredLivrables[0].titre).toContain('Documentation');
  });

  it('should filter livrables based on status', () => {
    component.selectedStatus = 'En cours';
    component.filterLivrables();
    expect(component.filteredLivrables.length).toBe(1);
    expect(component.filteredLivrables[0].statut).toBe('En cours');
  });
});
