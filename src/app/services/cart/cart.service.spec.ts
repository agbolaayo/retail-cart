import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { Product } from '../../models/product.model';
import { CartItem } from '../../models/cart.model';

describe('CartService', () => {
  let service: CartService;

  // Define test products
  const product1: Product = { id: 1, name: 'Test Product 1', price: 10, imageUrl: 'test1.jpg' };
  const product2: Product = { id: 2, name: 'Test Product 2', price: 20, imageUrl: 'test2.jpg' };

  beforeEach(() => {
    // Clear local storage before each test to ensure a clean state.
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with an empty cart', () => {
    expect(service.currentCartItems.length).toBe(0);
  });

  it('should add a product to the cart', () => {
    service.addToCart(product1);
    const items: CartItem[] = service.currentCartItems;
    expect(items.length).toBe(1);
    expect(items[0].product).toEqual(product1);
    expect(items[0].quantity).toBe(1);
  });

  it('should increment quantity if the product already exists in the cart', () => {
    service.addToCart(product1);
    service.addToCart(product1);
    const items: CartItem[] = service.currentCartItems;
    expect(items.length).toBe(1);
    expect(items[0].quantity).toBe(2);
  });

  it('should remove a product from the cart', () => {
    service.addToCart(product1);
    service.addToCart(product2);
    service.removeFromCart(product1.id);
    const items: CartItem[] = service.currentCartItems;
    expect(items.length).toBe(1);
    expect(items[0].product.id).toBe(product2.id);
  });

  it('should update the quantity of a product', () => {
    service.addToCart(product1);
    service.updateQuantity(product1.id, 5);
    const items: CartItem[] = service.currentCartItems;
    expect(items[0].quantity).toBe(5);
  });

  it('should remove the product if updated quantity is zero or less', () => {
    service.addToCart(product1);
    service.updateQuantity(product1.id, 0);
    const items: CartItem[] = service.currentCartItems;
    expect(items.length).toBe(0);
  });

  it('should calculate the cart total correctly', () => {
    // Add product1 twice and product2 once.
    service.addToCart(product1); // quantity: 1, price: 10
    service.addToCart(product2); // quantity: 1, price: 20
    service.addToCart(product1); // quantity: now 2 for product1
    // Expected total: (10 * 2) + (20 * 1) = 40
    expect(service.getCartTotal()).toBe(40);
  });

  it('should clear the cart', () => {
    service.addToCart(product1);
    service.addToCart(product2);
    service.clearCart();
    expect(service.currentCartItems.length).toBe(0);
  });

  it('should persist cart items to local storage on changes', () => {
    // Add a product and then verify that local storage is updated.
    service.addToCart(product1);
    let stored = localStorage.getItem('cartItems');
    expect(stored).toBeTruthy();
    let parsed: CartItem[] = JSON.parse(stored!);
    expect(parsed.length).toBe(1);
    expect(parsed[0].product.id).toBe(product1.id);

    // Remove the product and check that local storage is updated accordingly.
    service.removeFromCart(product1.id);
    stored = localStorage.getItem('cartItems');
    expect(stored).toBeTruthy();
    parsed = JSON.parse(stored!);
    expect(parsed.length).toBe(0);
  });
});
