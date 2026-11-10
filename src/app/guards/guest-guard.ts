import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';
import { inject } from '@angular/core';

export const guestGuard: CanActivateFn = (route, state) => {

  const authService = inject(Auth);

  const router = inject(Router);

  const user = authService.currentUser();

  if (user) {

    if (user.role === 'ADMIN') {

      router.navigate(['/admin']);
    } else {

      router.navigate(['/tienda']);
    }

    return false;
  }

  return true;
};
