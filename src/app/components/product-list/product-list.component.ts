import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart/cart.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.component.html', // External HTML file
  styleUrls: ['./product-list.component.css']  // External CSS file
})
export class ProductListComponent {
  products: Product[] = [
    { id: 1, name: 'Product 1', price: 10.00, imageUrl: 'assets/images/product.jpg' },
    { id: 2, name: 'Product 2', price: 15.00, imageUrl: 'assets/images/product.jpg' },
    { id: 3, name: 'Product 3', price: 20.00, imageUrl: 'assets/images/product.jpg' },
    { id: 4, name: 'Product 4', price: 25.00, imageUrl: 'assets/images/product.jpg' }
  ];

  constructor(private cartService: CartService) { }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
  }
}
