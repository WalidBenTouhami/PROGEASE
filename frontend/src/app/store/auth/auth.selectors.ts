import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AUTH_FEATURE_KEY, State, authAdapter } from './auth.reducer';

export const selectAuthState = createFeatureSelector<State>(AUTH_FEATURE_KEY);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state: State) => state.isAuthenticated
);

export const selectUser = createSelector(
  selectAuthState,
  (state: State) => state.selectedId ? state.entities[state.selectedId] : null
);

export const selectUserRole = createSelector(
  selectUser,
  (user) => user?.role
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state: State) => state.error
);

export const selectAuthLoading = createSelector(
  selectAuthState,
  (state: State) => state.loading
);

export const selectToken = createSelector(
  selectAuthState,
  (state: State) => state.token
); 