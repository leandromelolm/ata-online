import { Component, EventEmitter, Output } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { map, Subject, take, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ModalEventoComponent } from '../modal-evento/modal-evento.component';
import { ModalEventoCadastrarComponent } from '../modal-evento-cadastrar/modal-evento-cadastrar.component';
import { AuthenticationService } from '../../commom/auth/service/authentication.service';

@Component({
  selector: 'app-evento-lista',
  templateUrl: './evento-lista.component.html',
  styleUrl: './evento-lista.component.scss'
})
export class EventoListaComponent {

  eventos: any[] = [];
  btnCadastrarEvento: string = 'Cadastrar Evento';
  isLoading: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    public dialog: MatDialog,
    private authService: AuthenticationService
  ) {}

  ngOnInit() {
    const lista = sessionStorage.getItem('evento-lista');
    if (lista)
      this.eventos = JSON.parse(lista)
    else {
      this.authService.usuarioLogado$.pipe(
      takeUntil(this.destroy$)).subscribe(
        logged =>{
          if(logged) {
            this.getListaEvento();
          }
        }
      )
    }
  }

  ngOnDestroy() {
    this.destroy$.next(); // Emite um valor para encerrar assinaturas
    this.destroy$.complete(); // Completa o Subject para evitar vazamentos de memória
  }

  getListaEvento(): void {
    this.isLoading = true;
    this.apiService.getAllEventsWithGetMethod()
    .pipe( //map((r) => { console.log(r); return r;})
    )
    .subscribe({
      next: (data: any) => {
        if(data.success){
          console.log('eventos', data);
          this.eventos = data.content.itens.reverse();
          sessionStorage.setItem('evento-lista', JSON.stringify(this.eventos));
          this.isLoading = false;
        } else {
          this.authService.logout();
        }
      },
      error: (error) => {
        console.error('error', error);
      },
      complete: () => {
        this.isLoading = false;
      }
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