import { Component, inject } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { Ripple } from 'primeng/ripple';
import { DialogDeleteRepository } from '../../../../_repositories/dialog-delete-repository';
import { DialogUpdateRepository } from '../../../../_repositories/dialog-update-repository';

@Component({
  selector: 'app-btn-table-product-ingredient',
  imports: [Ripple],
  templateUrl: './btn-table-product-ingredient.html',
  styleUrl: './btn-table-product-ingredient.scss',
})
export class BtnTableProductIngredient implements ICellRendererAngularComp {
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
      format: 'ingredient_product-update',
      isVisible: true,
      id: this.params.data.id,
      name: this.params.data.ingredientId,
      quantity: this.params.data.quantity
    }
    this.dialogUpdateRep.send(payload);
  }

  showDelete(): void
  {
    const payload = {
      format: 'ingredient_product-delete',
      isVisible: true,
      entityName: 'Ingredient',
      id: this.params.data.id,
      name: this.params.data.itemName
    }

    this.dialogDeleteRep.send(payload)
  }
}
