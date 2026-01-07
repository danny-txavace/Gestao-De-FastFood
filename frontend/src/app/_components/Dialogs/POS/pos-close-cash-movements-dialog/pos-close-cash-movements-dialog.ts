import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { Divider } from 'primeng/divider';
import { FloatLabel } from 'primeng/floatlabel';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputNumber } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { Subscription, take } from 'rxjs';
import { CashRegisterCloseDTO } from '../../../../_interfaces/cash-register-close-dto';
import { CountUpRespository } from '../../../../_repositories/count-up-respository';
import { DialogCreateRepository } from '../../../../_repositories/dialog-create-repository';
import { ToastRepository } from '../../../../_repositories/toast-repository';
import { CashRegisterService } from '../../../../_services/cash-register-service';
import { NotificationHub } from '../../../../_services/notification-hub';
import { PosCheckRepository } from '../../../../_repositories/pos-check-repository';
import { TranslateModule } from '@ngx-translate/core';
import { RouterUrlRepository } from '../../../../_repositories/router-url-repository';
import { AuthService } from '../../../../_services/auth-service';

interface IRouterUrl {
  url: string
}

@Component({
  selector: 'app-pos-close-cash-movements-dialog',
  imports: [Ripple, FloatLabel, FormsModule, InputIcon, IconField, ReactiveFormsModule, InputTextModule, Dialog, InputNumber, Divider, TranslateModule],
  templateUrl: './pos-close-cash-movements-dialog.html',
  styleUrl: './pos-close-cash-movements-dialog.scss',
})
export class PosCloseCashMovementsDialog implements OnInit, OnDestroy {
  private readonly cashRegstService = inject(CashRegisterService);
  private readonly hubNotif = inject(NotificationHub);
  private readonly toastRep = inject(ToastRepository);
  private dialogCreateRep = inject(DialogCreateRepository);
  private readonly countUpRep = inject(CountUpRespository);
  private posCheckRep = inject(PosCheckRepository);
  cashRegisterId: string = '';
  private readonly subs = new Subscription();
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly routerUrl = inject(RouterUrlRepository);

  form!: FormGroup;
  showLoader = false;

  visible: boolean = false;

   // Total Cards
  @ViewChild ('countUpAmount_InitialBalance') countUpAmount_InitialBalance!: ElementRef;
  @ViewChild ('countUpAmount_TotalRevenue') countUpAmount_TotalRevenue!: ElementRef;
  @ViewChild ('countUpAmount_TotalExpense') countUpAmount_TotalExpense!: ElementRef;
  @ViewChild ('countUpAmount_TotalProfit') countUpAmount_TotalProfit!: ElementRef;

  ngOnInit(): void {
    this.initializeForm();

    this.subs.add(
      this.dialogCreateRep.currentDialog$.subscribe(value => {
        if (value.format === 'pos-close-cash_movements')
        {
          this.visible = value.isVisible;

          this.loadingCards();
          this.subs.add(
            this.hubNotif.receiveNotifs().subscribe(() => {
              this.loadingCards();
            })
          );
        }
      })
    );

    this.subs.add(
      this.posCheckRep.currentCheckPos$.subscribe(value => {
        this.cashRegisterId = value.cashRegisterId;
      })
    );
  }

  ngOnDestroy(): void {
    if (this.subs) this.subs.unsubscribe();
    this.dialogCreateRep.clear();
  }

  private initializeForm()
  {
    this.form = this.fb.group({
      amount: []
    });
  }

  private loadingCards(): void
  {
    this.subs.add(
      this.cashRegstService.getCardsById(this.cashRegisterId).subscribe(value => {
        this.countUpRep.onCountUp('countUp-Amount', this.countUpAmount_InitialBalance, value.initialBalance);
        this.countUpRep.onCountUp('countUp-Amount', this.countUpAmount_TotalRevenue, value.totalRevenue);
        this.countUpRep.onCountUp('countUp-Amount', this.countUpAmount_TotalExpense, value.totalExpense);
        this.countUpRep.onCountUp('countUp-Amount', this.countUpAmount_TotalProfit, value.totalProfit);
      })
    );
  }

  onSubmit(): void
  {
    this.showLoader = true;

    if (this.cashRegisterId !== '')
    {
      const payload: CashRegisterCloseDTO =
      {
        cashRegisterId: this.cashRegisterId,
        amount: this.form.value.amount
      };

      this.subs.add(
        this.cashRegstService.closeRegister(payload).pipe(
          take(1)
        ).subscribe({
          next: (resp) => {
            this.visible = false;
            this.showLoader = false;
            this.dialogCreateRep.clear();
            this.posCheckRep.clear();
            this.form.reset();
            this.initializeForm();

            const role = this.authService.receiveSession().roles === 'admin'
            ? 'admin'
            : 'user';

            const payload : IRouterUrl = {
              url: this.getRouterUrl(role)
            }

            this.routerUrl.send(payload);
            this.toastRep.onShowMsg('success', resp.message);
          },
          error: (err: any) => {
            this.showLoader = false;

            let errorMessage = 'ERRORS.UNEXPECTED_ERROR';

              // Most common cases (covers 95% of backends)
            if (err.error) {
              // Case 1: Simple string message
              if (typeof err.error === 'string') {
                errorMessage = err.error;
              }
              // Case 2: { message: "..." }
              else if (err.error.message) {
                errorMessage = err.error.message;
              }
              // Case 3: Validation errors (Spring Boot, NestJS, etc.)
              else if (err.error.errors || err.error.detail) {
                const errors = err.error.errors || err.error.detail;

                if (Array.isArray(errors)) {
                    // Array of strings: ["itemName is required", "price must be positive"]
                  errorMessage = errors.join(', ');
                }
                else if (typeof errors === 'object') {
                  errorMessage = 'ERRORS.REQUIRED_FIELDS';
                }
              }
            }

              // Fallback: use status text
            if (!errorMessage || errorMessage === 'An unexpected error occurred') {
              errorMessage = err.message || err.statusText || 'ERRORS.REQUEST_FAILED';
            }

            // Show toast
            this.toastRep.onShowMsg('error', errorMessage);
          }
        })
      );
    }
    else
    {
      this.showLoader = false;
      this.toastRep.onShowMsg('error', 'cash ID is null');
    }
  }

  private getRouterUrl(roles: string): string
  {
    return roles === 'admin' ? '/v1-main_management/(management-outlet:v1-main_pos)' : '/v1-user_view';
  }
}
