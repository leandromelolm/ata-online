import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from './auth/service/authentication.service';
import { inject } from '@angular/core';
import { map } from 'rxjs';

export const authCanMatchGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthenticationService);
  const router = inject(Router);

  return authService.usuarioEstaLogado().pipe(
    map((isAuthenticated) => {  
      if(isAuthenticated) {
        router.navigate(['/criar-evento']);
        return false;
      } else {
        return true;
      }
    })
  )
};
