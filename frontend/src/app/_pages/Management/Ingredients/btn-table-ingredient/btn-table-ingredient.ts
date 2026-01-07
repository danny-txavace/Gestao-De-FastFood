import { Component, inject } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { Ripple } from 'primeng/ripple';
import { DialogDeleteRepository } from '../../../../_repositories/dialog-delete-repository';
import { DialogUpdateRepository } from '../../../../_repositories/dialog-update-repository';

@Component({
  selector: 'app-btn-table-ingredient',
  imports: [Ripple],
  templateUrl: './btn-table-ingredient.html',
  styleUrl: './btn-table-ingredient.scss',
})
export class BtnTableIngredient implements ICellRendererAngularComp {
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
      format: 'ingredient-update',
      isVisible: true,
      id: this.params.data.id,
      name: this.params.data.itemName,
      batchNumber: this.params.data.batchNumber,
      packageSize: this.params.data.packageSize,
      unitOfMeasure: this.params.data.unitOfMeasure,
      quantity: this.params.data.quantity,
      unitCostPrice: this.params.data.unitCostPrice,
      expirationAt: this.params.data.expirationAt,
      isActive: this.params.data.isActive
    }
    this.dialogUpdateRep.send(payload);
  }

  showDelete(): void
  {
    const payload = {
      format: 'ingredient-delete',
      isVisible: true,
      entityName: 'Ingredient',
      id: this.params.data.id,
      name: this.params.data.itemName
    }

    this.dialogDeleteRep.send(payload)
  }
}
