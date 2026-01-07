import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { Subscription, take } from 'rxjs';
import { DialogCreateRepository } from '../../../../_repositories/dialog-create-repository';
import { ToastRepository } from '../../../../_repositories/toast-repository';
import { UpperCaseWords } from '../../../../_utils/global-methods';
import { OrdersCreateDTO } from '../../../../_interfaces/orders-create-dto';
import { OrderService } from '../../../../_services/order-service';
import { PosCartItemRepository } from '../../../../_repositories/pos-cart-item-repository';
import { PosCheckRepository } from '../../../../_repositories/pos-check-repository';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-pos-create-new-order-dialog',
  imports: [Ripple, FloatLabel, FormsModule, InputIcon, IconField, ReactiveFormsModule, InputTextModule, Dialog, NgxMaskDirective, TranslateModule],
  templateUrl: './pos-create-new-order-dialog.html',
  styleUrl: './pos-create-new-order-dialog.scss',
})
export class PosCreateNewOrderDialog implements OnInit, OnDestroy {
  private readonly orderService = inject(OrderService);
  private posCheckRep = inject(PosCheckRepository);
  private readonly toastRep = inject(ToastRepository);
  cartItemRepository = inject(PosCartItemRepository);
  private dialogCreateRep = inject(DialogCreateRepository);
  private readonly subs = new Subscription();
  private readonly fb = inject(FormBuilder);

  private orderItems: { productId: string; quantity: number }[] = [];
  cashRegisterId: string = '';


  form!: FormGroup;
  showLoader = false;

  visible: boolean = false;

  ngOnInit(): void {
    this.initializeForm();

    this.subs.add(
      this.dialogCreateRep.currentDialog$.subscribe(value => {
        if (value.format === 'pos_customer-create')
          {
            this.visible = value.isVisible;

            this.orderItems = value.orderItems!.map((p: any) => ({
              productId: p.id,
              quantity: p.quantity
            }));
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
      fullName: [''],
      phoneNumber: ['']
    });
  }

  onSubmit(): void
  {
    this.showLoader = true;

    const payload: OrdersCreateDTO =
    {
      cashRegisterId: this.cashRegisterId,
      customerName: UpperCaseWords(this.form.value.fullName),
      customerPhone: this.form.value.phoneNumber,
      orderItems: this.orderItems
    };

    this.subs.add(
      this.orderService.create(payload).pipe(
        take(1)
      ).subscribe({
        next: (resp) => {
          Object.keys(this.form.controls).forEach(key => {
            this.form.get(key)?.setErrors(null);
          });
          this.visible = false;
          this.showLoader = false;
          this.dialogCreateRep.clear();
          this.cartItemRepository.clear();
          this.form.reset();
          this.initializeForm();

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
}
