import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../../models/product.model';
import { CartItem } from '../../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private storageKey = 'cartItems';
  // Make the BehaviorSubject private and expose the observable publicly.
  private cartItemsSubject = new BehaviorSubject<CartItem[]>(this.loadCartFromLocalStorage());
  cartItems$ = this.cartItemsSubject.asObservable();

  constructor() {
    // Whenever cart items change, persist them to local storage.
    this.cartItems$.subscribe(items => {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    });
  }

  private loadCartFromLocalStorage(): CartItem[] {
    const storedCart = localStorage.getItem(this.storageKey);
    return storedCart ? JSON.parse(storedCart) : [];
  }

  addToCart(product: Product): void {
    const items = this.cartItemsSubject.getValue();
    const existingItem = items.find(item => item.product.id === product.id);
    if (existingItem) {
      // existingItem.quantity += 1;
    } else {
      items.push({ product, quantity: 1 });
    }
    this.cartItemsSubject.next([...items]);
  }

  removeFromCart(productId: number): void {
    let items = this.cartItemsSubject.getValue();
    items = items.filter(item => item.product.id !== productId);
    this.cartItemsSubject.next([...items]);
  }

  updateQuantity(productId: number, quantity: number): void {
    const items = this.cartItemsSubject.getValue();
    const item = items.find(i => i.product.id === productId);
    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) {
        this.removeFromCart(productId);
        return;
      }
      this.cartItemsSubject.next([...items]);
    }
  }

  getCartTotal(): number {
    const items = this.cartItemsSubject.getValue();
    return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  clearCart(): void {
    this.cartItemsSubject.next([]);
  }

  // Expose the current cart items for use in components or tests.
  get currentCartItems(): CartItem[] {
    return this.cartItemsSubject.getValue();
  }
}
