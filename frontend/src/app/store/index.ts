import { ActionReducerMap, MetaReducer } from '@ngrx/store';
// import { storeFreeze } from 'ngrx-store-freeze'; // Temporarily removed
import { environment } from '../../environments/environment';

// Import reducers
import * as fromAuth from './auth/auth.reducer';
import * as fromUser from './user/user.reducer';
import * as fromAdmin from './admin/admin.reducer';
import * as fromUI from './ui/ui.reducer';

export interface AppState {
  auth: fromAuth.State;
  user: fromUser.State;
  admin: fromAdmin.State;
  ui: fromUI.State;
}

export const reducers: ActionReducerMap<AppState> = {
  auth: fromAuth.reducer,
  user: fromUser.reducer,
  admin: fromAdmin.reducer,
  ui: fromUI.reducer
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production
  ? [] // Temporarily removed storeFreeze
  : [];

// Selectors
export const selectAuthState = (state: AppState) => state.auth;
export const selectUserState = (state: AppState) => state.user;
export const selectAdminState = (state: AppState) => state.admin;
export const selectUIState = (state: AppState) => state.ui; 