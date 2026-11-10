import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { CartService } from '../../../services/cart';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {

  product: any = null;
  selectedImage: string | null = null;
  selectedVariant: any = null;
  isLoading = true;
  errorMessage = '';
  
  // Nuevas variables para la cantidad y el loader del botón
  quantity: number = 1;
  isAddingToCart = false;
  
  private apiUrl = environment.apiUrl;
  
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private cartService = inject(CartService);
  private authService = inject(Auth);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.loadProduct(slug);
      }
    });
  }

  loadProduct(slug: string) {
    this.isLoading = true;

    this.http.get<any>(`${this.apiUrl}/product/slug/${slug}`).subscribe({
      next: (res) => {
        this.product = res;
        
        if (this.product.images && this.product.images.length > 0) {
          this.selectedImage = this.product.images[0].url;
        }
        
        if (this.product.variants && this.product.variants.length === 1) {
          this.selectedVariant = this.product.variants[0];
        }
        
        this.isLoading = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error cargando producto', err);
        this.isLoading = false;
        this.errorMessage = 'Producto no encontrado.';
        this.cdr.detectChanges(); 
      }
    });
  }

  selectVariant(variant: any) {
    this.selectedVariant = variant;
    this.quantity = 1; // Resetear cantidad al cambiar de variante
    this.errorMessage = '';
  }

  // 👇 Lógica de los botones + y - 👇
  increaseQuantity() {
    if (this.selectedVariant && this.quantity >= this.selectedVariant.stock) {
      return; // No dejar superar el stock
    }
    this.quantity++;
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  // 👇 Lógica para agregar al carrito 👇
  addToCart() {
    if (!this.authService.currentUser()) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.product.variants?.length > 0 && !this.selectedVariant) {
      this.errorMessage = 'Por favor, selecciona una talla o color.';
      return;
    }

    const variantId = this.selectedVariant?.id || this.product.variants[0]?.id;

    if (!variantId) {
      alert('Este producto no tiene variantes configuradas.');
      return;
    }

    this.isAddingToCart = true; // Activamos el spinner del botón
    
    // Enviamos la cantidad seleccionada (quantity)
    this.cartService.addToCart(variantId, this.quantity).subscribe({
      next: () => {
        this.isAddingToCart = false;
        this.quantity = 1; // Reseteamos a 1 después de agregar
        alert('¡Producto añadido al carrito exitosamente!');
      },
      error: (err) => {
        this.isAddingToCart = false;
        console.error(err);
        alert('Ocurrió un error al agregar al carrito. Intenta de nuevo.');
      }
    });
  }
}