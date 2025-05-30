import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BackOfficeDashboardComponent } from './dashboard.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('BackOfficeDashboardComponent', () => {
  let component: BackOfficeDashboardComponent;
  let fixture: ComponentFixture<BackOfficeDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatCardModule,
        MatIconModule,
        MatListModule,
        HttpClientTestingModule,
        NoopAnimationsModule,
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

  it('should load statistics after delay', fakeAsync(() => {
    expect(component.statistiques.totalProjets).toBe(0);
    tick(1000);
    expect(component.statistiques.totalProjets).toBe(15);
    expect(component.statistiques.projetsActifs).toBe(8);
    expect(component.statistiques.projetsTermines).toBe(5);
    expect(component.statistiques.projetsEnRetard).toBe(2);
    expect(component.chargement).toBeFalsy();
  }));

  it('should render statistics when loaded', fakeAsync(() => {
    tick(1000);
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.stats-card')?.textContent).toContain('15');
    expect(compiled.querySelector('.active-projects')?.textContent).toContain('8');
    expect(compiled.querySelector('.completed-projects')?.textContent).toContain('5');
    expect(compiled.querySelector('.delayed-projects')?.textContent).toContain('2');
  }));
});
