import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { EvaluationListComponent } from './evaluation-list.component';
import { EvaluationService } from '../../../core/services/evaluation.service';
import { CommonModule } from '@angular/common';

describe('EvaluationListComponent', () => {
  let component: EvaluationListComponent;
  let fixture: ComponentFixture<EvaluationListComponent>;
  let evaluationService: jasmine.SpyObj<EvaluationService>;

  const mockEvaluations = [
    {
      id: '1',
      projetId: '1',
      evaluateurId: '1',
      note: 15,
      commentaire: 'Très bon travail',
      dateEvaluation: '2024-03-15',
      criteres: [
        {
          nom: 'Qualité du code',
          note: 16,
          poids: 40
        },
        {
          nom: 'Documentation',
          note: 14,
          poids: 60
        }
      ],
      projet: {
        id: '1',
        titre: 'Projet Test 1'
      },
      evaluateur: {
        id: '1',
        nom: 'Doe',
        prenom: 'John'
      }
    },
    {
      id: '2',
      projetId: '2',
      evaluateurId: '2',
      note: 17,
      commentaire: 'Excellent travail',
      dateEvaluation: '2024-03-16',
      criteres: [
        {
          nom: 'Qualité du code',
          note: 18,
          poids: 50
        },
        {
          nom: 'Documentation',
          note: 16,
          poids: 50
        }
      ],
      projet: {
        id: '2',
        titre: 'Projet Test 2'
      },
      evaluateur: {
        id: '2',
        nom: 'Smith',
        prenom: 'Jane'
      }
    }
  ];

  beforeEach(async () => {
    const evaluationServiceSpy = jasmine.createSpyObj('EvaluationService', ['getEvaluations', 'deleteEvaluation']);
    evaluationServiceSpy.getEvaluations.and.returnValue(of({
      success: true,
      data: mockEvaluations
    }));

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterTestingModule
      ],
      declarations: [EvaluationListComponent],
      providers: [
        { provide: EvaluationService, useValue: evaluationServiceSpy }
      ]
    }).compileComponents();

    evaluationService = TestBed.inject(EvaluationService) as jasmine.SpyObj<EvaluationService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load evaluations on init', () => {
    expect(evaluationService.getEvaluations).toHaveBeenCalled();
    expect(component.evaluations$).toBeTruthy();
  });

  it('should display evaluations list', () => {
    const compiled = fixture.nativeElement;
    const evaluationCards = compiled.querySelectorAll('.evaluation-card');
    
    expect(evaluationCards.length).toBe(2);
    
    // Vérifier le premier élément
    expect(evaluationCards[0].textContent).toContain('Projet Test 1');
    expect(evaluationCards[0].textContent).toContain('John Doe');
    expect(evaluationCards[0].textContent).toContain('15/20');
    expect(evaluationCards[0].textContent).toContain('15 mars 2024');
    
    // Vérifier le second élément
    expect(evaluationCards[1].textContent).toContain('Projet Test 2');
    expect(evaluationCards[1].textContent).toContain('Jane Smith');
    expect(evaluationCards[1].textContent).toContain('17/20');
    expect(evaluationCards[1].textContent).toContain('16 mars 2024');
  });

  it('should handle delete evaluation', () => {
    evaluationService.deleteEvaluation.and.returnValue(of({
      success: true,
      data: { id: '1' }
    }));

    component.deleteEvaluation('1');

    expect(evaluationService.deleteEvaluation).toHaveBeenCalledWith('1');
    expect(evaluationService.getEvaluations).toHaveBeenCalled();
  });

  it('should handle delete error', () => {
    evaluationService.deleteEvaluation.and.returnValue(of({
      success: false,
      error: 'Erreur lors de la suppression'
    }));

    component.deleteEvaluation('1');

    expect(component.error).toBeTruthy();
    expect(evaluationService.getEvaluations).not.toHaveBeenCalled();
  });

  it('should handle loading state', () => {
    component.loading = true;
    fixture.detectChanges();
    
    const loader = fixture.nativeElement.querySelector('.loader');
    expect(loader).toBeTruthy();
  });

  it('should handle error state', () => {
    component.error = 'Une erreur est survenue';
    fixture.detectChanges();
    
    const errorElement = fixture.nativeElement.querySelector('.bg-red-50');
    expect(errorElement).toBeTruthy();
    expect(errorElement.textContent).toContain('Une erreur est survenue');
  });

  it('should handle empty evaluations list', () => {
    evaluationService.getEvaluations.and.returnValue(of({
      success: true,
      data: []
    }));

    component.ngOnInit();
    fixture.detectChanges();

    const emptyMessage = fixture.nativeElement.querySelector('.empty-message');
    expect(emptyMessage).toBeTruthy();
    expect(emptyMessage.textContent).toContain('Aucune évaluation disponible');
  });

  it('should filter evaluations by projet', () => {
    component.filterByProjet('1');
    expect(evaluationService.getEvaluations).toHaveBeenCalledWith({ projetId: '1' });
  });

  it('should filter evaluations by evaluateur', () => {
    component.filterByEvaluateur('1');
    expect(evaluationService.getEvaluations).toHaveBeenCalledWith({ evaluateurId: '1' });
  });

  it('should sort evaluations by note', () => {
    component.sortByNote();
    fixture.detectChanges();

    const evaluationCards = fixture.nativeElement.querySelectorAll('.evaluation-card');
    const firstNote = Number(evaluationCards[0].querySelector('.note').textContent.replace('/20', ''));
    const secondNote = Number(evaluationCards[1].querySelector('.note').textContent.replace('/20', ''));
    
    expect(firstNote).toBeGreaterThanOrEqual(secondNote);
  });

  it('should sort evaluations by date', () => {
    component.sortByDate();
    fixture.detectChanges();

    const evaluationCards = fixture.nativeElement.querySelectorAll('.evaluation-card');
    const firstDate = new Date(evaluationCards[0].querySelector('.date').getAttribute('datetime'));
    const secondDate = new Date(evaluationCards[1].querySelector('.date').getAttribute('datetime'));
    
    expect(firstDate.getTime()).toBeGreaterThanOrEqual(secondDate.getTime());
  });
}); 