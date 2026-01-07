import { ChangeDetectorRef, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputNumber } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { Subscription, take } from 'rxjs';
import { CashRegisterCloseDTO } from '../../../../_interfaces/cash-register-close-dto';
import { CashRegisterSelectUserDTO } from '../../../../_interfaces/cash-register-select-user-dto';
import { DialogCreateRepository } from '../../../../_repositories/dialog-create-repository';
import { ToastRepository } from '../../../../_repositories/toast-repository';
import { CashRegisterService } from '../../../../_services/cash-register-service';
import { NotificationHub } from '../../../../_services/notification-hub';
import { Divider } from "primeng/divider";
import { CountUpRespository } from '../../../../_repositories/count-up-respository';
import { TranslateModule } from '@ngx-translate/core';
import { PosCheckRepository } from '../../../../_repositories/pos-check-repository';

@Component({
  selector: 'app-close-cash-register-dialog',
  imports: [Ripple, FloatLabel, FormsModule, InputIcon, IconField, ReactiveFormsModule, InputTextModule, Dialog, SelectModule, InputNumber, Divider, TranslateModule],
  templateUrl: './close-cash-register-dialog.html',
  styleUrl: './close-cash-register-dialog.scss',
})
export class CloseCashRegisterDialog implements OnInit, OnDestroy {
  private readonly cashRegstService = inject(CashRegisterService);
  private readonly hubNotif = inject(NotificationHub);
  private readonly toastRep = inject(ToastRepository);
  private dialogCreateRep = inject(DialogCreateRepository);
  private readonly countUpRep = inject(CountUpRespository);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly subs = new Subscription();
  private readonly fb = inject(FormBuilder);
  private readonly posCheckRep = inject(PosCheckRepository);

  form!: FormGroup;
  showLoader = false;

  visible: boolean = false;

  usersOptions: CashRegisterSelectUserDTO[] = [];
  private cashRegisterId: string = '';

   // Total Cards
  @ViewChild ('countUpAmount_InitialBalance') countUpAmount_InitialBalance!: ElementRef;
  @ViewChild ('countUpAmount_TotalRevenue') countUpAmount_TotalRevenue!: ElementRef;
  @ViewChild ('countUpAmount_TotalExpense') countUpAmount_TotalExpense!: ElementRef;
  @ViewChild ('countUpAmount_TotalProfit') countUpAmount_TotalProfit!: ElementRef;

  ngOnInit(): void {
    this.initializeForm();

    this.subs.add(
      this.dialogCreateRep.currentDialog$.subscribe(value => {
        if (value.format === 'close-cash_register')
        {
          this.visible = value.isVisible;

          this.loadingSelectUser();
          this.loadCards();
          this.subs.add(
            this.hubNotif.receiveNotifs().subscribe(() => {
              this.loadingSelectUser();
              this.loadingCards(this.cashRegisterId);
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
      cashRegisterId: [null, Validators.required],
      amount: []
    });
  }

  private loadingSelectUser(): void
  {
    this.subs.add(
      this.cashRegstService.getSelectUserToCloseCash().subscribe((data: any) => {
        this.usersOptions = data;
        this.cdr.detectChanges();
      })
    );
  }

  private loadCards()
  {
    this.subs.add(
      this.form.get('cashRegisterId')?.valueChanges.subscribe(value => {
        this.loadingCards(value);
        this.cashRegisterId = value;
      })
    );
  }

  private loadingCards(id: string): void
  {
    if (id !== null && id !== '')
    {
      this.subs.add(
        this.cashRegstService.getCardsById(id).subscribe(value => {
          this.countUpRep.onCountUp('countUp-Amount', this.countUpAmount_InitialBalance, value.initialBalance);
          this.countUpRep.onCountUp('countUp-Amount', this.countUpAmount_TotalRevenue, value.totalRevenue);
          this.countUpRep.onCountUp('countUp-Amount', this.countUpAmount_TotalExpense, value.totalExpense);
          this.countUpRep.onCountUp('countUp-Amount', this.countUpAmount_TotalProfit, value.totalProfit);
        })
      );
    }
  }

  onSubmit(): void
  {
    this.showLoader = true;

    if (this.form.valid)
    {
      const payload: CashRegisterCloseDTO = this.form.value;

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
      this.toastRep.onShowMsg('info', 'ERRORS.HINT');
    }
  }
}
