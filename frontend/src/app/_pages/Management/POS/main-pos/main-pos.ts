import { Component, DestroyRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { Ripple } from "primeng/ripple";
import { TabsModule } from 'primeng/tabs';
import { catchError, of, Subscription, tap } from 'rxjs';
import { AuthService } from '../../../../_services/auth-service';
import { DialogCreateRepository } from '../../../../_repositories/dialog-create-repository';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OrderService } from '../../../../_services/order-service';
import { PosCheckRepository } from '../../../../_repositories/pos-check-repository';
import { NotificationHub } from '../../../../_services/notification-hub';
import { ToastRepository } from '../../../../_repositories/toast-repository';
import { RouterUrlRepository } from '../../../../_repositories/router-url-repository';

interface PosCheckData {
  userId: string;
  cashRegisterId: string;
  status: boolean;
}

@Component({
  selector: 'app-main-pos',
  imports: [TabsModule, Ripple, RouterOutlet, RouterModule, TranslateModule],
  templateUrl: './main-pos.html',
  styleUrl: './main-pos.scss'
})
export class MainPos implements OnInit, OnDestroy {
  authService = inject(AuthService);
  private dialogCreateRep = inject(DialogCreateRepository);
  private subs = new Subscription();
  private posCheckRep = inject(PosCheckRepository);
  private readonly hubNotif = inject(NotificationHub);
  private orderService = inject(OrderService);
  private destroyRef = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);
  private readonly toast = inject(ToastRepository);
  private readonly router = inject(Router);
  private readonly routerUrl = inject(RouterUrlRepository);

  pos_status = signal(false);
  pos_userId = signal('');
  loading = signal(true);

  ngOnInit(): void {
    //console.log('admin')
    this.loadingData();
    this.subs.add(
      this.posCheckRep.currentCheckPos$.subscribe(value => {
        if (this.pos_status() == value.status)
        {
          this.router.navigateByUrl('/v1-main_management/(management-outlet:v1-main_pos/(pos-outlet:pos-new_order))', { replaceUrl: true });
        }
      })
    );

    this.subs.add(
      this.hubNotif.receiveNotifs().subscribe(() => {
        setTimeout(() => {
          //console.log('payload received: ',this.posCheckRep.get());
          this.pos_status.set(this.posCheckRep.get().status);
          this.pos_userId.set(this.posCheckRep.get().userId);
          this.loading.set(false);

          if (this.posCheckRep.get().status == false)
          {
            this.router.navigateByUrl(this.routerUrl.receive().url, { replaceUrl: true });
          }
        }, 500);
      })
    );
  }

  private loadingData(): void {
    this.authService.session$.subscribe((value) => {
      if (value !== null && value.id !== '')
      {
        this.orderService.checkPos(value.id)
          .pipe(
            takeUntilDestroyed(this.destroyRef),
            tap(response => {
              if (!response) {
                setTimeout(() => {
                  this.loading.set(false)
                }, 500)
                return;
              }
              else
              {
                const payload: PosCheckData = {
                  userId: value.id,
                  cashRegisterId: response.cashRegisterId ?? '',
                  status: !!response.status
                };
                this.posCheckRep.set(payload);

                this.pos_status.set(payload.status);
                this.pos_userId.set(payload.userId);
                setTimeout(() => {
                  this.loading.set(false)
                }, 500)
                if (payload.status)
                {
                  this.router.navigateByUrl('/v1-main_management/(management-outlet:v1-main_pos/(pos-outlet:pos-new_order))', { replaceUrl: true });
                }
                //console.log('user main pos: ',payload.userId)
                //console.log('status main pos: ',payload.status)
              }
            }),
            catchError(err => {
              this.toast.onShowMsg('error', `${this.translateService.instant('ERRORS.POS_LOAD_ERROR')}: ${err}`)
              this.posCheckRep.clear();
              setTimeout(() => {
                this.loading.set(false)
              }, 500)
              return of(null);
            })
          )
          .subscribe();
      }
      else
      {
        this.posCheckRep.clear();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subs) { this.subs.unsubscribe() }
  }

  onDialogOpenCash(): void {
    const payload = {
      format: 'pos-open-cash_register',
      isVisible: true
    }
    this.dialogCreateRep.send(payload)
  }
}
