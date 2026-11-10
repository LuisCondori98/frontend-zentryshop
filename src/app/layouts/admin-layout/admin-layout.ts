import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Notifications } from '../../services/notifications';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="flex h-screen bg-gray-100 overflow-hidden relative">
      
      <!-- Fondo oscuro (Overlay) SOLO cuando el menú está abierto -->
      <div *ngIf="isMobileMenuOpen()" 
           (click)="closeMenu()" 
           class="fixed inset-0 bg-slate-900/60 z-30 lg:hidden backdrop-blur-sm transition-opacity">
      </div>

      <!-- Sidebar -->
      <aside [ngClass]="isMobileMenuOpen() ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
             class="fixed lg:static top-0 left-0 h-full w-64 bg-slate-900 text-white flex flex-col shadow-xl z-40 transition-transform duration-300 ease-in-out">
        
        <div class="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <span class="text-xl font-bold tracking-tight">Zentry Admin</span>
          <button (click)="closeMenu()" class="lg:hidden text-slate-400 hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <a routerLink="/admin/productos" (click)="closeMenu()" routerLinkActive="bg-slate-800 text-white" class="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-colors text-sm font-medium">
            Productos
          </a>
          <a routerLink="/admin/categorias" (click)="closeMenu()" routerLinkActive="bg-slate-800 text-white" class="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-colors text-sm font-medium">
            Categorías
          </a>
          <a routerLink="/admin/usuarios" (click)="closeMenu()" routerLinkActive="bg-slate-800 text-white" class="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-colors text-sm font-medium">
            Usuarios
          </a>
        </nav>
      </aside>

      <!-- Contenido Principal -->
      <main class="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        
        <!-- Topbar -->
        <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shadow-sm z-10">
          <div class="flex items-center gap-4">
            <!-- Botón Hamburguesa -->
            <button (click)="toggleMenu()" class="lg:hidden text-slate-600 hover:text-slate-900 focus:outline-none p-1">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <h2 class="text-lg font-semibold text-slate-800">Panel de Control</h2>
          </div>
        </header>

        <!-- Área de contenido scrolleable -->
        <div class="flex-1 overflow-y-auto p-4 lg:p-8">
          <router-outlet></router-outlet>
        </div>
      </main>

      <!-- PANEL DE NOTIFICACIONES EN VIVO -->
      <div class="fixed bottom-4 right-4 w-[calc(100%-2rem)] sm:w-80 z-50 pointer-events-none">
        <div class="bg-slate-900 text-white rounded-2xl shadow-2xl overflow-hidden border border-slate-700 pointer-events-auto">
          <div class="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
            <div class="flex items-center gap-2">
              <span class="relative flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <h3 class="text-sm font-bold tracking-wide">Actividad en Vivo</h3>
            </div>
          </div>
          <div class="p-4 max-h-48 overflow-y-auto space-y-3">
            <div *ngIf="notificationService.liveAlerts().length === 0" class="text-slate-400 text-xs text-center py-2">
              Esperando actividad...
            </div>
            <div *ngFor="let alert of notificationService.liveAlerts()" class="text-xs text-slate-300 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
              <span class="font-bold text-white">{{ alert.userName }}</span> 
              {{ alert.action }} 
              <span class="font-bold text-green-400">{{ alert.productName }}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class AdminLayoutComponent {
  public notificationService = inject(Notifications);
  
  isMobileMenuOpen = signal(false);

  // Función para alternar el menú
  toggleMenu() {
    this.isMobileMenuOpen.update(val => !val);
  }

  // Función para cerrar el menú
  closeMenu() {
    this.isMobileMenuOpen.set(false);
  }
}