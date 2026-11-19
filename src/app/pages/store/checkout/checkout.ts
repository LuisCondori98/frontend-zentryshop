import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CartService } from '../../../services/cart';
import { Address } from '../../../services/address';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ToastrService } from '@openng/ngx-toastr'; // Si ya lo instalaste

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css']
})
export class Checkout implements OnInit {

  private fb = inject(FormBuilder);
  private cartService = inject(CartService);
  private addressService = inject(Address);
  private http = inject(HttpClient);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private toastr = inject(ToastrService);

  private apiUrl = environment.apiUrl;

  checkoutForm: FormGroup;
  addresses: any[] = [];
  selectedAddressId: string | null = null;
  
  cartItems = this.cartService.cartItems;
  subtotal = '0.00';
  shippingCost = '10.00'; // Costo de envío fijo por ahora
  total = '0.00';
  isProcessing = false;

  constructor() {
    this.checkoutForm = this.fb.group({
      shippingRecipient: ['', Validators.required],
      shippingPhone: ['', Validators.required],
      shippingAddress: ['', Validators.required],
      shippingCity: ['', Validators.required],
      shippingState: ['', Validators.required],
      billingDocType: ['DNI', Validators.required],
      billingDocNumber: ['', Validators.required],
      billingName: ['']
    });
  }

    ngOnInit() {
    this.cartService.loadCart();
    this.addressService.loadAddresses();
    
    // Leemos el Signal directamente (sin subscribe)
    // Usamos un pequeño timeout para asegurarnos de que la data ya cargó
    setTimeout(() => {
      const res = this.addressService.addresses(); // <-- Paréntesis aquí
      
      this.addresses = res;
      
      // Si tiene una dirección predeterminada, la seleccionamos
      const defaultAddr = res.find((a: any) => a.isDefault);
      if (defaultAddr) {
        this.selectAddress(defaultAddr);
      }
      
      this.cdr.detectChanges();
    }, 500); // 500ms suele ser suficiente para que llegue la data del backend

    // Calcular totales
    setTimeout(() => {
      this.calculateTotals();
    }, 600);
  }

  selectAddress(addr: any) {
    this.selectedAddressId = addr.id;
    // Llenamos el formulario con los datos de la dirección
    this.checkoutForm.patchValue({
      shippingRecipient: addr.recipientName,
      shippingPhone: addr.phone,
      shippingAddress: addr.addressLine1 + (addr.addressLine2 ? ', ' + addr.addressLine2 : ''),
      shippingCity: addr.city,
      shippingState: addr.state
    });
  }

  onDocTypeChange() {
    const docType = this.checkoutForm.get('billingDocType')?.value;
    if (docType === 'DNI') {
      this.checkoutForm.get('billingName')?.clearValidators();
    } else {
      this.checkoutForm.get('billingName')?.setValidators([Validators.required]);
    }
    this.checkoutForm.get('billingName')?.updateValueAndValidity();
  }

  calculateTotals() {
    const items = this.cartItems();
    const sub = items.reduce((acc, item) => {
      const price = item.variant.price || item.variant.product.price;
      return acc + (price * item.quantity);
    }, 0);
    
    this.subtotal = sub.toFixed(2);
    this.total = (sub + parseFloat(this.shippingCost)).toFixed(2);
    this.cdr.detectChanges();
  }

  /*processPayment() {
    if (this.checkoutForm.invalid) {
      this.toastr.error('Por favor, completa todos los campos requeridos.', 'Error');
      return;
    }

    if (this.cartItems().length === 0) {
      this.toastr.error('Tu carrito está vacío.', 'Error');
      return;
    }

    this.isProcessing = true;

    const payload = {
      ...this.checkoutForm.value,
      items: this.cartItems().map(item => ({
        variantId: item.variant.id,
        quantity: item.quantity
      }))
    };

    // Enviamos la orden al backend
    this.http.post(`${this.apiUrl}/orders`, payload).subscribe({
      next: (res: any) => {
        this.isProcessing = false;
        this.toastr.success('¡Pedido creado exitosamente!', 'Éxito');
        
        // Aquí iría la redirección a Mercado Pago o Nubefact
        // Por ahora, redirigimos a "Mis Pedidos"
        this.router.navigate(['/mis-pedidos']);
      },
      error: (err) => {
        this.isProcessing = false;
        this.toastr.error('Error al procesar el pago: ' + (err.error.message || 'Intenta de nuevo'), 'Error');
      }
    });
  }*/

  processPayment() {
    // 1. Validaciones básicas
    if (this.checkoutForm.invalid || this.cartItems().length === 0) return;

    // 2. Pedir la orden a NestJS
    const total = parseFloat(this.total);
    this.http.post(`${this.apiUrl}/payments/create-order`, { amount: total }).subscribe({
      next: (res: any) => {
        const orderId = res.orderId;
        this.openCulqiModal(orderId, total);
      },
      error: () => alert('Error al iniciar el pago')
    });
  }

  openCulqiModal(orderId: string, amount: number) {
    // 3. Configurar Culqi (usando la variable global window.Culqi)
    const culqi = (window as any).Culqi;
    
    culqi.publicKey = 'pk_test_tu_llave_publica'; // Tu llave pública
    culqi.settings({
      title: 'ZentryShop',
      currency: 'PEN',
      amount: Math.round(amount * 100), // En centavos
      order: orderId, // 👈 ESTO HABILITA YAPE Y PLIN
    });

    // 4. Abrir el formulario de pago
    culqi.open();

    // 5. Escuchar cuando el usuario termine en el modal
    (window as any).culqi = () => {
      if (culqi.token) {
        // Si pagó con tarjeta, te llega un token (aquí no hacemos nada aún)
        console.log('Token de tarjeta:', culqi.token.id);
      } else if (culqi.order) {
        // Si eligió Yape/Plin, el modal se cierra y Culqi.order tiene el estado
        console.log('Estado de la orden:', culqi.order.state);
        
        // Redirigimos al usuario a "Mis Pedidos"
        // (El pago real se confirma por Webhook, no aquí)
        this.router.navigate(['/mis-pedidos']);
      }
    };
  }
}