import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      mergeMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          map(({ user, token }) => AuthActions.loginSuccess({ user, token })),
          catchError((error) =>
            of(AuthActions.loginFailure({ error: error.message }))
          )
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ token }) => {
          this.authService.setToken(token);
          this.router.navigate(['/dashboard']);
          this.alertService.success('Login successful');
        })
      ),
    { dispatch: false }
  );

  loginFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginFailure),
        tap(({ error }) => {
          this.alertService.error(error);
        })
      ),
    { dispatch: false }
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          this.authService.logout();
          this.router.navigate(['/auth/login']);
          this.alertService.success('Logged out successfully');
        })
      ),
    { dispatch: false }
  );

  loadUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadUser),
      mergeMap(() =>
        this.authService.getCurrentUser().pipe(
          map((user) => AuthActions.loadUserSuccess({ user })),
          catchError((error) =>
            of(AuthActions.loadUserFailure({ error: error.message }))
          )
        )
      )
    )
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.updateUser),
      mergeMap(({ user }) =>
        this.authService.updateUser(user).pipe(
          map((updatedUser) => AuthActions.updateUserSuccess({ user: updatedUser })),
          catchError((error) =>
            of(AuthActions.updateUserFailure({ error: error.message }))
          )
        )
      )
    )
  );

  updateUserSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.updateUserSuccess),
        tap(() => {
          this.alertService.success('Profile updated successfully');
        })
      ),
    { dispatch: false }
  );

  changePassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.changePassword),
      mergeMap(({ currentPassword, newPassword }) =>
        this.authService.changePassword(currentPassword, newPassword).pipe(
          map(() => AuthActions.changePasswordSuccess()),
          catchError((error) =>
            of(AuthActions.changePasswordFailure({ error: error.message }))
          )
        )
      )
    )
  );

  changePasswordSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.changePasswordSuccess),
        tap(() => {
          this.alertService.success('Password changed successfully');
        })
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService
  ) {}
} 