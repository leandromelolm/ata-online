import { CanActivateFn, Router, RouterEvent } from '@angular/router';
import { AuthenticationService } from './auth/service/authentication.service';
import { inject } from '@angular/core';
import { map, take } from 'rxjs';

export const canActivateAuthGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthenticationService);
  const router = inject(Router)
  authService.setLoadingState(true);
  return authService.usuarioEstaLogado()
    .pipe(take(1),
      map((isAuthenticated) => {
        if (!isAuthenticated) {
          authService.setLoadingState(false);
          router.navigate(['/auth/login']);
          return false; // Não permite rota
        }

        authService.usuarioLogado$
          .pipe(take(1))
          .subscribe(userLogged => {
            if (!userLogged) {
              console.log('Nova Sessão. Executar refreshToken');
              authService.refreshToken().subscribe((isRefresh) => {
                authService.setLoadingState(false);
                if (!isRefresh){
                  authService.logout();
                }
                else
                  console.log('Token atualizado com sucesso!');
              });
            }
            if (userLogged) {
              let isTokenExpirado = authService.tokenExpirou(userLogged.token);
              const tempoRestanteToken = authService.tempoRestanteDoToken(userLogged.token);
              if (isTokenExpirado || tempoRestanteToken < 120000) { // 120000 mili = 2 min, 870000 mili = 14,5 min
                console.log('access_token expirado ou próximo de expirar. executar refreshToken');
                authService.refreshToken().subscribe((isRefresh) => {
                  if (!isRefresh) {
                    console.log('Falha ao atualizar o token!!');
                    authService.logout();
                    router.navigate(['index'])
                  } else {
                    authService.setLoadingState(false);
                    console.log('Token atualizado!');
                  }
                });
              } else {
                console.log('Token válido');
                authService.setLoadingState(false);
              }
            }
          })        
        return true; // Permite rota        
      })
    )
};
