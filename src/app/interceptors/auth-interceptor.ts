import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, throwError } from 'rxjs';
import { Auth } from '../services/auth';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const platformId = inject(PLATFORM_ID);
  const authService = inject(Auth);
  const router = inject(Router);

  let clonedReq = req;

  if (isPlatformBrowser(platformId)) {
    const token = authService.getToken();
    if (token) {
      clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  }

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {

      if (error.status === 401) {

        console.warn('Sesión expirada. Cerrando sesión...');

        authService.logout();
      }
      
      return throwError(() => error);
    })
  );
};