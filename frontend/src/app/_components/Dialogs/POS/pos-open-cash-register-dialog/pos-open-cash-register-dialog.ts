import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputNumber } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { catchError, EMPTY, firstValueFrom, from, map, Subject, Subscription, switchMap, take, takeUntil, tap } from 'rxjs';
import { CashRegisterOpenDTO } from '../../../../_interfaces/cash-register-open-dto';
import { DialogCreateRepository } from '../../../../_repositories/dialog-create-repository';
import { ToastRepository } from '../../../../_repositories/toast-repository';
import { CashRegisterService } from '../../../../_services/cash-register-service';
import { AuthService } from '../../../../_services/auth-service';
import { TranslateModule } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { OrderService } from '../../../../_services/order-service';
import { PosCheckRepository } from '../../../../_repositories/pos-check-repository';

@Component({
  selector: 'app-pos-open-cash-register-dialog',
  imports: [Ripple, FloatLabel, FormsModule, InputIcon, IconField, ReactiveFormsModule, InputTextModule, Dialog, InputNumber, TranslateModule],
  templateUrl: './pos-open-cash-register-dialog.html',
  styleUrl: './pos-open-cash-register-dialog.scss',
})
export class PosOpenCashRegisterDialog implements OnInit, OnDestroy {
  private readonly cashRegstService = inject(CashRegisterService);
  private readonly toastRep = inject(ToastRepository);
  private dialogCreateRep = inject(DialogCreateRepository);
  private readonly authService = inject(AuthService);
  private readonly subs = new Subscription();
  private readonly fb = inject(FormBuilder);
  private orderService = inject(OrderService);
  private posCheckRep = inject(PosCheckRepository);

  private destroy$ = new Subject<void>();

  form!: FormGroup;
  showLoader = false;
  visible: boolean = false;

  ngOnInit(): void {
    this.initializeForm();

    this.subs.add(
      this.dialogCreateRep.currentDialog$.subscribe(value => {
        if (value.format === 'pos-open-cash_register')
        {
          this.visible = value.isVisible;
        }
      })
    );
  }

  ngOnDestroy(): void {
    if (this.subs) this.subs.unsubscribe();
    this.dialogCreateRep.clear();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm()
  {
    this.form = this.fb.group({
      amount: []
    });
  }

  onSubmit(): void {
    if (this.showLoader) return;
    this.showLoader = true;

    const payload: CashRegisterOpenDTO = {
      userId: this.authService.receiveSession().id,
      amount: this.form.value.amount
    };

    this.cashRegstService.openRegister(payload).pipe(
      take(1),

      switchMap(resp =>
        this.authService.session$.pipe(
          take(1),
          switchMap((session) =>
            from(this.getCashRegisterId(session.id)).pipe(
              map(payloadCashRegstr => ({
                resp,
                payloadCashRegstr
              }))
            )
          )
        )
      ),
      tap(({ resp, payloadCashRegstr }) => {
        if (!payloadCashRegstr) {
          this.posCheckRep.clear();
          return;
        }

        // Fluxo normal de sucesso
        this.visible = false;
        this.showLoader = false;
        this.dialogCreateRep.clear();

        this.form.reset();
        this.initializeForm();

        if (payloadCashRegstr.status === false) {
          this.posCheckRep.clear();
        } else {
          this.posCheckRep.set(payloadCashRegstr);
          //console.log('payload opened: ', payloadCashRegstr)
        }

        this.toastRep.onShowMsg('success', resp.message);
      }),

      catchError(err => {
        this.showLoader = false;
        this.handleOpenRegisterError(err);
        return EMPTY;
      }),

      takeUntil(this.destroy$)

    ).subscribe();
  }

  private handleOpenRegisterError(err: HttpErrorResponse): void {
    const payload = err.error;
    let message = null;

    if (typeof payload === 'string') {
      message = payload;
    }
    else if (payload?.message) {
      message = payload.message;
    }
    else if (payload?.errors) {
      const errors = payload.errors;

      if (Array.isArray(errors)) {
        message = errors.join(', ');
      } else if (typeof errors === 'object') {
        this.applyServerFieldErrors(errors);
        message = 'ERRORS.REQUIRED_FIELDS';
      }
    }

    this.toastRep.onShowMsg('error', message || 'ERRORS.REQUEST_FAILED');
  }

  // Optional: map server field errors to Angular form
  private applyServerFieldErrors(errors: Record<string, string[]>): void {
    Object.keys(errors).forEach(key => {
      const control = this.form.get(key);
      if (control) {
        control.setErrors({ serverError: errors[key].join(', ') });
        control.markAsTouched();
      }
    });
  }

  private async getCashRegisterId(userId: string): Promise<PosCheckData | null> {
    const response = await firstValueFrom(
      this.orderService.checkPos(userId).pipe(take(1))
    ).catch(() => null);

    if (!response) {
      this.posCheckRep.clear();
      return null;
    }

    const payload: PosCheckData = {
      userId: userId ?? '',
      cashRegisterId: response.cashRegisterId ?? '',
      status: !!response.status
    };

    if (!payload.status) {
      this.posCheckRep.clear();
      return null;
    }

    this.posCheckRep.set(payload);
    return payload || null;
  }
}

interface PosCheckData {
  userId: string;
  cashRegisterId: string;
  status: boolean;
}
