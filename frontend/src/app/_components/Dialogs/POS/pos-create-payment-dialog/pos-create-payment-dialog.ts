import { AfterViewInit, Component, ElementRef, HostListener, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription, take } from 'rxjs';
import { DialogCreateRepository } from '../../../../_repositories/dialog-create-repository';
import { ToastRepository } from '../../../../_repositories/toast-repository';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { IconField } from 'primeng/iconfield';
import { InputNumber } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { Divider } from "primeng/divider";
import { PosCartItemRepository } from '../../../../_repositories/pos-cart-item-repository';
import { FormatCurrencyValue } from '../../../../_utils/global-methods';
import { OrdersCreatePayNowDTO } from '../../../../_interfaces/orders-create-pay-now-dto';
import { OrderService } from '../../../../_services/order-service';
import { PosCheckRepository } from '../../../../_repositories/pos-check-repository';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-pos-create-payment-dialog',
  imports: [Ripple, FloatLabel, FormsModule, IconField, ReactiveFormsModule, InputTextModule, Dialog, InputNumber, Divider, TranslateModule],
  templateUrl: './pos-create-payment-dialog.html',
  styleUrl: './pos-create-payment-dialog.scss',
})
export class PosCreatePaymentDialog implements OnInit, OnDestroy, AfterViewInit {
  private readonly orderService = inject(OrderService);
  private posCheckRep = inject(PosCheckRepository);
  private readonly toastRep = inject(ToastRepository);
  cartItemRepository = inject(PosCartItemRepository);
  private dialogCreateRep = inject(DialogCreateRepository);
  private readonly subs = new Subscription();

  showLoader = false;
  cashRegisterId: string = '';
  visible: boolean = false;

  isCashHovered = false;
  cashPriceEnabled = false;
  cashPriceControl = new FormControl<number | null>(null);

  isEMolaHovered = false;
  eMolaPriceEnabled = false;
  eMolaPriceControl = new FormControl<number | null>(null);

  isMPesaHovered = false;
  mPesaPriceEnabled = false;
  mPesaPriceControl = new FormControl<number | null>(null);

  @ViewChild('cashField') cashField!: ElementRef;
  @ViewChild('eMolaField') eMolaField!: ElementRef;
  @ViewChild('mPesaField') mPesaField!: ElementRef;

  isCashReadonly = true;
  isEMolaReadonly = true;
  isMPesaReadonly = true;

  private orderItems: { productId: string; quantity: number }[] = [];
  formatPrice = FormatCurrencyValue;
  totalAmount = signal(0);
  totalPaid = signal(0);
  totalDue = signal(0);
  totalChange = signal(0);

  private listenerEnabled = false;

