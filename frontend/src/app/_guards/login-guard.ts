import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { take, map, catchError, of } from 'rxjs';
import { AuthService } from '../_services/auth-service';

export const loginGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.checkSession().pipe(
    take(1),
    map(res => {
      if (res.serverOk && res.is_LoggedIn) {
        router.navigate(['/v1-main_management', { outlets: { 'management-outlet': ['v1-main_dashboard'] } }], { replaceUrl: true });
        return false;
      }
      return true;
    }),
    catchError(() => of(true))
  );
};
