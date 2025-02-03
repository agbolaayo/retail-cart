import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { NavComponent } from './nav.component';
import { CartService } from '../../services/cart/cart.service';
import { CartItem } from '../../models/cart.model';

// Create a stub for CartService with a BehaviorSubject to simulate cart items.
class CartServiceStub {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  // Helper method to update the cart items.
  setCartItems(items: CartItem[]): void {
    this.cartItemsSubject.next(items);
  }
}

describe('NavComponent', () => {
  let component: NavComponent;
  let fixture: ComponentFixture<NavComponent>;
  let cartService: CartServiceStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Since NavComponent is standalone, we import it directly.
      imports: [NavComponent],
      providers: [{ provide: CartService, useClass: CartServiceStub }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavComponent);
    component = fixture.componentInstance;
    cartService = TestBed.inject(CartService) as unknown as CartServiceStub;
    fixture.detectChanges();
  });

  it('should create the nav component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize cartItemCount to 0', () => {
    expect(component.cartItemCount).toBe(0);
  });

  it('should update cartItemCount when cart items change', fakeAsync(() => {
    // Initially, cartItemCount is 0.
    expect(component.cartItemCount).toBe(0);

    // Create some test cart items.
    const testCartItems: CartItem[] = [
      { product: { id: 1, name: 'Product 1', price: 10 }, quantity: 2 },
      { product: { id: 2, name: 'Product 2', price: 15 }, quantity: 3 },
    ];

    // Update the cart items through the stub.
    cartService.setCartItems(testCartItems);
    // Allow observable subscription to propagate.
    tick();
    fixture.detectChanges();

    // The cartItemCount should equal 2 + 3 = 5.
    expect(component.cartItemCount).toBe(5);
  }));
});
