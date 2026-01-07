import { Component, inject } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { Ripple } from 'primeng/ripple';
import { DialogDeleteRepository } from '../../../../_repositories/dialog-delete-repository';
import { DialogUpdateRepository } from '../../../../_repositories/dialog-update-repository';

@Component({
  selector: 'app-btn-table-register',
  imports: [Ripple],
  templateUrl: './btn-table-register.html',
  styleUrl: './btn-table-register.scss',
})
export class BtnTableRegister implements ICellRendererAngularComp {
  private dialogDeleteRep = inject(DialogDeleteRepository);
  private dialogUpdateRep = inject(DialogUpdateRepository);
  params: any;

  agInit(params: any): void {
    this.params = params;
  }

  refresh(): boolean {
    return false;
  }

  showIngredient(): void
  {
    const payload = {
      format: 'cash_register-details',
      isVisible: true,
      id: this.params.data.id,
      name: this.params.data.operator,
    }
    this.dialogUpdateRep.send(payload)
  }

  showDelete(): void
  {
    const payload = {
      format: 'cash_register-delete',
      isVisible: true,
      entityName: 'Cash Register',
      id: this.params.data.id,
      name: this.params.data.operator
    }

    this.dialogDeleteRep.send(payload)
  }
}
