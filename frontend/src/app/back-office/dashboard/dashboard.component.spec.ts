import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BackOfficeDashboardComponent } from './dashboard.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';

describe('BackOfficeDashboardComponent', () => {
  let component: BackOfficeDashboardComponent;
  let fixture: ComponentFixture<BackOfficeDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        BackOfficeDashboardComponent
      ],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: {}, params: {} } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BackOfficeDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
