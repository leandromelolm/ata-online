import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../commom/auth/service/authentication.service';
import { Subject, take, takeUntil } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {

  username: string = '';
  isMobile: boolean = false;

  rotaParaRegistros: string = '';
  isAuthenticated: boolean = false;
  isLoading: boolean = false;
  messageLoading: string = 'Carregando usuário...';
  confirmeRedirecionar: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit() {
    // this.isAuthenticated && this.checkAuthUser(); // se o usuario autenticado, faça o check
    this.checkAuthUser();
    this.messageOfLoading();

    this.breakpointObserver.observe(['(max-width: 770px)']) // [Breakpoints.Handset] ou ['(max-width: 770px)']
      .subscribe(result => {
        this.isMobile = result.matches;
    });
  }

  ngOnDestroy() {
    this.destroy$.next(); // Emite um valor para encerrar assinaturas
    this.destroy$.complete(); // Completa o Subject para evitar vazamentos de memória
  }

  getSessionUrlParameter(rota: string): void {
    const urlParamMeeting = sessionStorage.getItem('url-param-meeting');
    const queryParams = urlParamMeeting ? { ata: urlParamMeeting } : {};
    this.rotaParaRegistros = rota;
    this.router.navigate([this.rotaParaRegistros], { queryParams });
  }

  logout(): void {
    if (!this.username) {
       window.location.href = '/index' // reload na página que desativa uso da camera
    } else {
      this.isAuthenticated = false;
      this.username = '';
      this.authenticationService.logout();
      this.router.navigate(['index']);
    }
  }

  checkAuthUser(): void { 
    this.authenticationService.usuarioEstaLogado()
    // .pipe(take(1)) // remover para atualizar o nome de usuario com o menu inserido no app-component
    .pipe(
      takeUntil(this.destroy$))
    .subscribe(
      (isAuth) => {        
        if (isAuth){
          console.log('checkAuthUser', isAuth);
          this.isAuthenticated = true;
        }          
      }
    );
  }

  messageOfLoading(): void {
    this.authenticationService.loading$.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
        next: (loading) => {
          this.isLoading = loading;
          if(!loading || !this.username) {             
            this.username = sessionStorage.getItem('username') || '';
          }
        },
        error: (err) => {
          console.log(err);
        },
        complete: () => {
          console.log('requisição completa');
        }
    })
  }

  confirmRedirectPage():void {
    if (this.confirmeRedirecionar){
      window.open('https://github.com/leandromelolm/ata-online', '_blank');
    }
    this.confirmeRedirecionar = !this.confirmeRedirecionar;
    setTimeout(() => {
      this.confirmeRedirecionar = false;
    }, 5000)
  }


  // não chamada
  atualizarNomeDeUsuarioNoMenu(): void {
    if(!this.username) {
      setTimeout(() =>{  
        this.authenticationService.obterUsuario().pipe(take(1)).subscribe((user) =>{             
          if(user) {     
            this.username = user.username;
          }
        })
      }, 5000)
    }
  }

  // não chamada
  loading(): void {
    this.authenticationService.loading$.pipe(take(1)).subscribe((loading) => {
      console.log('loading', loading);
      this.isLoading = loading;
    });
  }

}