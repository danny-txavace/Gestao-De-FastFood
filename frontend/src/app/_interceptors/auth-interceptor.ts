import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../_services/auth-service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const skipAuth = req.url.includes('/v1/sign-in') ||
                   req.url.includes('/v1/refresh') ||
                   req.url.includes('/v1/check-session');

  if (skipAuth) return next(req);

  const token = authService.getAccessToken();
  const authReq = token ? addToken(req, token) : req;

  return next(authReq).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401(req, next, authService);
      }
      return throwError(() => error);
    })
  );
};

const handle401 = (
  request: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: AuthService
) => {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap(res => {
        isRefreshing = false;
        const newToken = res.accessToken;
        authService.setAccessToken(newToken);
        refreshTokenSubject.next(newToken);

        return next(addToken(request, newToken));
      }),
      catchError(err => {
        isRefreshing = false;
        refreshTokenSubject.next(null);
        authService.signOut();
        return throwError(() => err);
      })
    );
  }

  return refreshTokenSubject.pipe(
    filter((token): token is string => token !== null),
    take(1),
    switchMap(token => next(addToken(request, token)))
  );
};

const addToken = (req: HttpRequest<any>, token: string) => {
  if (req.url.includes('/v1/refresh')) return req;

  return req.clone({
    setHeaders: { Authorization: token }
  });
};
