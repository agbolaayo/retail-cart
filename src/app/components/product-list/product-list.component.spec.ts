import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';
import { CartService } from '../../services/cart/cart.service';
import { Product } from '../../models/product.model';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

// Create a stub for CartService
class CartServiceStub {
  addToCart = jasmine.createSpy('addToCart');
}

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let cartService: CartServiceStub;

  // A minimal inline template for testing purposes.
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
      // Override the external template with our inline template.
      .overrideTemplate(ProductListComponent, inlineTemplate)
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    cartService = TestBed.inject(CartService) as unknown as CartServiceStub;
    fixture.detectChanges();
  });

  it('should create the product list component', () => {
    expect(component).toBeTruthy();
  });

  it('should have 4 products in the list', () => {
    expect(component.products.length).toBe(4);
  });

  it('should render all products', () => {
    const productElements: DebugElement[] = fixture.debugElement.queryAll(By.css('.product'));
    expect(productElements.length).toBe(4);
  });

  it('should display product names', () => {
    const productElements: DebugElement[] = fixture.debugElement.queryAll(By.css('.product-name'));
    component.products.forEach((product, index) => {
      const productNameEl: HTMLElement = productElements[index].nativeElement;
      expect(productNameEl.textContent).toContain(product.name);
    });
  });

  it('should call cartService.addToCart with the correct product when "Add to Cart" is clicked', () => {
    // Find all "Add to Cart" buttons
    const addToCartButtons = fixture.debugElement.queryAll(By.css('.add-to-cart'));
    expect(addToCartButtons.length).toBe(4);

    // Click the button for the second product (index 1)
    addToCartButtons[1].triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(cartService.addToCart).toHaveBeenCalledWith(component.products[1]);
  });
});
