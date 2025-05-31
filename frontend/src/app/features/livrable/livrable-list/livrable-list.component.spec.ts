import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { LivrableListComponent } from './livrable-list.component';
import { LivrableService } from '../../core/services/livrable.service';
import { Livrable, StatutLivrable } from '../../core/models/livrable.model';
import { of, throwError } from 'rxjs';

describe('LivrableListComponent', () => {
  let component: LivrableListComponent;
  let fixture: ComponentFixture<LivrableListComponent>;
  let livrableService: jasmine.SpyObj<LivrableService>;

  const mockLivrables: Livrable[] = [
    {
      _id: '1',
      intitule: 'Test 1',
      description: 'Description test 1',
      dateLimite: new Date('2024-06-30'),
      projetId: 'projet1',
      statut: StatutLivrable.EN_COURS,
      creeLe: new Date(),
      majLe: new Date()
    },
    {
      _id: '2',
      intitule: 'Test 2',
      description: 'Description test 2',
      dateLimite: new Date('2024-07-31'),
      projetId: 'projet1',
      statut: StatutLivrable.TERMINE,
      creeLe: new Date(),
      majLe: new Date()
    }
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('LivrableService', ['recupererLivrablesParProjet']);
    spy.recupererLivrablesParProjet.and.returnValue(of(mockLivrables));

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        NoopAnimationsModule,
        CommonModule,
        LivrableListComponent
      ],
      providers: [
        { provide: LivrableService, useValue: spy }
      ]
    }).compileComponents();

    livrableService = TestBed.inject(LivrableService) as jasmine.SpyObj<LivrableService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LivrableListComponent);
    component = fixture.componentInstance;
    component.projetId = 'projet1';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load livrables on init', fakeAsync(() => {
    component.ngOnInit();
    tick();

    expect(livrableService.recupererLivrablesParProjet).toHaveBeenCalledWith('projet1');
    expect(component.livrables.length).toBe(2);
    expect(component.chargement).toBeFalse();
  }));

  it('should handle error when loading livrables', fakeAsync(() => {
    livrableService.recupererLivrablesParProjet.and.returnValue(
      throwError(() => new Error('Test error'))
    );

    component.ngOnInit();
    tick();

    expect(component.erreur).toBeTruthy();
    expect(component.chargement).toBeFalse();
  }));

  it('should check status correctly', () => {
    expect(component.isEnAttente(StatutLivrable.EN_ATTENTE)).toBeTrue();
    expect(component.isEnRetard(StatutLivrable.EN_RETARD)).toBeTrue();
    expect(component.isTermine(StatutLivrable.TERMINE)).toBeTrue();
    expect(component.isStatus(StatutLivrable.EN_COURS, StatutLivrable.EN_COURS)).toBeTrue();
  });

  it('should unsubscribe on destroy', () => {
    const subscription = component['subscription'];
    spyOn(subscription!, 'unsubscribe');

    component.ngOnDestroy();

    expect(subscription?.unsubscribe).toHaveBeenCalled();
  });
});
