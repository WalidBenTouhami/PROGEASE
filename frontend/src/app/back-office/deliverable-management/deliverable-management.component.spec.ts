import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliverableManagementComponent } from './deliverable-management.component';

describe('DeliverableManagementComponent', () => {
  let component: DeliverableManagementComponent;
  let fixture: ComponentFixture<DeliverableManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliverableManagementComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DeliverableManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
