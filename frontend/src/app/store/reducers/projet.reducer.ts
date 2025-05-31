import { createReducer, on } from '@ngrx/store';
import * as ProjetActions from '../actions/projet.actions';

export interface ProjetState {
  projets: any[];
  loading: boolean;
  error: any;
}

export const initialState: ProjetState = {
  projets: [],
  loading: false,
  error: null
};

export const projetReducer = createReducer(
  initialState,
  
  on(ProjetActions.loadProjets, state => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(ProjetActions.loadProjetsSuccess, (state, { projets }) => ({
    ...state,
    projets,
    loading: false
  })),
  
  on(ProjetActions.loadProjetsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),
  
  on(ProjetActions.createProjet, state => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(ProjetActions.createProjetSuccess, (state, { projet }) => ({
    ...state,
    projets: [...state.projets, projet],
    loading: false
  })),
  
  on(ProjetActions.createProjetFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),
  
  on(ProjetActions.updateProjet, state => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(ProjetActions.updateProjetSuccess, (state, { projet }) => ({
    ...state,
    projets: state.projets.map(p => p.id === projet.id ? projet : p),
    loading: false
  })),
  
  on(ProjetActions.updateProjetFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),
  
  on(ProjetActions.deleteProjet, state => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(ProjetActions.deleteProjetSuccess, (state, { id }) => ({
    ...state,
    projets: state.projets.filter(p => p.id !== id),
    loading: false
  })),
  
  on(ProjetActions.deleteProjetFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  }))
); 