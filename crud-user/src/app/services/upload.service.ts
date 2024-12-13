import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  private apiUrl = 'https://script.google.com/a/macros/a.recife.ifpe.edu.br/s/AKfycbxXnDhv5TFKZmEYXmAGXfSp6ePKrqiHROTvAI-Bp-CgbSZsR_jd6p6HtBrmaHddZD9E/exec';

  constructor(private http: HttpClient) { }

  // Método para enviar a imagem
  uploadImage(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }
}
