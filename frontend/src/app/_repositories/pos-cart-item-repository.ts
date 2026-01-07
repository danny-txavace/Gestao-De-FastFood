import { Injectable, signal } from '@angular/core';

export interface ProductPayload {
  id: string
  itemName: string
  category: string
  imageUrl: string
  price: number
}
export interface CartItem {
  product: ProductPayload
  quantity: number
}

@Injectable({
  providedIn: 'root',
})
export class PosCartItemRepository {
  private cart = signal<CartItem[]>([]);

  // Read-only signals for components
  cartItems = this.cart.asReadonly();
  totalQuantity = signal(0);
  totalAmount = signal(0);

  addProduct(product: ProductPayload) {
    this.cart.update(items => {
      const existing = items.find(i => i.product.id === product.id);
      if (existing) {
        existing.quantity += 1;
        this.updateTotals(items);
        return [...items];
      } else {
        const newItems = [...items, { product, quantity: 1 }];
        this.updateTotals(newItems);
        return newItems;
      }
    });
  }

  updateQuantity(item: CartItem, newQty: number) {
    if (newQty < 1) return;
    this.cart.update(items => {
      const updated = items.map(i =>
        i.product.id === item.product.id ? { ...i, quantity: newQty } : i
      );
      this.updateTotals(updated);
      return updated;
    });
  }

  removeItem(item: CartItem) {
    this.cart.update(items => {
      const filtered = items.filter(i => i.product.id !== item.product.id);
      this.updateTotals(filtered);
      return filtered;
    });
  }

  clear() {
    this.cart.set([]);
    this.totalQuantity.set(0);
    this.totalAmount.set(0);
  }

  private updateTotals(items: CartItem[]) {
    const qty = items.reduce((sum, i) => sum + i.quantity, 0);
    const amount = items.reduce((sum, i) => sum + (i.product.price * i.quantity), 0);
    this.totalQuantity.set(qty);
    this.totalAmount.set(amount);
  }
}
