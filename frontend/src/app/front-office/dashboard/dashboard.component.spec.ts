import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { BackOfficeDashboardComponent } from './dashboard.component';

describe('BackOfficeDashboardComponent', () => {
  let component: BackOfficeDashboardComponent;
  let fixture: ComponentFixture<FrontOfficeDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        FrontOfficeDashboardComponent
      ],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: {}, params: {} } }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FrontOfficeDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
