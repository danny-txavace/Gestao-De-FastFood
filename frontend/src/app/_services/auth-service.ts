import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthCheckSessionDTO } from '../_interfaces/Auth/auth-check-session-dto';
import { BehaviorSubject, catchError, Observable, of, take, tap } from 'rxjs';
import { AuthRequestDTO } from '../_interfaces/Auth/auth-request-dto';
import { AuthResponseDTO } from '../_interfaces/Auth/auth-response-dto';
import { ResponseDTO } from '../_interfaces/response-dto';
import { Router } from '@angular/router';

interface ICheckSession {
  id: string,
  username: string,
  roles: string
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly api = `${environment.myUrl}/api/Auth`;
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private loggedIn$ = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.loggedIn$.asObservable();

  get isLoggedIn(): boolean {
    return this.loggedIn$.value;
  }

  checkSession(): Observable<AuthCheckSessionDTO> {
    return this.http.get<AuthCheckSessionDTO>(`${this.api}/v1/check-session`).pipe(
      tap(res => {
        if (res.serverOk && res.is_LoggedIn) {
          this.loggedIn$.next(res.is_LoggedIn);

          const payload: ICheckSession = {
            id: res.id,
            username: res.username,
            roles: res.roles
          }
          this.sendSession(payload);
        } else {
          this.loggedIn$.next(false);
        }
      }),
      catchError(err => {
        console.warn('checkSession failed:', err);
        this.loggedIn$.next(false); // Assume not logged in
        return of({ serverOk: false, is_LoggedIn: false } as AuthCheckSessionDTO);
      })
    );
  }

  signIn(authRequest: AuthRequestDTO): Observable<AuthResponseDTO> {
    return this.http.post<AuthResponseDTO>(`${this.api}/v1/sign-in`, authRequest).pipe(
      tap(res => {
        if (res.isSuccess) {
          this.loggedIn$.next(true);
          this.accessToken = res.accessToken;
        }
      }),
      catchError(err => {
        this.loggedIn$.next(false);
        throw err; // Let component handle error
      })
    );
  }

  refreshToken(): Observable<AuthResponseDTO> {
    return this.http.post<AuthResponseDTO>(`${this.api}/v1/refresh`, null).pipe(
      tap(res => {
        if (res.isSuccess) {
          this.loggedIn$.next(true);
          this.accessToken = res.accessToken;
        } else {
          this.loggedIn$.next(false);
        }
      }),
      catchError(err => {
        console.warn('Token refresh failed:', err);
        this.loggedIn$.next(false);
        this.signOut();
        throw err;
      })
    );
  }

  signOut(): void {
    this.http.post<ResponseDTO>(`${this.api}/v1/sign-out`, null).pipe(
      take(1),
      tap(() => this.loggedIn$.next(false)),
      catchError(() => {
        this.loggedIn$.next(false);
        return of(null);
      })
    ).subscribe(() => {
      this.accessToken = null;
      this.router.navigate(['/v1-sign_in'], { replaceUrl: true });
    });
  }

  private accessToken: string | null = null;
  getAccessToken(): string | null { return this.accessToken; }
  setAccessToken(token: string): void { this.accessToken = token; }

  private stored: ICheckSession = { id: '', username: '', roles: '' };
  private sessionSubject = new BehaviorSubject<ICheckSession>(this.receiveSession());
  session$ = this.sessionSubject.asObservable();

  receiveSession(): ICheckSession
  {
    return this.stored;
  }

  sendSession(value: ICheckSession): void
  {
    this.sessionSubject.next(value);
    this.stored = value;
  }

  clearSession(): void {
    this.stored = {
      id: '',
      username: '',
      roles: ''
    };
    this.sessionSubject.next(this.stored);
  }
}
