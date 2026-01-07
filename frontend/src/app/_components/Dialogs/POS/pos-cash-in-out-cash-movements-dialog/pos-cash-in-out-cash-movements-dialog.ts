import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputNumber } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { TextareaModule } from 'primeng/textarea';
import { Subscription, take } from 'rxjs';
import { CashRegisterDetailCreateDTO } from '../../../../_interfaces/cash-register-detail-create-dto';
import { DialogCreateRepository } from '../../../../_repositories/dialog-create-repository';
import { ToastRepository } from '../../../../_repositories/toast-repository';
import { CashRegisterService } from '../../../../_services/cash-register-service';
import { UpperCaseWords } from '../../../../_utils/global-methods';
import { PosCheckRepository } from '../../../../_repositories/pos-check-repository';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-pos-cash-in-out-cash-movements-dialog',
  imports: [Ripple, FloatLabel, FormsModule, InputIcon, IconField, ReactiveFormsModule, InputTextModule, Dialog, InputNumber, TextareaModule, TranslateModule],
  templateUrl: './pos-cash-in-out-cash-movements-dialog.html',
  styleUrl: './pos-cash-in-out-cash-movements-dialog.scss',
})
export class PosCashInOutCashMovementsDialog implements OnInit, OnDestroy {
  private readonly cashRegstService = inject(CashRegisterService);
  private readonly toastRep = inject(ToastRepository);
  private dialogCreateRep = inject(DialogCreateRepository);
  posCheckRep = inject(PosCheckRepository);
  cashRegisterId: string = '';
  private readonly translateService = inject(TranslateService);
  private readonly subs = new Subscription();
  private readonly fb = inject(FormBuilder);
  form!: FormGroup;
  showLoader = false;

  visible: boolean = false;
  cashName: string | undefined = '';

  title = signal<string>('');
  info = signal<string>('');
  amount = signal<string>('');
  descrp_lbl = signal<string>('');
  descrp_plh = signal<string>('');

  ngOnInit(): void {
    this.initializeForm();

    this.subs.add(
      this.dialogCreateRep.currentDialog$.subscribe(value => {
        if (value.format === 'pos-cashinout-cash_movements')
        {
          this.visible = value.isVisible;
          this.cashName = value.id;

          this.translations(this.cashName)
          this.subs.add(
            this.translateService.onLangChange.subscribe(() => this.translations(this.cashName))
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
      amount: [],
      description: [''],
    });
  }

  private translations(cashName: string | undefined): void
  {
    if (cashName === 'cash in')
    {
      this.title.set(this.translateService.instant('DIALOGS.CASH_ADJUSTMENTS.REINFORCEMENT.TITLE'));
      this.info.set(this.translateService.instant('DIALOGS.CASH_ADJUSTMENTS.REINFORCEMENT.INFO'));
      this.amount.set(this.translateService.instant('DIALOGS.CASH_ADJUSTMENTS.REINFORCEMENT.AMOUNT'));
      this.descrp_lbl.set(this.translateService.instant('DIALOGS.CASH_ADJUSTMENTS.REINFORCEMENT.DESCRIPTION.LABEL'));
      this.descrp_plh.set(this.translateService.instant('DIALOGS.CASH_ADJUSTMENTS.REINFORCEMENT.DESCRIPTION.PLACEHOLDER'));
    }
    else if (cashName === 'cash out')
    {
      this.title.set(this.translateService.instant('DIALOGS.CASH_ADJUSTMENTS.WITHDRAWAL.TITLE'));
      this.info.set(this.translateService.instant('DIALOGS.CASH_ADJUSTMENTS.WITHDRAWAL.INFO'));
      this.amount.set(this.translateService.instant('DIALOGS.CASH_ADJUSTMENTS.WITHDRAWAL.AMOUNT'));
      this.descrp_lbl.set(this.translateService.instant('DIALOGS.CASH_ADJUSTMENTS.WITHDRAWAL.DESCRIPTION.LABEL'));
      this.descrp_plh.set(this.translateService.instant('DIALOGS.CASH_ADJUSTMENTS.WITHDRAWAL.DESCRIPTION.PLACEHOLDER'));
    }
  }

  onSubmit(): void
  {
    this.showLoader = true;

    const payload: CashRegisterDetailCreateDTO =
    {
      cashRegisterId: this.cashRegisterId,
      cashName: this.cashName || '',
      amount: this.form.value.amount,
      description: UpperCaseWords(this.form.value.description ?? ''),
    };

    //console.log('payload: ', payload)

    this.subs.add(
      this.cashRegstService.createCashDetails(payload).pipe(
        take(1)
      ).subscribe({
        next: (resp) => {
          this.visible = false;
          this.showLoader = false;
          this.dialogCreateRep.clear();
          this.form.reset();
          this.initializeForm();

          this.toastRep.onShowMsg('success', resp.message);
        },
        error: (err: any) => {
          this.showLoader = false;

          let errorMessage = 'ERRORS.UNEXPECTED_ERROR';
          let fieldErrors: any = {};

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
                // Object with field names: { itemName: ["cannot be empty"], price: ["too low"] }
                fieldErrors = errors;
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
}
