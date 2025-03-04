import { Component, EventEmitter, Output } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { map } from 'rxjs';


@Component({
  selector: 'app-evento-lista',
  templateUrl: './evento-lista.component.html',
  styleUrl: './evento-lista.component.scss'
})
export class EventoListaComponent {

  eventos: any[] = [];
  @Output() valueChanged = new EventEmitter<string>();

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    const lista = sessionStorage.getItem('evento-lista');
    if (lista)
      this.eventos = JSON.parse(lista)
    else
      this.getListaEvento();
  }

  getListaEvento(): void {
    this.apiService.getEventos()
    .pipe(
      // map((r) => {
      //   console.log(r);
      //   return r
      // })
      ).subscribe((data) => {
        this.eventos = data.content.itens;
        sessionStorage.setItem('evento-lista', JSON.stringify(this.eventos));
    });
  }

  alterarStatusEvento(eventoId: string): void {
    this.valueChanged.emit(eventoId);     
  }
}
