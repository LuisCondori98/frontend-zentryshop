import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar'; // Ajusta la ruta si es necesario
import { Footer } from '../../components/footer/footer'; // Ajusta la ruta si es necesario

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, Navbar, Footer],
  template: `
    <app-navbar></app-navbar>
    <main class="min-h-screen">
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
  `
})
export class PublicLayoutComponent {}