import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-modal-evento',
  templateUrl: './modal-evento.component.html',
  styleUrl: './modal-evento.component.scss'
})
export class ModalEventoComponent {

  userData: any;
  selectedStatus: string = '';
  status: string = '';
  btnSalvarAlteracao: string = 'Salvar';
  btnColorSalvar: string = 'btn__grey'
  isLoading: boolean = false;
  mensagem: string = '';
  badgeColor: string = 'success';
  statusList = [
    { label: 'ABERTO', value: 'ABERTO' },
    { label: 'FECHADO', value: 'FECHADO' },
    { label: 'PAUSADO', value: 'PAUSADO' },
    { label: 'ENCERRADO', value: 'ENCERRADO' },
    { label: 'CANCELADO', value: 'CANCELADO' },
  ];

  @Output() valueChanged = new EventEmitter<string>();

  constructor(
    public dialogRef: MatDialogRef<ModalEventoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService
  ) {
    this.userData = data;
    console.log(this.userData);
    this.selectedStatus = this.userData.status;
    this.status = this.userData.status;
    this.changedBadgedColor(this.userData.status);
  }

  editStatus() {
      const params = new HttpParams()
      .set('action', 'editarstatusevento')
      .set('eventoid', this.userData.id.trim().toLowerCase())
      .set('novostatus', this.selectedStatus)
      .set('atok', sessionStorage.getItem('access_token') || '');
      
      this.btnSalvarAlteracao = 'Aguarde';
      this.isLoading = true;
      this.mensagem = '';

      this.apiService.getAlteraStatusEvento(params).subscribe({
        next:(response) => {
          console.log(response);
          if(response.success) {
            this.mensagem = response.message;
            this.status = this.selectedStatus;
            this.changedBadgedColor(this.status);
            this.valueChanged.emit();
          }
        },
        error: (error) => {
          console.log(error);
          this.mensagem = error;
        },
        complete: () => {
          this.btnSalvarAlteracao = 'Salvar';
          this.isLoading = false;
        }
      })
    }

  closeModal(): void { 
    this.dialogRef.close(); 
  }

  fecharModal(): void {
    this.closeModal();
  }

  changedBadgedColor(status: String): void {
    switch (status) {
      case 'ABERTO': this.badgeColor = 'success'; break;
      case 'FECHADO': this.badgeColor = 'danger'; break;
      case 'PAUSADO': this.badgeColor = 'warning'; break;
      case 'ENCERRADO': this.badgeColor = 'secondary'; break;
      case 'CANCELADO': this.badgeColor = 'secondary'; break;
    }
  }

  onStatusChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.btnColorSalvar = this.status === selectedValue ? 'btn__grey' : 'btn__primary'; 
    this.mensagem = '';
  } 

}
