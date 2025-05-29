import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetManagementComponent } from './projet-management.component';

describe('ProjetManagementComponent', () => {
  let component: ProjetManagementComponent;
  let fixture: ComponentFixture<ProjetManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjetManagementComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ProjetManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
