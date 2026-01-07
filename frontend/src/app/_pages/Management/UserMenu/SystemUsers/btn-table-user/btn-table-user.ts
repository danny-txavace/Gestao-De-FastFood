import { Component, inject } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { Ripple } from 'primeng/ripple';
import { DialogDeleteRepository } from '../../../../../_repositories/dialog-delete-repository';
import { DialogUpdateRepository } from '../../../../../_repositories/dialog-update-repository';

@Component({
  selector: 'app-btn-table-user',
  imports: [Ripple],
  templateUrl: './btn-table-user.html',
  styleUrl: './btn-table-user.scss'
})
export class BtnTableUser implements ICellRendererAngularComp {
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
      format: 'user-update',
      isVisible: true,
      id: this.params.data.id,
      name: this.params.data.username,
      phoneNumber: this.params.data.phoneNumber,
      roles: this.params.data.roles,
      isActive: this.params.data.isActive
    }
    this.dialogUpdateRep.send(payload);
  }

  showDelete(): void
  {
    const payload = {
      format: 'user-delete',
      isVisible: true,
      entityName: 'User',
      id: this.params.data.id,
      name: this.params.data.username
    }

    this.dialogDeleteRep.send(payload)
  }
}
