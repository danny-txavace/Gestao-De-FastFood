import { Component, inject } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { DialogDeleteRepository } from '../../../../_repositories/dialog-delete-repository';
import { DialogUpdateRepository } from '../../../../_repositories/dialog-update-repository';
import { Ripple } from 'primeng/ripple';

@Component({
  selector: 'app-btn-table-product',
  imports: [Ripple],
  templateUrl: './btn-table-product.html',
  styleUrl: './btn-table-product.scss',
})
export class BtnTableProduct implements ICellRendererAngularComp {
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
      format: 'ingredient_product-view',
      isVisible: true,
      id: this.params.data.id,
      name: this.params.data.itemName,
    }
    this.dialogUpdateRep.send(payload)
  }

  showUpdate(): void
  {
    const payload = {
      format: 'product-update',
      isVisible: true,
      id: this.params.data.id,
      name: this.params.data.itemName,
      imageUrl: this.params.data.imageUrl,
      removeImage: false,
      price: this.params.data.price,
      category: this.params.data.category,
      isActive: this.params.data.isActive
    }
    this.dialogUpdateRep.send(payload);
  }

  showDelete(): void
  {
    const payload = {
      format: 'product-delete',
      isVisible: true,
      entityName: 'Product',
      id: this.params.data.id,
      name: this.params.data.itemName
    }

    this.dialogDeleteRep.send(payload)
  }
}
