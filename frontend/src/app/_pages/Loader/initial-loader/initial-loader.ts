import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../_services/auth-service';
import { timer, Subject, Subscription } from 'rxjs';
import { switchMap, tap, retry, catchError, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-initial-loader',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './initial-loader.html',
  styleUrl: './initial-loader.scss'
})
export class InitialLoader implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  showLoader = true;

  private baseDelay = 5000;  // Start with 2s
  private maxDelay = 200000;  // Max 10s between retries

  private subs = new Subscription();

  ngOnInit(): void {
    this.startPollingUntilServerUp();
  }

  private startPollingUntilServerUp(): void {
    let attempt = 0;

    timer(0, this.baseDelay).pipe(
      switchMap(() => {
        attempt++;
        return this.authService.checkSession();
      }),
      tap(res => {
        if (!res.serverOk) {
          throw new Error('Server not OK');
        }
      }),
      tap(res => {
        this.handleSuccessfulResponse(res.is_LoggedIn);
      }),
      retry({
        count: 10,
        delay: (_, retryCount) => {
          const delay = Math.min(this.baseDelay * Math.pow(2, retryCount - 1), this.maxDelay);
          console.warn(`Server unavailable. Attempt ${retryCount} in ${delay / 1000}s...`);
          return timer(delay);
        }
      }),
      catchError(() => {
        // Never reached due to infinite retry
        return [];
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private handleSuccessfulResponse(isLoggedIn: boolean): void {
    const route = isLoggedIn ? 'dashboard' : 'sign_in';
    this.waitThenNavigate(route);
  }

  private async waitThenNavigate(route: string): Promise<void> {
    await this.delay(3000); // Show loader for 3s after connection
    this.showLoader = false;

    switch (route) {
      case 'sign_in':
        this.router.navigate(['/v1-sign_in'], { replaceUrl: true });
        break;
      case 'dashboard':
        let routerUrl = ''

        if (this.authService.receiveSession().roles === 'admin')
        {
          routerUrl = '/v1-main_management/(management-outlet:v1-main_dashboard)'
        }
        else
        {
          routerUrl = '/v1-user_view'
        }

        this.router.navigateByUrl(routerUrl, { replaceUrl: true });
        break;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subs.unsubscribe();
  }
}
