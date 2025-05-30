import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LivrableManagementComponent } from './livrable-management.component';

describe('LivrableManagementComponent', () => {
  let component: LivrableManagementComponent;
  let fixture: ComponentFixture<LivrableManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        LivrableManagementComponent
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LivrableManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
