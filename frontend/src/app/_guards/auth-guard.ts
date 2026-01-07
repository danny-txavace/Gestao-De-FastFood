import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../_services/auth-service';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.checkSession().pipe(
    map(session => {
      if (session.serverOk && session.is_LoggedIn) return true;

      const returnUrl = state.url;
      return router.createUrlTree([''], { queryParams: { returnUrl } });
    }),
    catchError(() => {
      return of(
        router.createUrlTree([''], {
          queryParams: { returnUrl: state.url }
        })
      )
    })
  );
};
