import { Component, EventEmitter, Output } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { map } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ModalEventoComponent } from '../modal-evento/modal-evento.component';
import { ModalEventoCadastrarComponent } from '../modal-evento-cadastrar/modal-evento-cadastrar.component';

@Component({
  selector: 'app-evento-lista',
  templateUrl: './evento-lista.component.html',
  styleUrl: './evento-lista.component.scss'
})
export class EventoListaComponent {

  eventos: any[] = [];
  btnCadastrarEvento: string = 'Cadastrar Evento';

  constructor(
    private apiService: ApiService,
    public dialog: MatDialog
  ) {}

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
        this.eventos = data.content.itens.reverse();
        sessionStorage.setItem('evento-lista', JSON.stringify(this.eventos));
    });
  }

  openModalEvento(evento: any): void {
    const dialogRef = this.dialog.open(ModalEventoComponent, {
      backdropClass: 'custom-backdrop',
      panelClass: 'custom-modal',
      data: evento
    })
    dialogRef.componentInstance.valueChanged.subscribe(() => {
      this.getListaEvento();
    });
  }

  openModalEventoCadastrar(): void{
    const dialogRef = this.dialog.open(ModalEventoCadastrarComponent, {
    })
    dialogRef.componentInstance.valueChanged.subscribe(() => {
      this.getListaEvento();
    });
  }
  
}