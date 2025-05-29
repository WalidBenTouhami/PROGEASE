import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivrableListComponent } from './livrable-list.component';

describe('LivrableListComponent', () => {
  let component: LivrableListComponent;
  let fixture: ComponentFixture<LivrableListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivrableListComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LivrableListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
