import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { selectUserRole } from '../../store/auth/auth.selectors';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private store: Store,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.store.select(selectUserRole).pipe(
      map(role => {
        if (role === 'ADMIN') {
          return true;
        }
        return this.router.createUrlTree(['/dashboard']);
      })
    );
  }
} 