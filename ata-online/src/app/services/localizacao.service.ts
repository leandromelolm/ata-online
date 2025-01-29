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

  calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c; // Distância em km
  }

  async getAddress(str: String) {
    // this.getAddress('Av. Oliveira Lima, 1029 - Soledade, Recife - PE, 50030-230');
    const res = await fetch(`https://nominatim.openstreetmap.org/search.php?q=${str}&format=jsonv2`)  
    const e = await res.json();
    console.log(e);
    // retorna com informações de coordenadas e detalhes do endereço
    return e;
  }
}
