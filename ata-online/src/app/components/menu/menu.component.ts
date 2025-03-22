import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../commom/auth/service/authentication.service';
import { Subject, take, takeUntil } from 'rxjs';

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
  messageLoading: string = 'Carregando usuário...';
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
  ) {}

  ngOnInit() {
    this.checkAuthUser();
    this.messageOfLoading();
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

  logout() {
    if(!this.username){
       window.location.href = '/index'
    }
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

  messageOfLoading(): void {
    this.authenticationService.loading$.pipe(
      takeUntil(this.destroy$))
      .subscribe({
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
      }     
    )
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