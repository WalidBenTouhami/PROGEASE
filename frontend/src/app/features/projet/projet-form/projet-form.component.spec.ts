import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { ProjetFormComponent } from './projet-form.component';
import { ProjetService } from '../../../core/services/projet.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { StatutProjet } from '../../../core/models/projet.model';

describe('ProjetFormComponent', () => {
  let component: ProjetFormComponent;
  let fixture: ComponentFixture<ProjetFormComponent>;
  let projetService: jasmine.SpyObj<ProjetService>;
  let router: jasmine.SpyObj<Router>;

  const mockProjet = {
    _id: '1',
    titre: 'Projet Test',
    description: 'Description test',
    dateDebut: new Date('2024-01-01'),
    dateFin: new Date('2024-12-31'),
    statut: StatutProjet.EN_COURS,
    equipe: ['utilisateur1'],
    competences: ['Angular'],
    livrables: []
  };

  beforeEach(async () => {
    const projetServiceSpy = jasmine.createSpyObj('ProjetService', ['creerProjet', 'mettreAJourProjet', 'recupererProjetParId']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    projetServiceSpy.creerProjet.and.returnValue(of(mockProjet));
    projetServiceSpy.mettreAJourProjet.and.returnValue(of(mockProjet));
    projetServiceSpy.recupererProjetParId.and.returnValue(of(mockProjet));

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatButtonModule,
        ProjetFormComponent
      ],
      providers: [
        FormBuilder,
        { provide: ProjetService, useValue: projetServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => null
              }
            }
          }
        }
      ]
    }).compileComponents();

    projetService = TestBed.inject(ProjetService) as jasmine.SpyObj<ProjetService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjetFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should initialize with empty form', () => {
      expect(component.projetForm.valid).toBeFalsy();
    });

    it('should validate required fields', () => {
      const form = component.projetForm;
      expect(form.get('titre')?.errors?.['required']).toBeTruthy();
      expect(form.get('description')?.errors?.['required']).toBeTruthy();
      expect(form.get('dateDebut')?.errors?.['required']).toBeTruthy();
      expect(form.get('dateFin')?.errors?.['required']).toBeTruthy();
    });

    it('should validate titre minlength', () => {
      const titreControl = component.projetForm.get('titre');
      titreControl?.setValue('Ab');
      expect(titreControl?.errors?.['minlength']).toBeTruthy();

      titreControl?.setValue('Abcde');
      expect(titreControl?.errors?.['minlength']).toBeFalsy();
    });

    it('should validate description minlength', () => {
      const descriptionControl = component.projetForm.get('description');
      descriptionControl?.setValue('Court');
      expect(descriptionControl?.errors?.['minlength']).toBeTruthy();

      descriptionControl?.setValue('Une description suffisamment longue');
      expect(descriptionControl?.errors?.['minlength']).toBeFalsy();
    });

    it('should validate date range', () => {
      const dateDebutControl = component.projetForm.get('dateDebut');
      const dateFinControl = component.projetForm.get('dateFin');

      dateDebutControl?.setValue(new Date('2024-12-31'));
      dateFinControl?.setValue(new Date('2024-01-01'));

      expect(component.projetForm.errors?.['dateRange']).toBeTruthy();

      dateDebutControl?.setValue(new Date('2024-01-01'));
      dateFinControl?.setValue(new Date('2024-12-31'));

      expect(component.projetForm.errors?.['dateRange']).toBeFalsy();
    });

    it('should validate equipe array minimum length', () => {
      const equipeControl = component.projetForm.get('equipe');
      equipeControl?.setValue([]);
      expect(equipeControl?.errors?.['required']).toBeTruthy();

      equipeControl?.setValue(['utilisateur1']);
      expect(equipeControl?.errors?.['required']).toBeFalsy();
    });

    it('should validate competences array minimum length', () => {
      const competencesControl = component.projetForm.get('competences');
      competencesControl?.setValue([]);
      expect(competencesControl?.errors?.['required']).toBeTruthy();

      competencesControl?.setValue(['Angular']);
      expect(competencesControl?.errors?.['required']).toBeFalsy();
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      component.projetForm.patchValue({
        titre: 'Projet Test',
        description: 'Description suffisamment longue pour le test',
        dateDebut: new Date('2024-01-01'),
        dateFin: new Date('2024-12-31'),
        statut: StatutProjet.EN_COURS,
        equipe: ['utilisateur1'],
        competences: ['Angular'],
        tuteur: 'tuteur1'
      });
    });

    it('should create new project when form is valid', fakeAsync(() => {
      expect(component.projetForm.valid).toBeTruthy();
      component.onSubmit();
      tick();

      expect(projetService.creerProjet).toHaveBeenCalledWith(component.projetForm.value);
      expect(router.navigate).toHaveBeenCalledWith(['/projets']);
    }));

    it('should update existing project when in edit mode', fakeAsync(() => {
      component.isEditing = true;
      component.projetId = '1';
      component.onSubmit();
      tick();

      expect(projetService.mettreAJourProjet).toHaveBeenCalledWith('1', component.projetForm.value);
      expect(router.navigate).toHaveBeenCalledWith(['/projets']);
    }));

    it('should handle submission error', fakeAsync(() => {
      projetService.creerProjet.and.returnValue(throwError(() => new Error('Erreur test')));
      component.onSubmit();
      tick();

      expect(component.erreur).toBe('Erreur lors de la sauvegarde du projet.');
    }));
  });

  describe('Form Reset', () => {
    it('should reset form to initial state', () => {
      component.projetForm.patchValue({
        titre: 'Test',
        description: 'Description'
      });

      component.resetForm();

      expect(component.projetForm.get('titre')?.value).toBe('');
      expect(component.projetForm.get('description')?.value).toBe('');
    });
  });
});
