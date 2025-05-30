import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjetListComponent } from './projet-list.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('ProjetListComponent', () => {
  let component: ProjetListComponent;
  let fixture: ComponentFixture<ProjetListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        ProjetListComponent
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ProjetListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