  ngOnInit(): void {
    this.subs.add(
      this.dialogCreateRep.currentDialog$.subscribe(value => {
        if (value.format === 'pos_pay_now-create')
          {
            this.listenerEnabled = true;
            this.visible = value.isVisible;

            this.orderItems = value.orderItems!.map((p: any) => ({
              productId: p.id,
              quantity: p.quantity
            }));

            this.totalAmount.set(this.cartItemRepository.totalAmount());
            this.sumAmount();

            this.cashPriceControl.valueChanges.subscribe(() => this.sumAmount());
            this.eMolaPriceControl.valueChanges.subscribe(() => this.sumAmount());
            this.mPesaPriceControl.valueChanges.subscribe(() => this.sumAmount());
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
    this.listenerEnabled = false;
  }

  ngAfterViewInit(): void {
    // Garante que as refs existam
  }

  toggleMethod(method: 'cash' | 'eMola' | 'mPesa'): void {
    // Ativar o escolhido
    switch (method) {
      case 'cash':
        this.cashPriceEnabled = !this.cashPriceEnabled;
        if (!this.cashPriceEnabled) {
          this.cashPriceControl.setValue(null);
          this.isCashReadonly = true;
        }
        else
        {
          this.isCashReadonly = false;
          this.focusInput(this.cashField);
        }
        break;
      case 'eMola':
        this.eMolaPriceEnabled = !this.eMolaPriceEnabled;
        if (!this.eMolaPriceEnabled) {
          this.eMolaPriceControl.setValue(null);
          this.isEMolaReadonly = true;
        }
        else
        {
          this.isEMolaReadonly = false;
          this.focusInput(this.eMolaField);
        }
        break;
      case 'mPesa':
        this.mPesaPriceEnabled = !this.mPesaPriceEnabled;
        if (!this.mPesaPriceEnabled) {
          this.mPesaPriceControl.setValue(null);
          this.isMPesaReadonly = true;
        }
        else
        {
          this.isMPesaReadonly = false;
          this.focusInput(this.mPesaField);
        }
        break;
    }
  }

  private focusInput(container: ElementRef): void {
    // Aguarda a animação abrir (300ms da sua transition)
    setTimeout(() => {
      const input = container.nativeElement.querySelector('input');
      if (input) {
        input.focus();
        input.select(); // seleciona o texto (ótimo para POS!)
      }
    }, 320);
  }

  sumAmount()
  {
    const totalAmount = Number(this.totalAmount() ?? 0);
    const cash = Number(this.cashPriceControl.value ?? 0);
    const eMola = Number(this.eMolaPriceControl.value ?? 0);
    const mPesa = Number(this.mPesaPriceControl.value ?? 0);

    const totalPaid = cash + eMola + mPesa;
    const totalDue = totalAmount - totalPaid;
    const totalChange = totalPaid - totalAmount;

    this.totalPaid.set(totalPaid);

    if (totalPaid < totalAmount)
    {
      this.totalDue.set(totalDue);
      this.totalChange.set(0);
    } else
    {
      this.totalChange.set(totalChange);
      this.totalDue.set(0);
    }
  }

  clearAmount() {
    this.totalPaid.set(0);
    this.totalDue.set(0);
    this.totalChange.set(0);

    this.cashPriceEnabled = false;
    this.eMolaPriceEnabled = false;
    this.mPesaPriceEnabled = false;

    this.cashPriceControl.setValue(null);
    this.eMolaPriceControl.setValue(null);
    this.mPesaPriceControl.setValue(null);
  }

  onSubmit(): void
  {
    this.showLoader = true;

    const payload: OrdersCreatePayNowDTO =
    {
      cashRegisterId: this.cashRegisterId,
      method:
      {
        cash: Number(this.cashPriceControl.value ?? 0),
        eMola: Number(this.eMolaPriceControl.value ?? 0),
        mPesa: Number(this.mPesaPriceControl.value ?? 0)
      },
      orderItems: this.orderItems
    }

    this.subs.add(
      this.orderService.createPayNow(payload).pipe(
        take(1)
      ).subscribe({
        next: (resp) => {
          this.visible = false;
          this.showLoader = false;
          this.dialogCreateRep.clear();
          this.cartItemRepository.clear();
          this.clearAmount();

          this.toastRep.onShowMsg('success', resp.message);
        },
        error: (err) => {
          this.showLoader = false;
          const msg = err.error?.message;
          this.toastRep.onShowMsg('error', msg);
          }
      })
    );
  }


  @HostListener('document:keydown', ['$event'])
  handleEnter(event: KeyboardEvent): void {
    if (!this.listenerEnabled) return;

    const key = event.key.toLowerCase();
    switch (key)
    {
      case 'n':
        if (event.shiftKey)
        {
          event.preventDefault();
          this.toggleMethod('cash');
        }
        break;
      case 'e':
        if (event.shiftKey)
        {
          event.preventDefault();
          this.toggleMethod('eMola');
        }
        break;
      case 'm':
        if (event.shiftKey)
        {
          event.preventDefault();
          this.toggleMethod('mPesa');
        }
        break;
    }
  }
}
