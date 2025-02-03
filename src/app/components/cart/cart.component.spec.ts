import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { CartComponent } from './cart.component';
import { CartItem } from '../../models/cart.model';
import { CartService } from '../../services/cart/cart.service';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

// Create a stub for CartService
class CartServiceStub {
  // We use BehaviorSubject to simulate cart items observable
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  // Stub methods for service actions
  removeFromCart = jasmine.createSpy('removeFromCart');
  updateQuantity = jasmine.createSpy('updateQuantity');

  // Helper to update cart items
  setCartItems(items: CartItem[]) {
    this.cartItemsSubject.next(items);
  }
}

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;
  let cartService: CartServiceStub;

  // Fake cart items for testing.
  const mockCartItems: CartItem[] = [
    { product: { id: 1, price: 10, name: 'Product 1' }, quantity: 2 },
    { product: { id: 2, price: 20, name: 'Product 2' }, quantity: 1 }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Since CartComponent is standalone, import it directly.
      imports: [CartComponent],
      providers: [
        { provide: CartService, useClass: CartServiceStub }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    cartService = TestBed.inject(CartService) as unknown as CartServiceStub;

    // Set initial cart items
    cartService.setCartItems(mockCartItems);

    // Trigger ngOnInit and initial change detection.
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate subtotal based on cart items', fakeAsync(() => {
    // For mockCartItems, expected subtotal = (10*2) + (20*1) = 40
    // Wait for subscription to emit.
    tick();
    expect(component.subtotal).toEqual(40);
    // Initially, no discount is applied so grandTotal should equal subtotal.
    expect(component.grandTotal).toEqual(40);
  }));

  it('should apply a 10% discount for code SAVE10', fakeAsync(() => {
    // Set discount code and recalc totals
    component.discountCode = 'SAVE10';
    component.applyDiscount();

    tick();

    // For subtotal 40, 10% discount = 4.
    expect(component.appliedDiscount).toEqual(4);
    // Grand total should be subtotal minus discount.
    expect(component.grandTotal).toEqual(36);

    // Check that discount data was stored in localStorage.
    const stored = localStorage.getItem('discountData');
    expect(stored).toBeTruthy();
    const discountData = JSON.parse(stored as string);
    expect(discountData.discountCode).toEqual('SAVE10');
    expect(discountData.discountAmount).toEqual(4);
    // No error message should be set.
    expect(component.discountError).toEqual('');
  }));

  it('should apply a $5 discount for code SAVE5', fakeAsync(() => {
    component.discountCode = 'SAVE5';
    component.applyDiscount();

    tick();

    // For subtotal 40, flat $5 discount.
    expect(component.appliedDiscount).toEqual(5);
    expect(component.grandTotal).toEqual(35);

    const stored = localStorage.getItem('discountData');
    expect(stored).toBeTruthy();
    const discountData = JSON.parse(stored as string);
    expect(discountData.discountCode).toEqual('SAVE5');
    expect(discountData.discountAmount).toEqual(5);
    expect(component.discountError).toEqual('');
  }));

  it('should handle invalid discount codes', fakeAsync(() => {
    component.discountCode = 'INVALID';
    component.applyDiscount();

    tick();

    // For an invalid code, no discount should be applied.
    expect(component.appliedDiscount).toEqual(0);
    // Grand total remains equal to subtotal.
    expect(component.grandTotal).toEqual(component.subtotal);
    // Error message should be set.
    expect(component.discountError).toEqual('Invalid discount code');

    // Ensure no discount is stored in localStorage.
    expect(localStorage.getItem('discountData')).toBeNull();
  }));

  it('should remove discount correctly', fakeAsync(() => {
    // First apply a discount.
    component.discountCode = 'SAVE10';
    component.applyDiscount();

    tick();

    // Now remove the discount.
    component.removeDiscount();
    tick();

    expect(component.discountCode).toEqual('');
    expect(component.appliedDiscount).toEqual(0);
    expect(component.grandTotal).toEqual(component.subtotal);
    expect(localStorage.getItem('discountData')).toBeNull();
  }));

  it('should call cartService.removeFromCart when removeFromCart is invoked', () => {
    component.removeFromCart(1);
    expect(cartService.removeFromCart).toHaveBeenCalledWith(1);
  });

  it('should update quantity when onQuantityChange is called', () => {
    // Create a fake input event.
    const event = {
      target: { value: '3' }
    } as unknown as Event;

    component.onQuantityChange(2, event);
    expect(cartService.updateQuantity).toHaveBeenCalledWith(2, 3);
  });

  it('should load discount from localStorage on init', fakeAsync(() => {
    // Pre-populate localStorage with discount data.
    const discountData = {
      discountCode: 'SAVE5',
      discountAmount: 5
    };
    localStorage.setItem('discountData', JSON.stringify(discountData));

    // Create new component instance to simulate initialization.
    const fixture2 = TestBed.createComponent(CartComponent);
    const component2 = fixture2.componentInstance;

    // Also set the same cart items.
    cartService.setCartItems(mockCartItems);
    fixture2.detectChanges();
    tick();

    // Expect that discount details are loaded.
    expect(component2.discountCode).toEqual('SAVE5');
    expect(component2.appliedDiscount).toEqual(5);
    // Grand total should reflect the discount.
    expect(component2.grandTotal).toEqual(component2.subtotal - 5);
  }));
});
