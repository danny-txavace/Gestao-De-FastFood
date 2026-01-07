import { Component, inject, OnInit } from '@angular/core';
import { Ripple } from 'primeng/ripple';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { CartItem, PosCartItemRepository } from '../../../../../_repositories/pos-cart-item-repository';
import { DialogUpdateRepository } from '../../../../../_repositories/dialog-update-repository';
import { OrderStatusEnum } from '../../../../../_interfaces/orders-list-dto';

@Component({
  selector: 'app-btn-table-order-list',
  imports: [Ripple],
  templateUrl: './btn-table-order-list.html',
  styleUrl: './btn-table-order-list.scss',
})
export class BtnTableOrderList implements ICellRendererAngularComp, OnInit {
  cartItemRepository = inject(PosCartItemRepository);
  private dialogUpdateRep = inject(DialogUpdateRepository);
  params: any;
  status: OrderStatusEnum = OrderStatusEnum.Pending;

  ngOnInit(): void {
    this.status = this.params.data.status;
  }

  agInit(params: any): void {
    this.params = params;
  }

  refresh(): boolean {
    return false;
  }

  onPayNow(): void
  {
    const payload = {
      format: 'pos_pay_now-update',
      isVisible: true,
      id: this.params.data.id,
      name: this.params.data.fullName,
      amount: this.params.data.totalPay
    };

    this.dialogUpdateRep.send(payload);
  }

  onCancel(): void
  {}
}
