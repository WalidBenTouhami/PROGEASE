import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { LivrableListComponent } from './livrable-list.component';
import { LivrableService } from '../../../core/services/livrable.service';
import { Livrable, StatutLivrable, TypeLivrable } from '../../../core/models/livrable.model';
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
      type: TypeLivrable.DOCUMENT,
      dateLimite: '2024-06-30',
      projetId: 'projet1',
      statut: StatutLivrable.EN_COURS,
      creeLe: '2024-01-01',
      majLe: '2024-01-01'
    },
    {
      _id: '2',
      intitule: 'Test 2',
      description: 'Description test 2',
      type: TypeLivrable.DOCUMENT,
      dateLimite: '2024-07-31',
      projetId: 'projet1',
      statut: StatutLivrable.TERMINE,
      creeLe: '2024-01-01',
      majLe: '2024-01-01'
    }
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('LivrableService', ['getLivrables']);
    spy.getLivrables.and.returnValue(of(mockLivrables));

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

    expect(livrableService.getLivrables).toHaveBeenCalled();
    expect(component.dataSource.data.length).toBe(2);
  }));

  it('should handle error when loading livrables', fakeAsync(() => {
    livrableService.getLivrables.and.returnValue(
      throwError(() => new Error('Test error'))
    );

    component.ngOnInit();
    tick();

    // Error is logged to console, component continues to work
    expect(component.dataSource.data.length).toBe(0);
  }));
});
