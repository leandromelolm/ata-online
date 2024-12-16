import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocalizacaoService {

  constructor() { }

  private localizacaoAtivaSubject = new BehaviorSubject<boolean>(false);
  
  // Observável para que outros componentes possam se inscrever e reagir a mudanças
  localizacaoAtiva$ = this.localizacaoAtivaSubject.asObservable();

  // Método para atualizar o estado da localização ativa
  atualizarLocalizacaoAtiva(valor: boolean) {
    this.localizacaoAtivaSubject.next(valor);
  }
}
