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

  username: string = '';

  rotaParaRegistros: string = '';
  isAuthenticated: boolean = false;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
  ) {}

  ngOnInit() {
    this.checkAuthUser();
    this.username = sessionStorage.getItem('username') || '';

    this.authenticationService.loading$.pipe(take(1)).subscribe((loading) => {
      console.log('loading');
      this.isLoading = loading;
    });

    if(!this.username){
      this.authenticationService.obterUsuario().pipe(take(1)).subscribe((user) =>{
        if(user){
          this.username = user.username;
        }
      })
    }
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

  checkAuthUser() { 
    this.authenticationService.usuarioEstaLogado()
    .pipe(take(1))
    .subscribe(
      (isAuth) => {        
        if (isAuth){
          this.isAuthenticated = true;
        }          
      }
    );
  }
}