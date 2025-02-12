import { CanActivateFn, Router, RouterEvent } from '@angular/router';
import { AuthenticationService } from './auth/service/authentication.service';
import { inject } from '@angular/core';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {

  const authenticationService = inject(AuthenticationService);
  const router = inject(Router)

  return authenticationService.usuarioEstaLogado()
    .pipe(
      map((isAuthenticated) => {
        if(!isAuthenticated){            
          router.navigate(['/auth/login']);
          return false;
        }  else {
          return true;
        }
      })
    )
};
