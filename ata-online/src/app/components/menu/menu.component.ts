import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../commom/auth/service/authentication.service';

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
    this.router.navigate(['index'])
  }

  checkToken(): void {
     this.authenticationService.obterUsuario().subscribe(user => {
      console.log("ckeckToken", user)
    });
    const token = localStorage.getItem('access_token');
    if (token){
      let res = this.authenticationService.tokenExpirou(token);
      console.log('token expirou?',res);      
    }
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