import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CartService } from '../../services/cart/cart.service';
import { DiscountService } from '../../services/discount/discount.service';
import { CartItem } from '../../models/cart.model';
import { DiscountData } from '../../models/discount.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems$: Observable<CartItem[]>;
  discountCode: string = '';
  appliedDiscount: number = 0;
  subtotal: number = 0;
  grandTotal: number = 0;

  // Toast error message for discount errors
  errorToast: string = '';
  private toastTimeout: any;

  // Local storage key for discount data
  private discountStorageKey = 'discountData';
  // Subject used to clean up subscriptions
  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private discountService: DiscountService
  ) {
    this.cartItems$ = this.cartService.cartItems$;
  }

  ngOnInit(): void {
    // Load any stored discount from local storage
    this.loadDiscount();

    // Subscribe to cart changes and recalculate totals using takeUntil for cleanup.
    this.cartItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.calculateSubtotal(items);
        this.calculateGrandTotal();
      });
  }

  ngOnDestroy(): void {
    // Signal completion to all subscriptions using takeUntil.
    this.destroy$.next();
    this.destroy$.complete();
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
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
    this.subtotal = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  }

  calculateGrandTotal(): void {
    // Grand total is subtotal minus any applied discount (never below zero).
    this.grandTotal = Math.max(this.subtotal - this.appliedDiscount, 0);
  }

  applyDiscount(): void {
    this.clearErrorToast(); // clear any existing error toast
    const currentTotal = this.subtotal;
    // Validate the discount code using the DiscountService.
    if (!this.discountService.isValidCode(this.discountCode)) {
      this.showErrorToast('Invalid discount code');
      this.appliedDiscount = 0;
      localStorage.removeItem(this.discountStorageKey);
      return;
    }
    // Calculate the discount using the DiscountService.
    this.appliedDiscount = this.discountService.calculateDiscount(
      currentTotal,
      this.discountCode
    );

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
        if (
          discountData.discountCode &&
          typeof discountData.discountAmount === 'number'
        ) {
          this.discountCode = discountData.discountCode;
          this.appliedDiscount = discountData.discountAmount;
        }
      } catch (error) {
        console.error(
          'Error parsing discount data from local storage',
          error
        );
        localStorage.removeItem(this.discountStorageKey);
      }
    }
  }

  // Displays an error toast that clears automatically after 3 seconds.
  showErrorToast(message: string): void {
    this.errorToast = message;
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastTimeout = setTimeout(() => {
      this.errorToast = '';
    }, 3000);
  }

  // Clears the error toast immediately (e.g. on keydown).
  clearErrorToast(): void {
    this.errorToast = '';
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
      this.toastTimeout = null;
    }
  }
}
