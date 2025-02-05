import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { CartComponent } from './cart.component';
import { CartItem } from '../../models/cart.model';
import { CartService } from '../../services/cart/cart.service';
import { DiscountService } from '../../services/discount/discount.service';

// Stub for CartService
class CartServiceStub {
  // Use a BehaviorSubject so we can simulate observable changes.
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  removeFromCart = jasmine.createSpy('removeFromCart');
  updateQuantity = jasmine.createSpy('updateQuantity');

  // Helper method to set cart items.
  setCartItems(items: CartItem[]) {
    this.cartItemsSubject.next(items);
  }
}

// Stub for DiscountService
class DiscountServiceStub {
  // These methods will be configured per test.
  isValidCode = jasmine.createSpy('isValidCode');
  calculateDiscount = jasmine.createSpy('calculateDiscount');
}

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;
  let cartService: CartServiceStub;
  let discountService: DiscountServiceStub;

  // Example cart items for testing: (10 * 2) + (20 * 1) = 40 subtotal.
  const mockCartItems: CartItem[] = [
    { product: { id: 1, price: 10, name: 'Product 1' }, quantity: 2 },
    { product: { id: 2, price: 20, name: 'Product 2' }, quantity: 1 }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Since CartComponent is standalone, import it directly.
      imports: [CartComponent],
      providers: [
        { provide: CartService, useClass: CartServiceStub },
        { provide: DiscountService, useClass: DiscountServiceStub }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    // Clear local storage before each test.
    localStorage.clear();

    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    cartService = TestBed.inject(CartService) as unknown as CartServiceStub;
    discountService = TestBed.inject(DiscountService) as unknown as DiscountServiceStub;

    // Set initial cart items.
    cartService.setCartItems(mockCartItems);

    // Trigger ngOnInit and initial change detection.
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate subtotal and grandTotal correctly', fakeAsync(() => {
    // Wait for the subscription in ngOnInit to update totals.
    tick();
    // Subtotal should be (10*2)+(20*1)=40.
    expect(component.subtotal).toEqual(40);
    // With no discount applied, grandTotal equals subtotal.
    expect(component.grandTotal).toEqual(40);
  }));

  it('should call cartService.removeFromCart when removeFromCart is invoked', () => {
    component.removeFromCart(1);
    expect(cartService.removeFromCart).toHaveBeenCalledWith(1);
  });

  it('should apply a 10% discount for code SAVE10', fakeAsync(() => {
    // Configure the discount service stub for the SAVE10 code.
    discountService.isValidCode.and.callFake((code: string) => code === 'SAVE10');
    discountService.calculateDiscount.and.callFake((total: number, code: string) => {
      if (code === 'SAVE10') {
        return total * 0.1;
      }
      return 0;
    });

    component.discountCode = 'SAVE10';
    component.applyDiscount();
    tick();

    // For a subtotal of 40, a 10% discount should equal 4.
    expect(component.appliedDiscount).toEqual(4);
    expect(component.grandTotal).toEqual(36);

    // Verify discount data was stored in localStorage.
    const stored = localStorage.getItem('discountData');
    expect(stored).toBeTruthy();
    const discountData = JSON.parse(stored as string);
    expect(discountData.discountCode).toEqual('SAVE10');
    expect(discountData.discountAmount).toEqual(4);

    // No error toast should be displayed.
    expect(component.errorToast).toEqual('');
  }));

  it('should apply a $5 discount for code SAVE5', fakeAsync(() => {
    discountService.isValidCode.and.callFake((code: string) => code === 'SAVE5');
    discountService.calculateDiscount.and.callFake((total: number, code: string) => {
      if (code === 'SAVE5') {
        return 5;
      }
      return 0;
    });

    component.discountCode = 'SAVE5';
    component.applyDiscount();
    tick();

    // For a subtotal of 40, a flat $5 discount should result in a grand total of 35.
    expect(component.appliedDiscount).toEqual(5);
    expect(component.grandTotal).toEqual(35);

    const stored = localStorage.getItem('discountData');
    expect(stored).toBeTruthy();
    const discountData = JSON.parse(stored as string);
    expect(discountData.discountCode).toEqual('SAVE5');
    expect(discountData.discountAmount).toEqual(5);
    expect(component.errorToast).toEqual('');
  }));

  it('should handle invalid discount codes', fakeAsync(() => {
    // For an invalid code, isValidCode returns false.
    discountService.isValidCode.and.returnValue(false);

    component.discountCode = 'INVALID';
    component.applyDiscount();
    // Immediately after applyDiscount, the error toast is set.
    expect(component.errorToast).toEqual('Invalid discount code');
    expect(component.appliedDiscount).toEqual(0);
    expect(component.grandTotal).toEqual(component.subtotal);
    expect(localStorage.getItem('discountData')).toBeNull();

    // Advance time to clear the toast (flush the timer).
    tick(3000);
    expect(component.errorToast).toEqual('');
  }));

  it('should remove discount correctly', fakeAsync(() => {
    // First apply a discount.
    discountService.isValidCode.and.callFake((code: string) => code === 'SAVE10');
    discountService.calculateDiscount.and.callFake((total: number, code: string) => total * 0.1);
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

  it('should load discount from localStorage on init', fakeAsync(() => {
    // Pre-populate localStorage with discount data.
    const discountData = {
      discountCode: 'SAVE5',
      discountAmount: 5
    };
    localStorage.setItem('discountData', JSON.stringify(discountData));

    // Create a new component instance to simulate initialization.
    const fixture2 = TestBed.createComponent(CartComponent);
    const component2 = fixture2.componentInstance;
    cartService.setCartItems(mockCartItems);
    fixture2.detectChanges();
    tick();

    // Verify that discount details are loaded.
    expect(component2.discountCode).toEqual('SAVE5');
    expect(component2.appliedDiscount).toEqual(5);
    expect(component2.grandTotal).toEqual(component2.subtotal - 5);
  }));

  it('should clear error toast automatically after 3 seconds', fakeAsync(() => {
    component.showErrorToast('Test error');
    expect(component.errorToast).toEqual('Test error');
    // Advance time by 3000ms.
    tick(3000);
    expect(component.errorToast).toEqual('');
  }));

  it('should clear error toast immediately when clearErrorToast is called', fakeAsync(() => {
    component.showErrorToast('Test error');
    tick(1000);
    // Before 3 seconds, the error toast is still visible.
    expect(component.errorToast).toEqual('Test error');
    // Clear it immediately.
    component.clearErrorToast();
    expect(component.errorToast).toEqual('');
  }));
});
