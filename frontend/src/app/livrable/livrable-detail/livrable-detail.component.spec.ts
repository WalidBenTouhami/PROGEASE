import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LivrableDetailComponent } from './livrable-detail.component';

describe('DeliverableDetailComponent', () => {
  let component: LivrableDetailComponent;
  let fixture: ComponentFixture<LivrableDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivrableDetailComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LivrableDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('devrait être créé', () => {
    expect(component).toBeTruthy();
  });
});
