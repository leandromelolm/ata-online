import { CanActivateFn, Router, RouterEvent } from '@angular/router';
import { AuthenticationService } from './auth/service/authentication.service';
import { inject } from '@angular/core';
import { map, take } from 'rxjs';

export const canActivateAuthGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthenticationService);
  const router = inject(Router)
  authService.setLoadingState(true);
  return authService.usuarioEstaLogado()
    .pipe(
      take(1),
      map((isAuthenticated) => {
        if (!isAuthenticated) {
          authService.setLoadingState(false);
          router.navigate(['/auth/login']);
          return false;

        } else {
          authService.usuarioLogado$
            .pipe(
              take(1))
            .subscribe(userLogged => {
              if (!userLogged) {
                console.log('Navegador reaberto. Executar refreshToken');
                authService.refreshToken().subscribe((isRefresh) => {
                  authService.setLoadingState(false);
                  if (isRefresh) {
                    console.log('Token atualizado com sucesso!');
                  } else {
                    console.log('Falha ao atualizar o token!');
                    authService.logout();
                    // this.router.navigate(['index'])
                  }
                });
              }
              if (userLogged) {
                let isTokenExpirado = authService.tokenExpirou(userLogged.token);
                console.log('token expirou?', isTokenExpirado);
                const tempoRestanteToken = authService.tempoRestanteDoToken(userLogged.token);
                if (isTokenExpirado || tempoRestanteToken < 120000) { // 120000 mili = 2 minutos
                  console.log('access_token expirado ou próximo de expirar. executar refreshToken');

                  authService.refreshToken().subscribe((isRefresh) => {
                    authService.setLoadingState(false);
                    if (isRefresh) {
                      console.log('Token atualizado!');
                    } else {
                      console.log('Falha ao atualizar o token!!');
                      authService.logout();
                      router.navigate(['index'])
                    }
                  });
                }
              }
            })
          authService.setLoadingState(false);
          return true; // Permite rota
        }
      })
    )
};
