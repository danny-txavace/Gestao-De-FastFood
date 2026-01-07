import { Component, HostListener, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { PosProductsCardContent } from "../pos-products-card-content/pos-products-card-content";
import { Divider } from "primeng/divider";
import { PosOrdersCardContent } from "../pos-orders-card-content/pos-orders-card-content";
import { Observable, Subscription } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { NotificationHub } from '../../../../_services/notification-hub';
import { ProductService } from '../../../../_services/product-service';
import { ProductsListDTO } from '../../../../_interfaces/products-list-dto';
import { CartItem, PosCartItemRepository } from '../../../../_repositories/pos-cart-item-repository';
import { FormatCurrencyValue, FormatQty } from '../../../../_utils/global-methods';
import { DialogCreateRepository } from '../../../../_repositories/dialog-create-repository';
import { OrderService } from '../../../../_services/order-service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-pos-new-order',
  imports: [AsyncPipe, Divider, PosProductsCardContent, PosOrdersCardContent, TranslateModule],
  templateUrl: './pos-new-order.html',
  styleUrl: './pos-new-order.scss'
})
export class PosNewOrder implements OnInit, OnDestroy {
  private readonly productService = inject(ProductService);
  private readonly orderService = inject(OrderService);
  private readonly hubNotif = inject(NotificationHub);
  private dialogCreateRep = inject(DialogCreateRepository);
  private subs = new Subscription();

  products$!: Observable<ProductsListDTO[]>;
  cartItemRepository = inject(PosCartItemRepository);
  formatQty = FormatQty;
  formatPrice = FormatCurrencyValue;

  receiptNumber = signal('');

  ngOnInit(): void {
    this.loadData();

    this.subs.add(
      this.hubNotif.receiveNotifs().subscribe(() => this.refreshData())
    );
  }

  ngOnDestroy(): void {
    if (this.subs) { this.subs.unsubscribe() }
  }

  private loadData(): void
  {
    this.products$ = this.productService.getProductContent();
    //this.products$.subscribe({ next: () => this.isLoading = false });

    this.subs.add(
      this.orderService.getReceiptNumber().subscribe(value => this.receiptNumber.set(value.receiptNumber))
    );
  }

  private refreshData(): void
  {
    this.products$ = this.productService.getProductContent();

    this.subs.add(
      this.orderService.getReceiptNumber().subscribe(value => this.receiptNumber.set(value.receiptNumber))
    );
  }

  onPayNow(): void
  {
    const payload = {
      format: 'pos_pay_now-create',
      isVisible: true,

      orderItems: this.cartItemRepository.cartItems().map((item: CartItem) => ({
        id: item.product.id,
        quantity: item.quantity
      }))
    };

    this.dialogCreateRep.send(payload);
  }

  onPlaceOrder(): void
  {
    const payload = {
      format: 'pos_customer-create',
      isVisible: true,

      totalAmount: this.cartItemRepository.totalAmount(),
      orderItems: this.cartItemRepository.cartItems().map((item: CartItem) => ({
        id: item.product.id,
        quantity: item.quantity
      }))
    };

    this.dialogCreateRep.send(payload);
  }

  @HostListener('document:keydown', ['$event'])
  onGlobalKeyDown(event: KeyboardEvent): void {
    const items = this.cartItemRepository.cartItems();
    if (!items || items.length === 0) return;

    const key = event.key.toLowerCase();

    switch (key) {
      // Ctrl+P or Cmd+P → Pay Now
      case 'p':
        if (event.shiftKey) {
          event.preventDefault();
          this.onPayNow?.();
        }
        break;

      // Alt+F → Place Order
      case 'f':
        if (event.shiftKey) {
          event.preventDefault();
          this.onPlaceOrder?.();
        }
        break;

      // Ctrl+C → Clear Cart
      case 'c':
        if (event.shiftKey) {
          // Be careful: Ctrl+C is copy — only override if you really want
          // Or use Ctrl+Shift+C or Alt+C instead
          event.preventDefault();
          this.cartItemRepository.clear();
        }
        break;
    }
  }
}
