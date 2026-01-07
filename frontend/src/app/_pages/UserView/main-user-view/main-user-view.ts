import { Component, DestroyRef, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { Ripple } from 'primeng/ripple';
import { TabsModule } from 'primeng/tabs';
import { catchError, of, Subscription, tap } from 'rxjs';
import { DialogCreateRepository } from '../../../_repositories/dialog-create-repository';
import { PosCheckRepository } from '../../../_repositories/pos-check-repository';
import { AuthService } from '../../../_services/auth-service';
import { I18nRepository } from '../../../_repositories/i18n-repository';
import { ThemesRepository } from '../../../_repositories/themes-repository';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CashRegisterService } from '../../../_services/cash-register-service';
import { CountUpRespository } from '../../../_repositories/count-up-respository';
import { FormatDateByCountry } from '../../../_utils/global-methods';
import { NotificationHub } from '../../../_services/notification-hub';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OrderService } from '../../../_services/order-service';
import { ToastRepository } from '../../../_repositories/toast-repository';
import { RouterUrlRepository } from '../../../_repositories/router-url-repository';

interface PosCheckData {
  userId: string;
  cashRegisterId: string;
  status: boolean;
}

@Component({
  selector: 'app-main-user-view',
  imports: [TabsModule, Ripple, RouterOutlet, RouterModule, CommonModule, TranslateModule],
  templateUrl: './main-user-view.html',
  styleUrl: './main-user-view.scss',
})
export class MainUserView implements OnInit, OnDestroy {
  private posCheckRep = inject(PosCheckRepository);
  authService = inject(AuthService);
  private dialogCreateRep = inject(DialogCreateRepository);
  private i18n = inject(I18nRepository);
  private themeRespository = inject(ThemesRepository);
  private readonly cashRegstService = inject(CashRegisterService);
  private readonly countUpRep = inject(CountUpRespository);
  private readonly hubNotif = inject(NotificationHub);
  private orderService = inject(OrderService);
  private destroyRef = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);
  private readonly toast = inject(ToastRepository);
  private readonly routerUrl = inject(RouterUrlRepository);

  private router = inject(Router);
  private subs = new Subscription();

  currentDate: Date = new Date();
  formatDate = FormatDateByCountry;

  isDark : boolean = false;
  @ViewChild('countUpAmount', { static: false }) countUpAmountElement!: ElementRef<HTMLElement>;

  pos_status = signal(false);
  pos_userId = signal('');
  private cashRegisterId = signal('');
  loading = signal(true);

  private initialAmnt: number = 0.00;

  ngOnInit(): void {
    //console.log('user')
    this.isDark = this.themeRespository.getStoredTheme() === 'dark';
    document.body.classList.toggle('dark', this.isDark);
    document.body.classList.toggle('light', !this.isDark);

    this.loadingData();
    this.subs.add(
      this.posCheckRep.currentCheckPos$.subscribe(value => {
        if (this.pos_status() == value.status)
        {
          this.router.navigateByUrl('v1-user_view/(pos-user_outlet:pos-new_order)', { replaceUrl: true });
        }
      })
    );

    this.subs.add(
      this.hubNotif.receiveNotifs().subscribe(() => {
        setTimeout(() => {
          //console.log('payload received: ',this.posCheckRep.get());
          this.cashRegisterId.set(this.posCheckRep.get().cashRegisterId);
          this.pos_status.set(this.posCheckRep.get().status);
          this.pos_userId.set(this.posCheckRep.get().userId);
          this.loading.set(false);

          this.loadingCards(this.cashRegisterId());

          if (this.posCheckRep.get().status == false)
          {
            this.router.navigateByUrl(this.routerUrl.receive().url, { replaceUrl: true });
          }
        }, 500)
      })
    );
  }

  ngOnDestroy(): void {
    if (this.subs) { this.subs.unsubscribe() }
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
                  this.router.navigateByUrl('/v1-user_view/(pos-user_outlet:pos-new_order)', { replaceUrl: true });
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

  private loadingCards(id: string): void
  {
    this.subs.add(
      this.cashRegstService.getCardsById(id).subscribe(value => {
        const newValue = value.initialBalance;

        // Se já existe um valor anterior
        if (this.initialAmnt !== null) {

          // Se for IGUAL → NÃO faz CountUp
          if (this.initialAmnt === newValue) {
            //console.log('Mesmo valor → não atualizar CountUp');
            return; // <-- SAI daqui
          }

          // Se for DIFERENTE → faz CountUp
          this.countUpRep.onCountUp(
            'countUp-Amount',
            this.countUpAmountElement,
            newValue
          );

        } else {

          // Primeira vez → sempre roda CountUp
          this.countUpRep.onCountUp(
            'countUp-Amount',
            this.countUpAmountElement,
            newValue
          );

        }

        // Atualiza o valor salvo
        this.initialAmnt = newValue;
      })
    );
  }

  toggleTheme() {
    this.themeRespository.toggleTheme()
    this.isDark = this.themeRespository.getStoredTheme() === 'dark';

    document.body.classList.toggle('dark', this.isDark);
    document.body.classList.toggle('light', !this.isDark);
  }

  toggleLang(): void {
    this.i18n.toggleLang()
  }

  onSignOut(): void
  {
    this.subs.add(
      this.authService.signOut()
    );
  }

  onDialogOpenCash(): void {
    const payload = {
      format: 'pos-open-cash_register',
      isVisible: true
    }
    this.dialogCreateRep.send(payload)
  }
}
