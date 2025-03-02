import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, map, Observable, take } from 'rxjs';
import { Login } from '../models/login';
import { HttpBaseService } from '../../../shared/base/http-base.service';
import { JwtService } from '../jwt.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService extends HttpBaseService {

  private accessToken = this.carregarAccessTokenDoStorage();
  private subjectUsuario: BehaviorSubject<any> = new BehaviorSubject(this.obterUsuariodoToken(this.accessToken));
  private subjectLogin: BehaviorSubject<any> = new BehaviorSubject(false);
  usuarioLogado$ = this.subjectUsuario.asObservable();

  private tokenExpiration: number;

  constructor(
    private jwtService: JwtService,
    protected override readonly injector: Injector
  ) {
    super(injector)
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
          this.subjectUsuario.next(this.obterUsuariodoToken(resposta.content.accesstoken));
          this.subjectLogin.next(true);
        }
        return resposta;
      }),
    )
  }

  logout(): void {  
    const deviceId = localStorage.getItem('deviceId');
    this.httpGet(`?deviceid=${deviceId}&action=logout`).pipe(
      map((resposta) => {
        console.log(resposta);
      })
    ).subscribe();
    this.jwtService.removeToken()
    localStorage.removeItem('deviceId');
    this.subjectUsuario.next(null);
    this.subjectLogin.next(false);
  }

  refreshToken(): void {
    const rToken = localStorage.getItem('refresh_token');
    const deviceId = localStorage.getItem('deviceId');
    
    if (rToken) {
      console.log('refreshToken', rToken, deviceId);
      this.httpGet(`?rtok=${rToken}&deviceid=${deviceId}&action=refreshToken`).pipe(
        map((resposta) => {
          if(resposta.success){
            sessionStorage.setItem('access_token', resposta.content.accesstoken);
            localStorage.setItem('refresh_token', resposta.content.refreshtoken);
            this.tempoRestanteDoToken(resposta.content.accesstoken)
            this.subjectUsuario.next(this.obterUsuariodoToken(resposta.content.accesstoken));
            this.subjectLogin.next(true);
          }
        })
      ).subscribe()
    }
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

  private obterUsuariodoToken(token: string) {
    if(!token)
      return null;
    const payloadData = token.split('.')[1];
    const data = atob(payloadData);
    const {name, userId} = JSON.parse(data);
    return {username: name, userId: userId, token: token};
  }

  obterApenasUsuarioComToken(token: string) {
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
      console.log(remainingTime);      
      // const minutes = Math.floor(remainingTime / 60000); // 60000 milissegundos = 1 minuto
      // const seconds = Math.floor((remainingTime % 60000) / 1000); // O resto do tempo em segundos
      // const formattedTime = this.formatTime(minutes, seconds);
      // console.log(formattedTime);
      return remainingTime;
    }
  }

  private formatTime(minutes: number, seconds: number): string {
    const minutesStr = minutes.toString().padStart(2, '0');
    const secondsStr = seconds.toString().padStart(2, '0');
    return `${minutesStr}:${secondsStr}`;
  }

}
