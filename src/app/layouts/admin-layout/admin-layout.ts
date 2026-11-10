import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Notifications } from '../../services/notifications';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule], // <-- 2. Agregarlo aquí
  template: `
    <div class="flex h-screen bg-gray-100 overflow-hidden relative">
      <!-- Sidebar -->
      <aside class="w-64 bg-slate-900 text-white flex flex-col h-full shadow-xl z-20">
        <div class="h-16 flex items-center px-6 border-b border-slate-800">
          <span class="text-xl font-bold tracking-tight">Zentry Admin</span>
        </div>
        <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <a routerLink="/admin/productos" routerLinkActive="bg-slate-800 text-white" class="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-colors text-sm font-medium">
            Productos
          </a>
          <a routerLink="/admin/categorias" routerLinkActive="bg-slate-800 text-white" class="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-colors text-sm font-medium">
            Categorías
          </a>
          <a routerLink="/admin/usuarios" routerLinkActive="bg-slate-800 text-white" class="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-colors text-sm font-medium">
            Usuarios
          </a>
        </nav>
      </aside>

      <!-- Contenido -->
      <main class="flex-1 flex flex-col h-full overflow-hidden relative">
        <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10">
          <h2 class="text-lg font-semibold text-slate-800">Panel de Control</h2>
        </header>
        <div class="flex-1 overflow-y-auto p-8">
          <router-outlet></router-outlet>
        </div>
      </main>

      <!-- 👇 PANEL DE NOTIFICACIONES EN VIVO 👇 -->
      <div class="absolute bottom-6 right-6 w-80 z-50 animate-fade-in">
        <div class="bg-slate-900 text-white rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
          
          <!-- Header -->
          <div class="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
            <div class="flex items-center gap-2">
              <span class="relative flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <h3 class="text-sm font-bold tracking-wide">Actividad en Vivo</h3>
            </div>
          </div>

          <!-- Lista de Alertas -->
          <div class="p-4 max-h-64 overflow-y-auto space-y-3">
            
            <div *ngIf="notificationService.liveAlerts().length === 0" class="text-slate-400 text-xs text-center py-4">
              Esperando que los clientes agreguen productos...
            </div>

            <!-- Iteramos sobre las alertas del WebSocket -->
            <div *ngFor="let alert of notificationService.liveAlerts()" class="text-sm text-slate-300 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
              <span class="font-bold text-white">{{ alert.userName }}</span> 
              {{ alert.action }} 
              <span class="font-bold text-green-400">{{ alert.productName }}</span>
            </div>

          </div>
        </div>
      </div>
      <!-- 👆 FIN DEL PANEL DE NOTIFICACIONES 👆 -->

    </div>
  `
})
export class AdminLayoutComponent {
  public notificationService = inject(Notifications);
}