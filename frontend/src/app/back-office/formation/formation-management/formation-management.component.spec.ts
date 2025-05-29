import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormationManagementComponent } from './formation-management.component';

describe('FormationManagementComponent', () => {
  let component: FormationManagementComponent;
  let fixture: ComponentFixture<FormationManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormationManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormationManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
