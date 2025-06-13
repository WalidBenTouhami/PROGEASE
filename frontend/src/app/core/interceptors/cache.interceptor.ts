import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs/operators';
import { CacheService } from '../../services/cache.service';

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  const cacheService = inject(CacheService);

  // Vérifier si la requête est en cache
  const cachedResponse = cacheService.get(req.url);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Si pas en cache, exécuter la requête et mettre en cache
  return next(req).pipe(
    tap(response => {
      // Mettre en cache uniquement les requêtes GET
      if (req.method === 'GET') {
        cacheService.set(req.url, response);
      }
    })
  );
}; 