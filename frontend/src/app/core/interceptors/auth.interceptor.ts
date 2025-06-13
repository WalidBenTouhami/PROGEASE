import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  // Ajouter le token d'authentification si disponible
  const token = authService.getToken();
  if (token) {
    request = addTokenToRequest(request, token);
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Si le token est expiré et qu'on n'est pas déjà en train de le rafraîchir
        if (!isRefreshing) {
          isRefreshing = true;
          return handle401Error(request, next, authService, router, snackBar);
        }
      }

      // Gérer les autres erreurs
      handleError(error, router, snackBar);
      return throwError(() => error);
    })
  );
};

function addTokenToRequest(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

function handle401Error(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router,
  snackBar: MatSnackBar
) {
  return authService.refreshToken().pipe(
    switchMap(response => {
      isRefreshing = false;
      return next(addTokenToRequest(request, response.token));
    }),
    catchError(error => {
      isRefreshing = false;
      authService.logout();
      return throwError(() => error);
    })
  );
}

function handleError(error: HttpErrorResponse, router: Router, snackBar: MatSnackBar): void {
  let errorMessage = 'Une erreur est survenue';

  if (error.error instanceof ErrorEvent) {
    // Erreur côté client
    errorMessage = error.error.message;
  } else {
    // Erreur côté serveur
    switch (error.status) {
      case 400:
        errorMessage = 'Requête invalide';
        break;
      case 403:
        errorMessage = 'Accès non autorisé';
        router.navigate(['/auth/login']);
        break;
      case 404:
        errorMessage = 'Ressource non trouvée';
        break;
      case 500:
        errorMessage = 'Erreur serveur';
        break;
    }
  }

  snackBar.open(errorMessage, 'Fermer', {
    duration: 5000,
    horizontalPosition: 'center',
    verticalPosition: 'bottom'
  });
}
