import { CanActivateFn, Router, RouterEvent } from '@angular/router';
import { AuthenticationService } from './auth/service/authentication.service';
import { inject } from '@angular/core';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {

  // console.log(route, state)

  const authenticationService = inject(AuthenticationService);
  const router = inject(Router)

  return authenticationService.usuarioEstaLogado()
    .pipe(
      map((res) => {
        if(!res){            
          router.navigate(['/auth/login']);
          return false;
        }  else {
          if(state.url === '/auth/login'){
            router.navigate(['/criar-evento']);
          }
          return true;
        }
      })
    )
};
