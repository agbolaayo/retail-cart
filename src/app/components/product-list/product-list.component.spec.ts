import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';
import { CartService } from '../../services/cart/cart.service';
import { Product } from '../../models/product.model';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

// Stub for CartService with a spy for addToCart
class CartServiceStub {
  addToCart = jasmine.createSpy('addToCart');
}

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let cartService: CartServiceStub;

  // Define custom test products
  const testProducts: Product[] = [
    { id: 101, name: 'Test Product 1', price: 10 },
    { id: 102, name: 'Test Product 2', price: 20 },
    { id: 103, name: 'Test Product 3', price: 30 }
  ];

  // Inline template used for testing
  const inlineTemplate = `
    <div *ngFor="let product of products" class="product">
      <span class="product-name">{{ product.name }}</span>
      <button class="add-to-cart" (click)="addToCart(product)">Add to Cart</button>
    </div>
  `;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [{ provide: CartService, useClass: CartServiceStub }]
    })
      .overrideTemplate(ProductListComponent, inlineTemplate)
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    // Override the default products with our test products
    component.products = testProducts;
    cartService = TestBed.inject(CartService) as unknown as CartServiceStub;
    fixture.detectChanges();
  });

  it('should render all test products', () => {
    const productElements: DebugElement[] = fixture.debugElement.queryAll(By.css('.product'));
    expect(productElements.length).toBe(testProducts.length);
  });

  it('should display the test product names', () => {
    const productNameElements: DebugElement[] = fixture.debugElement.queryAll(By.css('.product-name'));
    testProducts.forEach((product, index) => {
      const productNameEl: HTMLElement = productNameElements[index].nativeElement;
      expect(productNameEl.textContent).toContain(product.name);
    });
  });

  it('should call cartService.addToCart with the correct test product when "Add to Cart" is clicked', () => {
    // Get all "Add to Cart" buttons
    const addToCartButtons = fixture.debugElement.queryAll(By.css('.add-to-cart'));
    expect(addToCartButtons.length).toBe(testProducts.length);

    // Simulate click on the second test product (index 1)
    addToCartButtons[1].triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(cartService.addToCart).toHaveBeenCalledWith(testProducts[1]);
  });
});
