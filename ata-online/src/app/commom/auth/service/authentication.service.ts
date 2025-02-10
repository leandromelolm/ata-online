import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Login } from '../models/login';
import { HttpBaseService } from '../../../shared/base/http-base.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService extends HttpBaseService {

  private subjectUsuario: BehaviorSubject<any> = new BehaviorSubject(null);
  private subjectLogin: BehaviorSubject<any> = new BehaviorSubject(false);


  constructor(protected override readonly injector: Injector) {
    super(injector)
  }

  login(login: Login): Observable<any> {
    return this.httpPost('', login).pipe(
      map((resposta) => {
        console.log(resposta);
        if(resposta.success){
          localStorage.setItem('accessToken', resposta.content.accesstoken);
          localStorage.setItem('refreshToken', resposta.content.refreshtoken);
          this.subjectUsuario.next(this.obterUsuariodoToken(resposta.content.accesstoken));
          this.subjectLogin.next(true);
        }
        return resposta;
      }),
    )

  }

  logout() {
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('deviceId');
    this.subjectUsuario.next(null);
    this.subjectLogin.next(false);
  }

  usuarioEstaLogado(): Observable<any> {
    const rToken = localStorage.getItem('refreshToken');
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
