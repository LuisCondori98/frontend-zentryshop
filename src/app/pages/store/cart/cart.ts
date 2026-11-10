import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../services/cart';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html'
})
export class CartComponent implements OnInit {
  cartService = inject(CartService);

  ngOnInit() {
    this.cartService.loadCart();
  }

  getTotal() {
    return this.cartService.cartItems().reduce((acc, item) => {
      const price = item.variant.price || item.variant.product.price;
      return acc + (price * item.quantity);
    }, 0).toFixed(2);
  }

  removeItem(id: string) {
    this.cartService.removeItem(id).subscribe();
  }
}