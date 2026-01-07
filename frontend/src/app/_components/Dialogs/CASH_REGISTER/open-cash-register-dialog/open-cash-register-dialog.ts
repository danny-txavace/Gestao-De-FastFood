import { ChangeDetectorRef, Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputNumber } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { Subscription, take, tap } from 'rxjs';
import { DialogCreateRepository } from '../../../../_repositories/dialog-create-repository';
import { ToastRepository } from '../../../../_repositories/toast-repository';
import { CashRegisterService } from '../../../../_services/cash-register-service';
import { NotificationHub } from '../../../../_services/notification-hub';
import { CashRegisterOpenDTO } from '../../../../_interfaces/cash-register-open-dto';
import { CashRegisterSelectUserDTO } from '../../../../_interfaces/cash-register-select-user-dto';
import { TranslateModule } from '@ngx-translate/core';
import { OrderService } from '../../../../_services/order-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PosCheckRepository } from '../../../../_repositories/pos-check-repository';

@Component({
  selector: 'app-open-cash-register-dialog',
  imports: [Ripple, FloatLabel, FormsModule, InputIcon, IconField, ReactiveFormsModule, InputTextModule, Dialog, SelectModule, InputNumber, TranslateModule],
  templateUrl: './open-cash-register-dialog.html',
  styleUrl: './open-cash-register-dialog.scss',
})
export class OpenCashRegisterDialog implements OnInit, OnDestroy {
  private readonly cashRegstService = inject(CashRegisterService);
  private readonly hubNotif = inject(NotificationHub);
  private readonly toastRep = inject(ToastRepository);
  private dialogCreateRep = inject(DialogCreateRepository);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly subs = new Subscription();
  private readonly fb = inject(FormBuilder);
  private orderService = inject(OrderService);
  private destroyRef = inject(DestroyRef);
  private posCheckRep = inject(PosCheckRepository);

  form!: FormGroup;
  showLoader = false;

  visible: boolean = false;

  usersOptions: CashRegisterSelectUserDTO[] = [];

  ngOnInit(): void {
    this.initializeForm();

    this.subs.add(
      this.dialogCreateRep.currentDialog$.subscribe(value => {
        if (value.format === 'open-cash_register')
        {
          this.visible = value.isVisible;

          this.loadingSelectUser();
          this.subs.add(
            this.hubNotif.receiveNotifs().subscribe(() => {
              this.loadingSelectUser();
            })
          );
        }
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
      userId: [null, Validators.required],
      amount: []
    });
  }

  private loadingSelectUser(): void
  {
    this.subs.add(
      this.cashRegstService.getSelectUserToOpenCash().subscribe((data: any) => {
        this.usersOptions = data;
        this.cdr.detectChanges();
      })
    );
  }

  onSubmit(): void
  {
    this.showLoader = true;

    if (this.form.valid)
    {
      const payload: CashRegisterOpenDTO = this.form.value;
      const userId = payload.userId;

      this.subs.add(
        this.cashRegstService.openRegister(payload).pipe(
          take(1)
        ).subscribe({
          next: (resp) => {
            this.orderService.checkPos(payload.userId)
            .pipe(
              take(1),
              takeUntilDestroyed(this.destroyRef),
              tap(response => {
                if (!response) {
                  this.posCheckRep.clear();
                  return;
                }
                else
                {
                  const payload: PosCheckData = {
                    userId: userId,
                    cashRegisterId: response.cashRegisterId ?? '',
                    status: !!response.status
                  };

                  if (payload.status == false)
                  { this.posCheckRep.clear(); }
                  else { this.posCheckRep.set(payload); }
                  //console.log('payload opened: ', payload)
                }
              })
            )
            .subscribe();

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
    else
    {
      this.showLoader = false;
      this.toastRep.onShowMsg('info', 'ERRORS.HINT');
    }
  }
}

interface PosCheckData {
  userId: string;
  cashRegisterId: string;
  status: boolean;
}
