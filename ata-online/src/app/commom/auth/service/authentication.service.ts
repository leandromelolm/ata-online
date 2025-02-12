import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Login } from '../models/login';
import { HttpBaseService } from '../../../shared/base/http-base.service';
import { JwtService } from '../jwt.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService extends HttpBaseService {

  private subjectUsuario: BehaviorSubject<any> = new BehaviorSubject(null);
  private subjectLogin: BehaviorSubject<any> = new BehaviorSubject(false);


  constructor(
    private jwtService: JwtService,
    protected override readonly injector: Injector
  ) {
    super(injector)
  }

  login(login: Login): Observable<any> {
    return this.httpPost('', login).pipe(
      map((resposta) => {
        console.log(resposta);
        if(resposta.success){
          localStorage.setItem('access_token', resposta.content.accesstoken);
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

  usuarioEstaLogado(): Observable<any> {
    const rToken = localStorage.getItem('refresh_token');
    if (rToken) {
      this.subjectLogin.next(true);
    }
    return this.subjectLogin.asObservable();
  }

  obterUsuario() {
    this.subjectUsuario.asObservable();
  }

  private obterUsuariodoToken(token: string) {
    const payloadData = token.split('.')[1];
    const data = atob(payloadData);
    const {name, userId} = JSON.parse(data);
    console.log(name, userId);
    return name;
  }

}
