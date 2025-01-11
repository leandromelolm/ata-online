import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Meeting } from '../models/meeting';

interface ApiResponse {
  success: boolean;
  message?: string;
  content?: {
    sheetId?: string;
  };
  error?: any;
};

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'https://script.google.com/macros/s/AKfycbxJhOJh2hJVqiYLH59RXpROQBayFYTFSmx5qhkalHn3VqplFC8DuOUM0Elwy_HuOmzT/exec';

  constructor() { }

  private readonly httpClient = inject(HttpClient);

  getMeeting(idReuniao: string | null): Observable<{content: Meeting}> {
    return this.httpClient.get<any>(`${this.apiUrl}?ata=${idReuniao}`).pipe(
      catchError(this.handleError)
    );
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

   async postFetchEvento(obj: any): Promise<ApiResponse> {
    const response = await fetch(`${this.apiUrl}`, {
      redirect: "follow",
      method: 'POST',
      body: JSON.stringify(obj),
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
    });
    let res: ApiResponse = await response.json();
    return res;
  }
  
}
