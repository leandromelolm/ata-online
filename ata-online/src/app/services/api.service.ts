import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'https://script.google.com/macros/s/AKfycbxJhOJh2hJVqiYLH59RXpROQBayFYTFSmx5qhkalHn3VqplFC8DuOUM0Elwy_HuOmzT/exec';

  constructor() { }

  private readonly httpClient = inject(HttpClient);

  getMeeting(idReuniao: string | null): Observable<{reuniao: any}> {
    return this.httpClient.get<any>(`${this.apiUrl}?reuniao=${idReuniao}`)
  }
}
