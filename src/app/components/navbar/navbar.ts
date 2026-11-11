import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit {
  isHidden = false;
  isMobileMenuOpen = false;
  isUserMenuOpen = false; // <-- NUEVA VARIABLE para el menú de usuario
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

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const currentScrollY = window.scrollY;
    if (currentScrollY > this.lastScrollY && currentScrollY > 50) {
      this.isHidden = true;
    } else {
      this.isHidden = false;
    }
    this.lastScrollY = currentScrollY;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.isUserMenuOpen = false; // Cerramos el menú de usuario si abrimos el móvil
  }

  // Función para abrir/cerrar el menú de usuario
  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }
}