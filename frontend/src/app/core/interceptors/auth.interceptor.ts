// src/app/core/interceptors/auth.interceptor.ts

import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authToken = localStorage.getItem('auth_token');

  const authReq = authToken
    ? req.clone({
      headers: req.headers.set('Authorization', `Bearer ${authToken}`)
    })
    : req;

  return next(authReq);
};
