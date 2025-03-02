import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, take, throwError } from 'rxjs';
import { Meeting } from '../models/meeting';
import { Response } from '../models/response';
import { environment } from '../../environments/environment';
import { HttpBaseService } from '../shared/base/http-base.service';
import { AuthenticationService } from '../commom/auth/service/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService extends HttpBaseService{

  private scriptIdApi = environment.scriptId;
  private apiUrl = `https://script.google.com/macros/s/${this.scriptIdApi}/exec`;

  private readonly httpClientApi = inject(HttpClient);
  private readonly authenticationService = inject(AuthenticationService);

  getEventos(): Observable<any> {
    const accessToken = sessionStorage.getItem('access_token') || "";
    const username = this.authenticationService.obterApenasUsuarioComToken(accessToken)?.username;
    console.log(username)
    return this.httpGet(`?action=userEventList&user=${username}&atok=${accessToken}`);
  }

  saveEvento(newEvento: any): Observable<any> {
    return this.httpPost('', newEvento).pipe(
      take(1),
      map((res) => {
        // console.log(res);
        return res
      })
    )
  }

  getMeeting(idReuniao: string | null): Observable<{content: Meeting}> {
    return this.httpClientApi.get<any>(`${this.apiUrl}?ata=${idReuniao}`)
    .pipe(
      catchError(this.handleError)
    );
  }

  addParticipanteAoEvento(participante: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'text/plain'
    });
    return this.httpClientApi.post(this.apiUrl, JSON.stringify(participante), { headers });
  }

  getAllParticipantes(eventoId: string): Observable<Response<string[]>> {
    return this.httpClientApi.get<Response<string[]>>(`${this.apiUrl}?eventoid=${eventoId}&action=todosParticipantes`)
    .pipe(
      catchError(this.handleError)
    );    
  }

  getAlteraStatusEvento(params: HttpParams): Observable<any>{
    return this.httpClientApi.get<any>(`${this.apiUrl}`, { params });
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ocorreu um erro desconhecido';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = `Código do erro: ${error.status}, Mensagem: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  async fetchGetAllParticipantes(eventoId: string) {
    const res = await fetch(`${this.apiUrl}?eventoid=${eventoId}&action=todosParticipantes`,{
      redirect: "follow",
      method: 'GET',
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return await res.json();
  }

  async fetchPostAddParticipante(obj: any): Promise<Response<any>> {
    const response = await fetch(`${this.apiUrl}`, {
      redirect: "follow",
      method: 'POST',
      body: JSON.stringify(obj),
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
    });
    let res: Response<any> = await response.json();
    return res;
  }
  
}
