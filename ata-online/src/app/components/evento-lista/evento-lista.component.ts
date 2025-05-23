import { Component, EventEmitter, Output } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { map, Subject, take, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ModalEventoComponent } from '../modal-evento/modal-evento.component';
import { ModalEventoCadastrarComponent } from '../modal-evento-cadastrar/modal-evento-cadastrar.component';
import { AuthenticationService } from '../../commom/auth/service/authentication.service';
import { ToastMessageService } from '../../services/toast-message.service';

@Component({
  selector: 'app-evento-lista',
  templateUrl: './evento-lista.component.html',
  styleUrl: './evento-lista.component.scss'
})
export class EventoListaComponent {

  eventos: any[] = [];
  btnCadastrarEvento: string = 'Cadastrar Evento';
  isLoading: boolean = false;
  eventoParaExcluir: string | null = null;
  loadingEventoId: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    public dialog: MatDialog,
    private authService: AuthenticationService,
    private toastMessageService: ToastMessageService
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
        if (!data.success)
          this.authService.logout();
        if (data.success){
          if (data.content.itens) {
            this.eventos = data.content.itens.reverse();
            sessionStorage.setItem('evento-lista', JSON.stringify(this.eventos));
            this.isLoading = false;
          }
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

  openModalEventoCadastrar(): void {
    const dialogRef = this.dialog.open(ModalEventoCadastrarComponent, {
    })
    dialogRef.componentInstance.valueChanged.subscribe(() => {
      this.getListaEvento();
    });
  }

  confirmarOuExcluir(eventoId: string) {
    if (this.eventoParaExcluir === eventoId) {
      this.deleteEvento(eventoId);
      this.eventoParaExcluir = null;
    } else {
      this.eventoParaExcluir = eventoId;
      setTimeout(() => {
        if (this.eventoParaExcluir === eventoId) {
          this.eventoParaExcluir = null;
        }
      }, 10000);
    }
  }

  deleteEvento(id: string): void {
    this.loadingEventoId = id;
    const listaEvento = [];
    listaEvento.push(id);
    this.apiService.deleteEventsWithGetMethod(listaEvento)
      .subscribe({
        next: (data: any) => {
          if (data.success) {
            if (data.content.numberOfDeletedEvents > 0) {
              console.log('eventos', data);
              this.toastMessageService.add(data.message);
              this.eventos = this.eventos.filter(evento => evento.id !== id);
            } else {
              console.log(data.message);
              this.toastMessageService.add(data.message)
            }
          } else {
            this.authService.logout();
          }
        },
        error: (error) => {
          console.error('error', error);
        },
        complete: () => {
          this.loadingEventoId = null;
        }
      });
  }

}