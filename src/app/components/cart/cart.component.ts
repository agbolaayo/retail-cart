import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart/cart.service';
import { Observable } from 'rxjs';
import { CartItem } from '../../models/cart.model';

interface DiscountData {
  discountCode: string;
  discountAmount: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems$: Observable<CartItem[]>;
  discountCode: string = '';
  discountError: string = '';
  appliedDiscount: number = 0;
  subtotal: number = 0;
  grandTotal: number = 0;

  // Local storage keys
  private discountStorageKey = 'discountData';

  constructor(private cartService: CartService) {
    this.cartItems$ = this.cartService.cartItems$;
  }

  ngOnInit(): void {
    // Load any stored discount from local storage
    this.loadDiscount();
    // Subscribe to cart changes so we can recalculate totals
    this.cartItems$.subscribe(items => {
      this.calculateSubtotal(items);
      this.calculateGrandTotal();
    });
  }

  removeFromCart(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  onQuantityChange(productId: number, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const quantity = parseInt(inputElement.value, 10);
    if (!isNaN(quantity)) {
      this.cartService.updateQuantity(productId, quantity);
    }
  }

  calculateSubtotal(items: CartItem[]): void {
    this.subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  calculateGrandTotal(): void {
    // Grand total is subtotal minus any applied discount.
    // Ensure we do not subtract more than the subtotal.
    this.grandTotal = Math.max(this.subtotal - this.appliedDiscount, 0);
  }

  applyDiscount(): void {
    this.discountError = '';
    const currentTotal = this.subtotal;
    if (this.discountCode.trim() === 'SAVE10') {
      // Apply 10% discount
      this.appliedDiscount = currentTotal * 0.10;
    } else if (this.discountCode.trim() === 'SAVE5') {
      // Apply a flat $5 discount
      this.appliedDiscount = 5;
    } else {
      this.discountError = 'Invalid discount code';
      this.appliedDiscount = 0;
      localStorage.removeItem(this.discountStorageKey);
      return;
    }
    const discountData: DiscountData = {
      discountCode: this.discountCode.trim(),
      discountAmount: this.appliedDiscount
    };
    localStorage.setItem(this.discountStorageKey, JSON.stringify(discountData));
    this.calculateGrandTotal();
  }

  removeDiscount(): void {
    this.discountCode = '';
    this.appliedDiscount = 0;
    localStorage.removeItem(this.discountStorageKey);
    this.calculateGrandTotal();
  }

  private loadDiscount(): void {
    const storedDiscount = localStorage.getItem(this.discountStorageKey);
    if (storedDiscount) {
      try {
        const discountData: DiscountData = JSON.parse(storedDiscount);
        if (discountData.discountCode && typeof discountData.discountAmount === 'number') {
          this.discountCode = discountData.discountCode;
          this.appliedDiscount = discountData.discountAmount;
        }
      } catch (error) {
        console.error('Error parsing discount data from local storage', error);
        localStorage.removeItem(this.discountStorageKey);
      }
    }
  }
}
