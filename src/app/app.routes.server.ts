import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'product/:slug',
    renderMode: RenderMode.Server // <-- Renderiza en el servidor en tiempo real
  },
  {
    path: 'categoria/:slug',
    renderMode: RenderMode.Server // <-- Renderiza en el servidor en tiempo real
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender // El resto (home, login, etc.) puede ser estático
  }
];