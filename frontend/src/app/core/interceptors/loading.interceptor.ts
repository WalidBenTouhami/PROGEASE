import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  
  // Démarrer l'indicateur de chargement
  loadingService.startLoading();

  return next(req).pipe(
    finalize(() => {
      // Arrêter l'indicateur de chargement
      loadingService.stopLoading();
    })
  );
}; 