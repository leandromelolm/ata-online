import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpBaseService {

  private readonly httpClient!: HttpClient;

  private scriptId = environment.scriptId;
  // private apiBase = 'http://localhost:3000/'; // caminho para a api
  private apiBase = `https://script.google.com/macros/s/${this.scriptId}/exec`;

  constructor(protected readonly injector: Injector) { 
    if(injector == null || injector == undefined){
      throw new Error('Injector não pode ser nulo');
    }

    this.httpClient = injector.get(HttpClient);
  }

  protected httpGet(endpoint: string): Observable<any> {
    return this.httpClient.get(`${this.apiBase}${endpoint}`);
  }

  protected httpPost(endpoint: string, dados: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'text/plain'
    });
    return this.httpClient.post(`${this.apiBase}${endpoint}`, JSON.stringify(dados), { headers });
  }

  // protected httpPut(endpoint: string, dados:any): Observable<any> {
  //   return this.httpClient.put(`${this.apiBase}${endpoint}`, dados);
  // }

  // protected httpDelete(endpoint: string): Observable<any> {
  //   return this.httpClient.delete(`${this.apiBase}${endpoint}`);
  // }

}