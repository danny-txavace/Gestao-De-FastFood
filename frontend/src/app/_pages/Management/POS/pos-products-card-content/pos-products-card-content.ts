import { Component, inject, Input } from '@angular/core';
import { ProductsListDTO } from '../../../../_interfaces/products-list-dto';
import { FormatCurrencyValue } from '../../../../_utils/global-methods';
import { PosCartItemRepository } from '../../../../_repositories/pos-cart-item-repository';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-pos-products-card-content',
  imports: [TranslateModule],
  templateUrl: './pos-products-card-content.html',
  styleUrl: './pos-products-card-content.scss',
})
export class PosProductsCardContent {
  @Input({ required: true }) productsData!: ProductsListDTO;
  @Input({ required: true }) index!: number;

  formatPrice = FormatCurrencyValue;
  private cartItemRepository = inject(PosCartItemRepository);

  addToCart() {
    const payload = {
      id: this.productsData.id,
      itemName: this.productsData.itemName,
      category: this.productsData.category,
      imageUrl: this.productsData.imageUrl,
      price: this.productsData.price
    }
    this.cartItemRepository.addProduct(payload);
  }
}
