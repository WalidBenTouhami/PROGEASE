import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { SessionService } from '../../services/session.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private sessionService: SessionService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
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
            case 401:
              errorMessage = 'Non authentifié';
              this.sessionService.deconnexion().subscribe(() => {
                this.router.navigate(['/login']);
              });
              break;
            case 403:
              errorMessage = 'Accès non autorisé';
              break;
            case 404:
              errorMessage = 'Ressource non trouvée';
              break;
            case 500:
              errorMessage = 'Erreur serveur';
              break;
            default:
              errorMessage = `Erreur ${error.status}: ${error.message}`;
          }
        }

        // Notification de l'erreur
        this.notificationService.showError(errorMessage);

        // Log de l'erreur
        console.error('Erreur HTTP:', error);

        return throwError(() => error);
      })
    );
  }
} 