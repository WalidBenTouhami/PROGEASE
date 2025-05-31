import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { EvaluationFormComponent } from './evaluation-form.component';
import { EvaluationService } from '../../../core/services/evaluation.service';
import { ProjetService } from '../../../core/services/projet.service';

describe('EvaluationFormComponent', () => {
  let component: EvaluationFormComponent;
  let fixture: ComponentFixture<EvaluationFormComponent>;
  let evaluationService: jasmine.SpyObj<EvaluationService>;
  let projetService: jasmine.SpyObj<ProjetService>;
  let router: jasmine.SpyObj<Router>;

  const mockProjet = {
    id: '1',
    titre: 'Projet Test',
    description: 'Description du projet',
    dateDebut: '2024-01-01',
    dateFin: '2024-12-31',
    statut: 'EN_COURS'
  };

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
    ]
  };

  beforeEach(async () => {
    const evaluationServiceSpy = jasmine.createSpyObj('EvaluationService', ['createEvaluation', 'updateEvaluation', 'getEvaluation']);
    const projetServiceSpy = jasmine.createSpyObj('ProjetService', ['getProjetById']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    evaluationServiceSpy.getEvaluation.and.returnValue(of({
      success: true,
      data: mockEvaluation
    }));

    projetServiceSpy.getProjetById.and.returnValue(of({
      success: true,
      data: mockProjet
    }));

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
    component.isEditMode = false;
    component.initForm();
    fixture.detectChanges();

    const form = component.evaluationForm;
    expect(form.get('note')).toBeTruthy();
    expect(form.get('commentaire')).toBeTruthy();
    expect(form.get('criteres')).toBeTruthy();
    expect(form.get('criteres').value.length).toBe(0);
  });

  it('should load evaluation data in edit mode', () => {
    component.isEditMode = true;
    component.evaluationId = '1';
    component.ngOnInit();
    fixture.detectChanges();

    expect(evaluationService.getEvaluation).toHaveBeenCalledWith('1');
    const form = component.evaluationForm;
    expect(form.get('note').value).toBe(15);
    expect(form.get('commentaire').value).toBe('Très bon travail');
    expect(form.get('criteres').value.length).toBe(2);
  });

  it('should add a new criterion', () => {
    component.initForm();
    component.addCritere();
    fixture.detectChanges();

    const criteres = component.evaluationForm.get('criteres').value;
    expect(criteres.length).toBe(1);
    expect(criteres[0]).toEqual({
      nom: '',
      note: null,
      poids: null
    });
  });

  it('should remove a criterion', () => {
    component.initForm();
    component.addCritere();
    component.addCritere();
    component.removeCritere(0);
    fixture.detectChanges();

    const criteres = component.evaluationForm.get('criteres').value;
    expect(criteres.length).toBe(1);
  });

  it('should calculate global note when criteria change', () => {
    component.initForm();
    const form = component.evaluationForm;
    const criteresArray = form.get('criteres');
    
    criteresArray.push(component.createCritereFormGroup());
    criteresArray.push(component.createCritereFormGroup());
    
    const criteres = criteresArray.controls;
    criteres[0].patchValue({
      nom: 'Critère 1',
      note: 16,
      poids: 40
    });
    
    criteres[1].patchValue({
      nom: 'Critère 2',
      note: 14,
      poids: 60
    });

    component.calculateGlobalNote();
    fixture.detectChanges();

    expect(form.get('note').value).toBe(15);
  });

  it('should validate criteria weights sum to 100', () => {
    component.initForm();
    const form = component.evaluationForm;
    const criteresArray = form.get('criteres');
    
    criteresArray.push(component.createCritereFormGroup());
    criteresArray.push(component.createCritereFormGroup());
    
    const criteres = criteresArray.controls;
    criteres[0].patchValue({
      nom: 'Critère 1',
      note: 16,
      poids: 30
    });
    
    criteres[1].patchValue({
      nom: 'Critère 2',
      note: 14,
      poids: 30
    });

    expect(form.hasError('invalidWeights')).toBeTrue();
  });

  it('should submit new evaluation', () => {
    component.isEditMode = false;
    component.initForm();
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
    }));

    component.onSubmit();

    expect(evaluationService.createEvaluation).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/evaluations', '2']);
  });

  it('should update existing evaluation', () => {
    component.isEditMode = true;
    component.evaluationId = '1';
    component.initForm();
    const form = component.evaluationForm;
    
    form.patchValue({
      note: 16,
      commentaire: 'Commentaire mis à jour',
      criteres: [
        {
          nom: 'Critère mis à jour',
          note: 16,
          poids: 100
        }
      ]
    });

    evaluationService.updateEvaluation.and.returnValue(of({
      success: true,
      data: { ...mockEvaluation, ...form.value }
    }));

    component.onSubmit();

    expect(evaluationService.updateEvaluation).toHaveBeenCalledWith('1', form.value);
    expect(router.navigate).toHaveBeenCalledWith(['/evaluations', '1']);
  });

  it('should handle submission errors', () => {
    component.isEditMode = false;
    component.initForm();
    
    evaluationService.createEvaluation.and.returnValue(of({
      success: false,
      error: 'Erreur lors de la création'
    }));

    component.onSubmit();

    expect(component.error).toBeTruthy();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should handle loading state during submission', () => {
    component.isEditMode = false;
    component.initForm();
    
    component.loading = true;
    fixture.detectChanges();
    
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitButton.disabled).toBeTrue();
    expect(submitButton.textContent).toContain('Chargement');
  });
}); 