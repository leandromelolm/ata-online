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
          this.subjectUsuario.next(this.obterUsuariodoToken(resposta.content.accesstoken));
          this.subjectLogin.next(true);
        }
        return resposta;
      }),
    )
  }

  logout() {
    this.jwtService.removeToken()
    localStorage.removeItem('deviceId');
    this.subjectUsuario.next(null);
    this.subjectLogin.next(false);
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

}
