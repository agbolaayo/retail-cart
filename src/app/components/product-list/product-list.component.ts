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
    { id: 1, name: 'XIAOMI Redmi Note 14', price: 130.43, imageUrl: 'assets/images/redmi_note_14.jpg' },
    { id: 2, name: 'IPhone 15 Pro Max', price: 2000.20, imageUrl: 'assets/images/iphone15.jpg' },
    { id: 3, name: 'Board Shoes', price: 15.78, imageUrl: 'assets/images/Board Shoes.jpg' },
    { id: 4, name: 'Mens Casual Shoes', price: 6.42, imageUrl: 'assets/images/Casual Shoes.jpg' },
    { id: 5, name: 'LED TV - Black', price: 105.23, imageUrl: 'assets/images/LED TV - Black.jpg' },
    { id: 6, name: 'Buds 6 Play', price: 40.12, imageUrl: 'assets/images/Buds 6 Play.jpg' },
    { id: 7, name: 'Wireless Mouse', price: 14.4, imageUrl: 'assets/images/Wireless Mouse.jpg' },
    { id: 8, name: 'Hp ELITEBOOK X360', price: 23.40, imageUrl: 'assets/images/Hp ELITEBOOK X360.jpg' }
  ];

  constructor(private cartService: CartService) { }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
  }
}
