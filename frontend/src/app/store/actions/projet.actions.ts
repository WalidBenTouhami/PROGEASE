import { createAction, props } from '@ngrx/store';

export const loadProjets = createAction('[Projet] Load Projets');

export const loadProjetsSuccess = createAction(
  '[Projet] Load Projets Success',
  props<{ projets: any[] }>()
);

export const loadProjetsFailure = createAction(
  '[Projet] Load Projets Failure',
  props<{ error: any }>()
);

export const createProjet = createAction(
  '[Projet] Create Projet',
  props<{ projet: any }>()
);

export const createProjetSuccess = createAction(
  '[Projet] Create Projet Success',
  props<{ projet: any }>()
);

export const createProjetFailure = createAction(
  '[Projet] Create Projet Failure',
  props<{ error: any }>()
);

export const updateProjet = createAction(
  '[Projet] Update Projet',
  props<{ id: string; projet: any }>()
);

export const updateProjetSuccess = createAction(
  '[Projet] Update Projet Success',
  props<{ projet: any }>()
);

export const updateProjetFailure = createAction(
  '[Projet] Update Projet Failure',
  props<{ error: any }>()
);

export const deleteProjet = createAction(
  '[Projet] Delete Projet',
  props<{ id: string }>()
);

export const deleteProjetSuccess = createAction(
  '[Projet] Delete Projet Success',
  props<{ id: string }>()
);

export const deleteProjetFailure = createAction(
  '[Projet] Delete Projet Failure',
  props<{ error: any }>()
); 