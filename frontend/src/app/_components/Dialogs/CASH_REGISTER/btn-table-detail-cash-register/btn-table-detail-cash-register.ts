import { Component, inject, OnDestroy } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { Ripple } from 'primeng/ripple';
import { CashRegisterService } from '../../../../_services/cash-register-service';
import { Subscription, take } from 'rxjs';
import { ToastRepository } from '../../../../_repositories/toast-repository';
import { CashRegisterDetailUpdateDTO } from '../../../../_interfaces/cash-register-detail-update-dto';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-btn-table-detail-cash-register',
  imports: [Ripple],
  templateUrl: './btn-table-detail-cash-register.html',
  styleUrl: './btn-table-detail-cash-register.scss',
})
export class BtnTableDetailCashRegister implements ICellRendererAngularComp, OnDestroy {
  private readonly cashRegstService = inject(CashRegisterService);
  private readonly toastRep = inject(ToastRepository);
  private readonly translateService = inject(TranslateService);
  private readonly subs = new Subscription();

  params: any;
  showLoaderConfirm = false;
  showLoaderCancel = false;

  ngOnDestroy(): void {
    if (this.subs) this.subs.unsubscribe();
  }

  agInit(params: any): void {
    this.params = params;
  }

  refresh(): boolean {
    return false;
  }

  onConfirm(): void
  {
    this.showLoaderConfirm = true;

    const payload: CashRegisterDetailUpdateDTO =
    {
      id: this.params.data.id,
      status: true
    };

    this.subs.add(
      this.cashRegstService.updateCashDetails(payload).pipe(
        take(1)
      ).subscribe({
        next: (resp) => {
          this.showLoaderConfirm = false;

          this.toastRep.onShowMsg('success', resp.message);
        },
        error: (err: any) => {
          this.showLoaderConfirm = false;

          let errorMessage = this.translateService.instant('ERRORS.UNEXPECTED_ERROR');

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
          }

          // Fallback: use status text
          if (!errorMessage || errorMessage === 'An unexpected error occurred') {
            errorMessage = err.message || err.statusText || this.translateService.instant('ERRORS.REQUEST_FAILED');
          }

          // Show toast
          this.toastRep.onShowMsg('error', errorMessage);
        }
      })
    );
  }

  onCancel(): void
  {
    this.showLoaderCancel = true;
    //console.log('id cancelled: ', this.params.data.id)
    const payload: CashRegisterDetailUpdateDTO =
    {
      id: this.params.data.id,
      status: false
    };

    this.subs.add(
      this.cashRegstService.updateCashDetails(payload).pipe(
        take(1)
      ).subscribe({
        next: (resp) => {
          this.showLoaderCancel = false;

          this.toastRep.onShowMsg('success', resp.message);
        },
        error: (err: any) => {
          this.showLoaderCancel = false;

          let errorMessage = this.translateService.instant('ERRORS.UNEXPECTED_ERROR');

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
          }

          // Fallback: use status text
          if (!errorMessage || errorMessage === 'An unexpected error occurred') {
            errorMessage = err.message || err.statusText || this.translateService.instant('ERRORS.REQUEST_FAILED');
          }

          // Show toast
          this.toastRep.onShowMsg('error', errorMessage);
        }
      })
    );
  }
}
