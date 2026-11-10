import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Auth } from './auth';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private authService = inject(Auth);
  private apiUrl = environment.apiUrl;

  // Signals para reactividad en el Navbar
  cartItems = signal<any[]>([]);
  cartCount = signal<number>(0);

  loadCart() {
    if (!this.authService.currentUser()) return;

    this.http.get<any>(`${this.apiUrl}/cart`).subscribe(res => {
      this.cartItems.set(res.items || []);
      this.cartCount.set(res.items?.length || 0);
    });
  }

  addToCart(variantId: string, quantity: number = 1) {
    return this.http.post(`${this.apiUrl}/cart/add`, { variantId, quantity })
      .pipe(
        tap(() => this.loadCart()) // Recargamos el contador automáticamente
      );
  }

  removeItem(itemId: string) {
    return this.http.delete(`${this.apiUrl}/cart/item/${itemId}`)
      .pipe(
        tap(() => this.loadCart())
      );
  }
}