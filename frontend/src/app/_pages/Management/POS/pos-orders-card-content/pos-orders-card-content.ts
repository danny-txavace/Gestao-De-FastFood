import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';
import { CartItem, PosCartItemRepository } from '../../../../_repositories/pos-cart-item-repository';
import { FormatCurrencyValue } from '../../../../_utils/global-methods';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-pos-orders-card-content',
  imports: [FormsModule, InputNumber, TranslateModule],
  templateUrl: './pos-orders-card-content.html',
  styleUrl: './pos-orders-card-content.scss',
})
export class PosOrdersCardContent {
  cartItemRepository = inject(PosCartItemRepository);

  @Input({ required: true }) cartItem!: CartItem;
  @Output() remove = new EventEmitter<void>();
  @Output() quantityChange = new EventEmitter<number>();

  formatPrice = FormatCurrencyValue;
}
