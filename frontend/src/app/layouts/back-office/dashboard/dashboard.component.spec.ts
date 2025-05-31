import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BackOfficeDashboardComponent } from './dashboard.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgChartsModule } from 'ng2-charts';

describe('BackOfficeDashboardComponent', () => {
  let component: BackOfficeDashboardComponent;
  let fixture: ComponentFixture<BackOfficeDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatCardModule,
        MatIconModule,
        MatListModule,
        MatProgressSpinnerModule,
        HttpClientTestingModule,
        NoopAnimationsModule,
        NgChartsModule,
        BackOfficeDashboardComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BackOfficeDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show loading spinner initially', () => {
    expect(component.chargement).toBeTruthy();
  });

  it('should initialize statistics in constructor', () => {
    expect(component.statistiques.totalProjets).toBe(15);
    expect(component.statistiques.projetsActifs).toBe(8);
    expect(component.statistiques.projetsTermines).toBe(5);
    expect(component.statistiques.projetsEnRetard).toBe(2);
  });

  it('should initialize dashboard data in ngOnInit', fakeAsync(() => {
    component.ngOnInit();
    expect(component.projetsAValider).toBe(5);
    expect(component.livrablesACorriger).toBe(10);
    expect(component.dernieresActions.length).toBe(2);
    expect(component.barChartData.datasets[0].data).toEqual([5, 10, 0]);
    
    tick(1000);
    fixture.detectChanges();
    expect(component.chargement).toBeFalsy();
  }));
});
