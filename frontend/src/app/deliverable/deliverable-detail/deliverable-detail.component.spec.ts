import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeliverableDetailComponent } from './deliverable-detail.component';

describe('DeliverableDetailComponent', () => {
  let component: DeliverableDetailComponent;
  let fixture: ComponentFixture<DeliverableDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliverableDetailComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DeliverableDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('devrait être créé', () => {
    expect(component).toBeTruthy();
  });
});
