import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from './auth/service/authentication.service';
import { inject } from '@angular/core';
import { map } from 'rxjs';

export const canMatchAuthGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthenticationService);
  const router = inject(Router);

  // const r = JSON.stringify(route);
  // const rr = JSON.parse(r);
  // console.log(rr.path);
  
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
