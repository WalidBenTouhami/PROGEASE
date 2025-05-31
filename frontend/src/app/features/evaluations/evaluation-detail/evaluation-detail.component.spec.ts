import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { EvaluationDetailComponent } from './evaluation-detail.component';
import { EvaluationService } from '../../../core/services/evaluation.service';
import { CommonModule } from '@angular/common';

describe('EvaluationDetailComponent', () => {
  let component: EvaluationDetailComponent;
  let fixture: ComponentFixture<EvaluationDetailComponent>;
  let evaluationService: jasmine.SpyObj<EvaluationService>;

  const mockEvaluation = {
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
      titre: 'Projet Test'
    },
    evaluateur: {
      id: '1',
      nom: 'Doe',
      prenom: 'John'
    }
  };

  beforeEach(async () => {
    const evaluationServiceSpy = jasmine.createSpyObj('EvaluationService', ['getEvaluation']);
    evaluationServiceSpy.getEvaluation.and.returnValue(of({
      success: true,
      data: mockEvaluation
    }));

    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [EvaluationDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '1'
              }
            }
          }
        },
        { provide: EvaluationService, useValue: evaluationServiceSpy }
      ]
    }).compileComponents();

    evaluationService = TestBed.inject(EvaluationService) as jasmine.SpyObj<EvaluationService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load evaluation details on init', () => {
    expect(evaluationService.getEvaluation).toHaveBeenCalledWith('1');
    expect(component.evaluation$).toBeTruthy();
  });

  it('should display evaluation details', () => {
    const compiled = fixture.nativeElement;
    
    // Vérifier le titre du projet
    expect(compiled.querySelector('h2').textContent).toContain('Projet Test');
    
    // Vérifier le nom de l'évaluateur
    expect(compiled.querySelector('p').textContent).toContain('John Doe');
    
    // Vérifier la note globale
    expect(compiled.querySelector('.text-3xl').textContent).toContain('15/20');
    
    // Vérifier les critères
    const criteres = compiled.querySelectorAll('.border-b');
    expect(criteres.length).toBe(2);
    
    // Vérifier le premier critère
    expect(criteres[0].textContent).toContain('Qualité du code');
    expect(criteres[0].textContent).toContain('16/20');
    expect(criteres[0].textContent).toContain('40%');
    
    // Vérifier le second critère
    expect(criteres[1].textContent).toContain('Documentation');
    expect(criteres[1].textContent).toContain('14/20');
    expect(criteres[1].textContent).toContain('60%');
    
    // Vérifier le commentaire
    expect(compiled.querySelector('.whitespace-pre-line').textContent).toContain('Très bon travail');
    
    // Vérifier la date
    expect(compiled.querySelector('.text-gray-500').textContent).toContain('15 mars 2024');
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

  it('should handle null evaluation data', () => {
    evaluationService.getEvaluation.and.returnValue(of({
      success: false,
      error: 'Evaluation non trouvée'
    }));

    fixture = TestBed.createComponent(EvaluationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const errorElement = fixture.nativeElement.querySelector('.bg-red-50');
    expect(errorElement).toBeTruthy();
    expect(errorElement.textContent).toContain('Evaluation non trouvée');
  });
}); 