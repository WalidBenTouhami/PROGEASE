import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliverableFormComponent } from './deliverable-form.component';

describe('DeliverableFormComponent', () => {
  let component: DeliverableFormComponent;
  let fixture: ComponentFixture<DeliverableFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliverableFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliverableFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
