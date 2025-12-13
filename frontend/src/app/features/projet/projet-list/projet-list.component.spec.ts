import { ComponentFixture, TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProjetListComponent } from './projet-list.component';
import { ProjetService } from '../../../core/services/projet.service';
import { of, throwError, timer } from 'rxjs';
import { delay, take, map } from 'rxjs/operators';
import { Projet, StatutProjet } from '../../../core/models/projet.model';

describe('ProjetListComponent', () => {
  let component: ProjetListComponent;
  let fixture: ComponentFixture<ProjetListComponent>;
  let projetService: jasmine.SpyObj<ProjetService>;

  const mockProjets: (Projet & { _id: string })[] = [
    {
      _id: '1',
      titre: 'Projet Test 1',
      description: 'Description test 1',
      dateDebut: '2024-01-01',
      dateFin: '2024-12-31',
      statut: StatutProjet.EN_COURS,
      equipe: ['utilisateur1'],
      competences: ['Angular'],
      livrables: []
    },
    {
      _id: '2',
      titre: 'Projet Test 2',
      description: 'Description test 2',
      dateDebut: '2024-02-01',
      dateFin: '2024-11-30',
      statut: StatutProjet.TERMINE,
      equipe: ['utilisateur2'],
      competences: ['Node.js'],
      livrables: []
    }
  ];

  beforeEach(() => {
    const projetServiceSpy = jasmine.createSpyObj('ProjetService', ['getProjets']);
    projetServiceSpy.getProjets.and.returnValue(of(mockProjets));

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        NoopAnimationsModule,
        FormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        ProjetListComponent
      ],
      providers: [
        { provide: ProjetService, useValue: projetServiceSpy }
      ]
    });

    fixture = TestBed.createComponent(ProjetListComponent);
    component = fixture.componentInstance;
    projetService = TestBed.inject(ProjetService) as jasmine.SpyObj<ProjetService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load projets on init', fakeAsync(() => {
    component.ngOnInit();
    tick();
    expect(projetService.getProjets).toHaveBeenCalled();
    expect(component.projets.length).toBe(2);
  }));

  it('should handle error when loading projets', fakeAsync(() => {
    projetService.getProjets.and.returnValue(
      throwError(() => new Error('Erreur test'))
    );

    component.ngOnInit();
    tick();

    expect(component.erreur).toBe('Une erreur est survenue lors du chargement des projets.');
    expect(component.chargement).toBeFalse();
  }));

  it('should filter projets by search term', () => {
    component.projets = mockProjets;
    component.filtrerProjets('Test 1');
    expect(component.projetsFiltres.length).toBe(1);
    expect(component.projetsFiltres[0].titre).toContain('Test 1');
  });

  it('should show all projets when filter is empty', () => {
    component.projets = mockProjets;
    component.filtrerProjets('');
    expect(component.projetsFiltres.length).toBe(2);
  });

  it('should handle empty projets list', fakeAsync(() => {
    projetService.getProjets.and.returnValue(of([]));
    component.ngOnInit();
    tick();
    expect(component.projets.length).toBe(0);
  }));
});

