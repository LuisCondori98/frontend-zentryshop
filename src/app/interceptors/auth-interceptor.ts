import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  // Nos aseguramos de estar en el navegador (por el SSR)
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('access_token');

    // Si hay token, lo agregamos a la cabecera
    if (token) {
      const clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next(clonedReq); // Enviamos la petición con el token
    }
  }

  return next(req); // Si no hay token, enviamos normal
};