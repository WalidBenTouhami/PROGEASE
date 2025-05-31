import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { EvaluationFormComponent } from './evaluation-form.component';
import { EvaluationService } from '../../../core/services/evaluation.service';
import { ProjetService } from '../../../core/services/projet.service';
import { Evaluation } from '../../../core/models/evaluation.model';
import { Projet, StatutProjet } from '../../../core/models/projet.model';
import { ApiResponse } from '../../../core/models/api.model';

describe('EvaluationFormComponent', () => {
  let component: EvaluationFormComponent;
  let fixture: ComponentFixture<EvaluationFormComponent>;
  let evaluationService: jasmine.SpyObj<EvaluationService>;
  let projetService: jasmine.SpyObj<ProjetService>;
  let router: jasmine.SpyObj<Router>;

  const mockProjet: Projet = {
    id: '1',
    titre: 'Projet Test',
    description: 'Description du projet',
    dateDebut: '2024-01-01',
    dateFin: '2024-12-31',
    statut: StatutProjet.EN_COURS,
    equipe: [],
    competences: [],
    livrables: []
  };

  const mockEvaluation: Evaluation = {
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
    ]
  };

  beforeEach(async () => {
    const evaluationServiceSpy = jasmine.createSpyObj('EvaluationService', ['createEvaluation', 'updateEvaluation', 'getEvaluation']);
    const projetServiceSpy = jasmine.createSpyObj('ProjetService', ['getProjet']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    evaluationServiceSpy.getEvaluation.and.returnValue(of({
      success: true,
      data: mockEvaluation
    } as ApiResponse<Evaluation>));

    projetServiceSpy.getProjet.and.returnValue(of({
      success: true,
      data: mockProjet
    } as ApiResponse<Projet>));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [EvaluationFormComponent],
      providers: [
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (param: string) => param === 'id' ? '1' : param === 'projetId' ? '1' : null
              }
            }
          }
        },
        { provide: EvaluationService, useValue: evaluationServiceSpy },
        { provide: ProjetService, useValue: projetServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    evaluationService = TestBed.inject(EvaluationService) as jasmine.SpyObj<EvaluationService>;
    projetService = TestBed.inject(ProjetService) as jasmine.SpyObj<ProjetService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values for new evaluation', () => {
    component.editMode = false;
    component.initializeForm();
    fixture.detectChanges();

    const form = component.evaluationForm;
    const noteControl = form.get('note');
    const commentaireControl = form.get('commentaire');
    const criteresControl = form.get('criteres');

    expect(noteControl).toBeTruthy();
    expect(commentaireControl).toBeTruthy();
    expect(criteresControl).toBeTruthy();
    expect(criteresControl?.value.length).toBe(0);
  });

  it('should load evaluation data in edit mode', () => {
    component.editMode = true;
    component.currentEvaluationId = '1';
    component.ngOnInit();
    fixture.detectChanges();

    expect(evaluationService.getEvaluation).toHaveBeenCalledWith('1');
    const form = component.evaluationForm;
    const noteControl = form.get('note');
    const commentaireControl = form.get('commentaire');
    const criteresControl = form.get('criteres');

    expect(noteControl?.value).toBe(15);
    expect(commentaireControl?.value).toBe('Très bon travail');
    expect(criteresControl?.value.length).toBe(2);
  });

  it('should add a new criterion', () => {
    component.initializeForm();
    component.addCriterion();
    fixture.detectChanges();

    const criteresArray = component.evaluationForm.get('criteres') as FormArray;
    expect(criteresArray.length).toBe(1);
    expect(criteresArray.at(0).value).toEqual({
      nom: '',
      note: null,
      poids: null
    });
  });

  it('should remove a criterion', () => {
    component.initializeForm();
    component.addCriterion();
    component.addCriterion();
    component.removeCriterion(0);
    fixture.detectChanges();

    const criteresArray = component.evaluationForm.get('criteres') as FormArray;
    expect(criteresArray.length).toBe(1);
  });

  it('should calculate global note when criteria change', () => {
    component.initializeForm();
    const criteresArray = component.evaluationForm.get('criteres') as FormArray;
    
    component.addCriterion();
    component.addCriterion();
    
    criteresArray.at(0).patchValue({
      nom: 'Critère 1',
      note: 16,
      poids: 40
    });
    
    criteresArray.at(1).patchValue({
      nom: 'Critère 2',
      note: 14,
      poids: 60
    });

    component.calculateGlobalScore();
    fixture.detectChanges();

    const noteControl = component.evaluationForm.get('note');
    expect(noteControl?.value).toBe(15);
  });

  it('should validate criteria weights sum to 100', () => {
    component.initializeForm();
    const criteresArray = component.evaluationForm.get('criteres') as FormArray;
    
    component.addCriterion();
    component.addCriterion();
    
    criteresArray.at(0).patchValue({
      nom: 'Critère 1',
      note: 16,
      poids: 30
    });
    
    criteresArray.at(1).patchValue({
      nom: 'Critère 2',
      note: 14,
      poids: 30
    });

    expect(component.evaluationForm.hasError('invalidWeights')).toBeTrue();
  });

  it('should submit new evaluation', () => {
    component.editMode = false;
    component.initializeForm();
    const form = component.evaluationForm;
    
    form.patchValue({
      note: 15,
      commentaire: 'Nouveau commentaire',
      criteres: [
        {
          nom: 'Critère 1',
          note: 15,
          poids: 100
        }
      ]
    });

    evaluationService.createEvaluation.and.returnValue(of({
      success: true,
      data: { ...mockEvaluation, id: '2' }
    } as ApiResponse<Evaluation>));

    component.onSubmit();

    expect(evaluationService.createEvaluation).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/evaluations', '2']);
  });

  it('should handle submission errors', () => {
    component.editMode = false;
    component.initializeForm();
    
    evaluationService.createEvaluation.and.returnValue(of({
      success: false,
      error: 'Erreur lors de la création',
      data: undefined
    } as ApiResponse<Evaluation>));

    component.onSubmit();

    expect(component.errorMessage).toBeTruthy();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should handle loading state during submission', () => {
    component.editMode = false;
    component.initializeForm();
    
    component.isLoading = true;
    fixture.detectChanges();
    
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitButton.disabled).toBeTrue();
    expect(submitButton.textContent).toContain('Chargement');
  });
}); 