describe('ProjetListComponent Performance', () => {
  let component: ProjetListComponent;
  let fixture: ComponentFixture<ProjetListComponent>;
  let projetService: jasmine.SpyObj<ProjetService>;

  // Générer un grand nombre de projets pour les tests de performance
  const generateMockProjets = (count: number): (Projet & { _id: string })[] => {
    return Array.from({ length: count }, (_, i) => ({
      _id: i.toString(),
      titre: `Projet Test ${i}`,
      description: `Description test ${i}`,
      dateDebut: '2024-01-01',
      dateFin: '2024-12-31',
      statut: StatutProjet.EN_COURS,
      equipe: ['utilisateur1'],
      competences: ['Angular'],
      livrables: []
    }));
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ProjetService', ['getProjets']);
    spy.getProjets.and.returnValue(of(generateMockProjets(100)));

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        NoopAnimationsModule,
        FormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        ProjetListComponent
      ],
      providers: [
        { provide: ProjetService, useValue: spy }
      ]
    }).compileComponents();

    projetService = TestBed.inject(ProjetService) as jasmine.SpyObj<ProjetService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjetListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load 1000 projects within 1 second', fakeAsync(() => {
    const startTime = performance.now();
    projetService.getProjets.and.returnValue(of(generateMockProjets(1000)));

    component.ngOnInit();
    tick();

    const endTime = performance.now();
    const loadTime = endTime - startTime;

    expect(loadTime).toBeLessThan(1000); // Moins d'une seconde
    expect(component.projets.length).toBe(1000);
  }));

  it('should filter 1000 projects efficiently', fakeAsync(() => {
    component.projets = generateMockProjets(1000);

    const startTime = performance.now();
    component.filtrerProjets('Test 500');
    const endTime = performance.now();
    const filterTime = endTime - startTime;

    expect(filterTime).toBeLessThan(100); // Moins de 100ms
    expect(component.projetsFiltres.length).toBe(1);
  }));

  it('should handle rapid filter changes efficiently', fakeAsync(() => {
    component.projets = generateMockProjets(1000);
    const filterTerms = ['Test', 'Projet', '500', ''];
    let totalTime = 0;

    filterTerms.forEach(term => {
      const startTime = performance.now();
      component.filtrerProjets(term);
      const endTime = performance.now();
      totalTime += (endTime - startTime);
    });

    const averageTime = totalTime / filterTerms.length;
    expect(averageTime).toBeLessThan(50); // Moyenne de moins de 50ms par filtre
  }));

  it('should handle concurrent data loading and filtering', fakeAsync(() => {
    const mockProjets = generateMockProjets(500);
    projetService.getProjets.and.returnValue(of(mockProjets).pipe(delay(100)));

    component.ngOnInit();
    component.filtrerProjets('Test');

    tick(100);
    expect(component.projets.length).toBe(500);
    expect(component.projetsFiltres.length).toBeGreaterThan(0);
  }));

  it('should maintain performance with periodic updates', fakeAsync(() => {
    const updates = 5;
    let updateCount = 0;
    const mockProjets = generateMockProjets(100);

    projetService.getProjets.and.returnValue(
      timer(0, 1000).pipe(
        take(updates),
        delay(100),
        map(() => {
          updateCount++;
          return mockProjets.map(p => ({
            ...p,
            titre: `Projet Test ${updateCount}`
          }));
        })
      )
    );

    component.ngOnInit();
    tick(updates * 1000);

    expect(updateCount).toBe(updates);
    expect(component.projets.length).toBe(100);
    discardPeriodicTasks();
  }));

  it('should optimize memory usage with large datasets', fakeAsync(() => {
    const largeMockProjets = generateMockProjets(5000);
    projetService.getProjets.and.returnValue(of(largeMockProjets));

    const initialMemory = (performance as any).memory?.usedJSHeapSize;
    component.ngOnInit();
    tick();
    const finalMemory = (performance as any).memory?.usedJSHeapSize;

    if (initialMemory && finalMemory) {
      const memoryIncrease = finalMemory - initialMemory;
      // L'augmentation de mémoire ne devrait pas dépasser 50MB pour 5000 projets
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    }
  }));

  it('should handle rapid pagination changes efficiently', fakeAsync(() => {
    component.projets = generateMockProjets(1000);
    const pageChanges = 10;
    let totalTime = 0;

    for (let i = 0; i < pageChanges; i++) {
      const startTime = performance.now();
      // Simuler un changement de page
      if (component.paginator) {
        component.paginator.pageIndex = i;
        component.paginator.page.emit({
          pageIndex: i,
          pageSize: 10,
          length: 1000
        });
      }
      const endTime = performance.now();
      totalTime += (endTime - startTime);
      tick();
    }

    const averageTime = totalTime / pageChanges;
    expect(averageTime).toBeLessThan(20); // Moyenne de moins de 20ms par changement de page
  }));
});
