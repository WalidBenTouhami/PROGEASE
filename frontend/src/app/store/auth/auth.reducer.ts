import { createReducer, on, Action } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import * as AuthActions from './auth.actions';
import { Utilisateur } from '../../core/models/utilisateur.model';

export const AUTH_FEATURE_KEY = 'auth';

export interface State extends EntityState<Utilisateur> {
  selectedId?: string | number;
  loaded: boolean;
  error?: string | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface AuthPartialState {
  readonly [AUTH_FEATURE_KEY]: State;
}

export const authAdapter: EntityAdapter<Utilisateur> = createEntityAdapter<Utilisateur>();

export const initialState: State = authAdapter.getInitialState({
  loaded: false,
  error: null,
  token: null,
  isAuthenticated: false,
  loading: false
});

export const authReducer = createReducer(
  initialState,
  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AuthActions.loginSuccess, (state, { user, token }) => ({
    ...state,
    ...authAdapter.setOne(user, state),
    token,
    isAuthenticated: true,
    loading: false,
    error: null
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(AuthActions.logout, (state) => ({
    ...state,
    ...authAdapter.removeAll(state),
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  })),
  on(AuthActions.loadUser, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AuthActions.loadUserSuccess, (state, { user }) => ({
    ...state,
    ...authAdapter.setOne(user, state),
    loading: false,
    error: null
  })),
  on(AuthActions.loadUserFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(AuthActions.updateUser, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AuthActions.updateUserSuccess, (state, { user }) => ({
    ...state,
    ...authAdapter.updateOne(
      { id: user._id!, changes: user },
      state
    ),
    loading: false,
    error: null
  })),
  on(AuthActions.updateUserFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);

export function reducer(state: State | undefined, action: Action) {
  return authReducer(state, action);
} 