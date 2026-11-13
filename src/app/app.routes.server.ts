import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // 1. Rutas privadas: Se renderizan en el servidor en tiempo real (SSR)
  {
    path: 'carrito',
    renderMode: RenderMode.Server
  },
  {
    path: 'mis-direcciones',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/**', // El doble asterisco cubre todas las rutas de admin
    renderMode: RenderMode.Server
  },

  // 2. Rutas dinámicas: Se renderizan en el servidor
  {
    path: 'product/:slug',
    renderMode: RenderMode.Client
  },
  {
    path: 'categoria/:slug',
    renderMode: RenderMode.Server
  },

  // 3. Rutas públicas y estáticas: Se pueden pre-renderizar sin problema
  {
    path: '**', // Todo lo demás (Home, Login, Catálogo, etc.)
    renderMode: RenderMode.Prerender
  }
];