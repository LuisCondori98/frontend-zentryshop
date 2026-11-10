import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const roleGuard: CanActivateFn = (route, state) => {
  
  const authService = inject(Auth);
  const router = inject(Router);

  // 1. Obtenemos el usuario
  const user = authService.currentUser();

  // 2. Si no hay usuario, al login
  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  // 3. Obtenemos el rol esperado desde la ruta (data: { expectedRole: 'ADMIN' })
  const expectedRole = route.data['expectedRole'];

  // 4. Verificamos si el rol coincide
  if (user.role !== expectedRole) {
    // Si no coincide, lo mandamos a la tienda
    router.navigate(['/tienda']);
    return false;
  }

  // Si todo está bien, pasa
  return true;
};
