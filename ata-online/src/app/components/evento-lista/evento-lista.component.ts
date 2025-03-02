import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-evento-lista',
  templateUrl: './evento-lista.component.html',
  styleUrl: './evento-lista.component.scss'
})
export class EventoListaComponent {

  eventos: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getEventos().pipe(
      map((r) => {
        console.log(r);
        return r
      })
      ).subscribe((data) => {
        this.eventos = data.content.itens;
      });
  }
}
