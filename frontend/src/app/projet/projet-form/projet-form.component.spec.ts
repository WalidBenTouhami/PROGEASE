import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ProjetFormComponent } from './projet-form.component';

describe('ProjetFormComponent', () => {
  let component: ProjetFormComponent;
  let fixture: ComponentFixture<ProjetFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ProjetFormComponent
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjetFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
