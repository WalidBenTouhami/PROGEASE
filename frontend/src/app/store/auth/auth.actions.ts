import { createAction, props } from '@ngrx/store';
import { Utilisateur } from '../../core/models/utilisateur.model';

export const login = createAction(
  '[Auth] Login',
  props<{ email: string; password: string }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: Utilisateur; token: string }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

export const logout = createAction(
  '[Auth] Logout'
);

export const loadUser = createAction(
  '[Auth] Load User'
);

export const loadUserSuccess = createAction(
  '[Auth] Load User Success',
  props<{ user: Utilisateur }>()
);

export const loadUserFailure = createAction(
  '[Auth] Load User Failure',
  props<{ error: string }>()
);

export const updateUser = createAction(
  '[Auth] Update User',
  props<{ user: Partial<Utilisateur> }>()
);

export const updateUserSuccess = createAction(
  '[Auth] Update User Success',
  props<{ user: Utilisateur }>()
);

export const updateUserFailure = createAction(
  '[Auth] Update User Failure',
  props<{ error: string }>()
);

export const changePassword = createAction(
  '[Auth] Change Password',
  props<{ currentPassword: string; newPassword: string }>()
);

export const changePasswordSuccess = createAction(
  '[Auth] Change Password Success'
);

export const changePasswordFailure = createAction(
  '[Auth] Change Password Failure',
  props<{ error: string }>()
); 