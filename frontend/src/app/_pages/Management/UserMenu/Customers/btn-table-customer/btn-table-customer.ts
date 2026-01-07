import { Component, inject } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { Ripple } from 'primeng/ripple';
import { DialogDeleteRepository } from '../../../../../_repositories/dialog-delete-repository';
import { DialogUpdateRepository } from '../../../../../_repositories/dialog-update-repository';

@Component({
  selector: 'app-btn-table-customer',
  imports: [Ripple],
  templateUrl: './btn-table-customer.html',
  styleUrl: './btn-table-customer.scss',
})
export class BtnTableCustomer implements ICellRendererAngularComp {
  private dialogDeleteRep = inject(DialogDeleteRepository);
  private dialogUpdateRep = inject(DialogUpdateRepository);
  params: any;

  agInit(params: any): void {
    this.params = params;
  }

  refresh(): boolean {
    return false;
  }

  showUpdate(): void
  {
    const payload = {
      format: 'customer-update',
      isVisible: true,
      id: this.params.data.id,
      name: this.params.data.fullName,
      phoneNumber: this.params.data.phoneNumber,
      orderQty: this.params.data.orderQty
    }
    this.dialogUpdateRep.send(payload);
  }

  showDelete(): void
  {
    const payload = {
      format: 'customer-delete',
      isVisible: true,
      entityName: 'Customer',
      id: this.params.data.id,
      name: this.params.data.fullName
    }

    this.dialogDeleteRep.send(payload)
  }
}
