import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, take } from 'rxjs';
import { Login } from '../models/login';
import { HttpBaseService } from '../../../shared/base/http-base.service';
import { JwtService } from '../jwt.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService extends HttpBaseService {

  private tokenExpiration: number;
  private accessToken = this.carregarAccessTokenDoStorage();

  private subjectLogin: BehaviorSubject<any> = new BehaviorSubject(false);

  private subjectUsuario: BehaviorSubject<any> = new BehaviorSubject(this.obterUsuarioDoToken(this.accessToken));
  usuarioLogado$ = this.subjectUsuario.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private jwtService: JwtService,
    protected override readonly injector: Injector,
    private router: Router,
  ) {
    super(injector)
  }

  setLoadingState(isLoading: boolean) {
    this.loadingSubject.next(isLoading);
  }

  login(login: Login): Observable<any> {
    return this.httpPost('', login).pipe(
      take(1),
      map((resposta) => {
        // console.log(resposta);
        if(resposta.success){
          sessionStorage.setItem('access_token', resposta.content.accesstoken);
          localStorage.setItem('refresh_token', resposta.content.refreshtoken);
          this.tempoRestanteDoToken(resposta.content.accesstoken)
          const userLogged = this.obterUsuarioDoToken(resposta.content.accesstoken);
          sessionStorage.setItem('username', userLogged?.username);
          this.subjectUsuario.next(this.obterUsuarioDoToken(resposta.content.accesstoken));
          this.subjectLogin.next(true);
        }
        return resposta;
      }),
    )
  }

  logout(): void {  
    const deviceId = localStorage.getItem('device_id');
    this.httpGet(`?deviceid=${deviceId}&action=logout`).pipe(
      take(1),
      map((resposta) => {
        console.log(resposta);
      })
    ).subscribe();
    this.jwtService.removeToken()
    localStorage.removeItem('device_id');
    this.subjectUsuario.next(null);
    this.subjectLogin.next(false);
    this.router.navigate(['login']);
  }

  refreshToken(): Observable<boolean> {
    const rToken = localStorage.getItem('refresh_token');
    const deviceId = localStorage.getItem('device_id');
  
    if (!rToken || !deviceId) {
      console.warn('Sem refresh_token ou device_id, redirecionando para login...');
      this.logout();
      return of(false);
    }

    this.setLoadingState(true);
  
    console.log('Tentando renovar o token...');
    return this.httpGet(`?rtok=${rToken}&deviceid=${deviceId}&action=refreshToken`).pipe(
      map((resposta) => {
        
        if (!resposta.success) {
          console.error('Falha ao renovar token, redirecionando...');
          this.setLoadingState(false);
          this.logout();
          return false;
        }
        
        console.log('Token renovado com sucesso!');
        sessionStorage.setItem('access_token', resposta.content.accesstoken);
        localStorage.setItem('refresh_token', resposta.content.refreshtoken);
        const userLogged = this.obterUsuarioDoToken(resposta.content.accesstoken);
        sessionStorage.setItem('username', userLogged?.username);
        this.tempoRestanteDoToken(resposta.content.accesstoken);
        this.subjectUsuario.next(this.obterUsuarioDoToken(resposta.content.accesstoken));
        
        this.setLoadingState(false);
        return true;
      }),
      catchError((err) => {
        console.error('Erro ao chamar refreshToken:', err);
        this.logout();
        return of(false);
      })
    );
  }

  private carregarAccessTokenDoStorage(): any {
    return sessionStorage.getItem('access_token');
  }

  usuarioEstaLogado(): Observable<any> {
    const rToken = localStorage.getItem('refresh_token');
    if (rToken) {      
      if (!this.jwtService.isTokenExpired(rToken)) {
        // se token não estiver expirado
        this.subjectLogin.next(true);
      }
    }    
    return this.subjectLogin.asObservable();
  }
  
  tokenExpirou(token: string): boolean {
    if (token) {
      return this.jwtService.isTokenExpired(token);
    }
    return true
  }

  obterUsuario() {
    return this.subjectUsuario.asObservable();
  }

  obterUsuarioLogadoDaSessao(): { username: string; token: string } | null {
    const token = sessionStorage.getItem('access_token');
    const username = sessionStorage.getItem('username');

    if (token && username) {
      return { username, token };
    }

    return null; // Retorna null se o usuário não estiver logado
  }

  private obterUsuarioDoToken(token: string) {
    if(!token)
      return null;
    const payloadData = token.split('.')[1];
    const data = atob(payloadData);
    const {name, userId} = JSON.parse(data);
    return {username: name, userId: userId, token: token};
  }

  getUserNameWithToken(token: string) {
    if(!token)
      return null;
    const payloadData = token.split('.')[1];
    const data = atob(payloadData);
    const {name, userId} = JSON.parse(data);
    return {username: name};
  }

  private decodeToken(token: string) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp;
    } catch (error) {
      console.error('Erro ao decodificar token', error);
      return null;
    }
  }

  tempoRestanteDoToken(token: string): number {
    const expirationTime = this.decodeToken(token);
    if (!expirationTime) return 0
    else {
      this.tokenExpiration = expirationTime * 1000; // Convertendo para milissegundos
      const currentTime = new Date().getTime();
      const remainingTime = this.tokenExpiration - currentTime;     
      // this.tempoParaExpirar(remainingTime);
      return remainingTime;
    }
  }

  private tempoParaExpirar(remainingTime: number): string {
    const minutes = Math.floor(remainingTime / 60000); // 60000 milissegundos = 1 minuto
    const seconds = Math.floor((remainingTime % 60000) / 1000); // O resto do tempo em segundos
    const minutesStr = minutes.toString().padStart(2, '0');
    const secondsStr = seconds.toString().padStart(2, '0');
    const formattedTime = `${minutesStr}:${secondsStr}`
    console.log('tempo para expirar:', formattedTime)
    return formattedTime;
  }

}
