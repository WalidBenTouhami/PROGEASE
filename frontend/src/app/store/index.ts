import { ActionReducerMap } from '@ngrx/store';
import * as fromProjet from './reducers/projet.reducer';

export interface AppState {
  projets: fromProjet.ProjetState;
}

export const reducers: ActionReducerMap<AppState> = {
  projets: fromProjet.projetReducer
}; 