import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, BehaviorSubject, Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Injectable } from '@angular/core';
import { HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { environment } from '../../../environments/environment';

// Token refresh state management
const isRefreshing = new BehaviorSubject<boolean>(false);
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();
    
    if (token) {
      request = this.addTokenToRequest(request, token);
    }
    
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !request.url.includes('/auth/refresh')) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addTokenToRequest(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!isRefreshing.value) {
      isRefreshing.next(true);
      refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap(response => {
          isRefreshing.next(false);
          refreshTokenSubject.next(response.token);
          return next.handle(this.addTokenToRequest(request, response.token));
        }),
        catchError(error => {
          isRefreshing.next(false);
          this.authService.logout();
          return throwError(() => error);
        })
      );
    }

    return refreshTokenSubject.pipe(
      switchMap(token => {
        if (token) {
          return next.handle(this.addTokenToRequest(request, token));
        }
        return throwError(() => new Error('Token refresh failed'));
      })
    );
  }
}

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  // Skip interceptor for auth endpoints
  if (request.url.includes('/auth/')) {
    return next(request);
  }

  // Add token to request
  const token = authService.getToken();
  if (token) {
    request = addTokenToRequest(request, token);
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !request.url.includes('/auth/refresh')) {
        return handle401Error(request, next, authService, router, snackBar);
      }

      // Handle other errors
      handleError(error, router, snackBar);
      return throwError(() => error);
    })
  );
};

function addTokenToRequest(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
      'X-API-Version': environment.version
    }
  });
}

function handle401Error(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router,
  snackBar: MatSnackBar
): Observable<any> {
  if (!isRefreshing.value) {
    isRefreshing.next(true);
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap(response => {
        isRefreshing.next(false);
        refreshTokenSubject.next(response.token);
        return next(addTokenToRequest(request, response.token));
      }),
      catchError(error => {
        isRefreshing.next(false);
        authService.logout();
        router.navigate(['/auth/login']);
        snackBar.open('Session expirée, veuillez vous reconnecter', 'Fermer', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
        return throwError(() => error);
      })
    );
  }

  return refreshTokenSubject.pipe(
    switchMap(token => {
      if (token) {
        return next(addTokenToRequest(request, token));
      }
      return throwError(() => new Error('Token refresh failed'));
    })
  );
}

function handleError(error: HttpErrorResponse, router: Router, snackBar: MatSnackBar): void {
  let errorMessage = 'Une erreur est survenue';
  let action = 'Fermer';
  let duration = 5000;

  if (error.error instanceof ErrorEvent) {
    // Client-side error
    errorMessage = error.error.message;
  } else {
    // Server-side error
    switch (error.status) {
      case 400:
        errorMessage = error.error?.message || 'Requête invalide';
        break;
      case 403:
        errorMessage = 'Accès non autorisé';
        router.navigate(['/auth/login']);
        break;
      case 404:
        errorMessage = 'Ressource non trouvée';
        break;
      case 409:
        errorMessage = 'Conflit de données';
        break;
      case 422:
        errorMessage = 'Données invalides';
        break;
      case 429:
        errorMessage = 'Trop de requêtes, veuillez réessayer plus tard';
        duration = 10000;
        break;
      case 500:
        errorMessage = 'Erreur serveur';
        action = 'Réessayer';
        break;
      case 503:
        errorMessage = 'Service temporairement indisponible';
        action = 'Réessayer';
        break;
    }
  }

  snackBar.open(errorMessage, action, {
    duration,
    horizontalPosition: 'center',
    verticalPosition: 'bottom',
    panelClass: ['error-snackbar']
  });
}
