import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivrableFormComponent } from './livrable-form.component';

describe('DeliverableFormComponent', () => {
  let component: LivrableFormComponent;
  let fixture: ComponentFixture<LivrableFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivrableFormComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LivrableFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
