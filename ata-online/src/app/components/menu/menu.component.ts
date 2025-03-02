import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../commom/auth/service/authentication.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {

  rotaParaRegistros: string = '';
  isAuthenticated: boolean = false;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
  ) {}

  ngOnInit() {
    // this.getUrlParameterToRegistrosPage();
    this.checkAuthUser();
    this.checkToken();
  }

  getSessionUrlParameter(rota: string): void {
    const urlParamMeeting = sessionStorage.getItem('url-param-meeting');
    const queryParams = urlParamMeeting ? { ata: urlParamMeeting } : {};

    this.rotaParaRegistros = rota;

    this.router.navigate([this.rotaParaRegistros], { queryParams });
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['index']);
  }

  checkToken(): void {
     this.authenticationService.usuarioLogado$.pipe(
        take(1))
        .subscribe(userLogged => {
      if(!userLogged){
        console.log('navegador fechado e aberto novamente. executar refreshToken');
        this.authenticationService.refreshToken();
        return
      }
      if(userLogged){
        let isTokenExpirado = this.authenticationService.tokenExpirou(userLogged.token);
        console.log('token expirou?', isTokenExpirado);
        const tempoRestanteToken = this.authenticationService.tempoRestanteDoToken(userLogged.token);
        if(isTokenExpirado || tempoRestanteToken < 120000){ // 120000 mili = 2 minutos
          console.log('access_token expirado ou proximo da expiração. fazer uma nova requisição para atualizá-lo');
          this.authenticationService.refreshToken();
        }
      }
    });
  }

  checkAuthUser() { 
    this.authenticationService.usuarioEstaLogado().subscribe(
      (isAuth) => {        
        if (isAuth)
          this.isAuthenticated = true;
        else
          this.isAuthenticated = false;
      }
    );
  }
}