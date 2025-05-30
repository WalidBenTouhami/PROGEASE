import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ProjetDetailComponent } from './projet-detail.component';

describe('ProjetDetailComponent', () => {
  let component: ProjetDetailComponent;
  let fixture: ComponentFixture<ProjetDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        ProjetDetailComponent
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ProjetDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
