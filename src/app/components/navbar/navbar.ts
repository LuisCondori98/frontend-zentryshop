import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../services/auth';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar implements OnInit {
  isHidden = false; // Controla si se oculta o no
  isMobileMenuOpen = false;
  lastScrollY = 0;

  constructor(
    public authService: Auth,
    public cartService: CartService
  ) {}

  ngOnInit() {
    if (this.authService.currentUser()) {
      this.cartService.loadCart();
    }
  }

  // Escucha el evento de scroll en la ventana
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const currentScrollY = window.scrollY;

    // Si bajamos más de 50px y vamos hacia abajo, se oculta
    if (currentScrollY > this.lastScrollY && currentScrollY > 50) {
      this.isHidden = true;
    } else {
      // Si subimos, se muestra
      this.isHidden = false;
    }

    this.lastScrollY = currentScrollY;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}