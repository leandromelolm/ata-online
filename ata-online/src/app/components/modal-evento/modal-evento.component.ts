import { HttpParams } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
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
  btnEditarStatus: string = 'Alterar Status';
  isLoading: boolean = false;
  mensagem: string = '';
  statusList = [
    { label: 'ABERTO', value: 'ABERTO' },
    { label: 'FECHADO', value: 'FECHADO' },
    { label: 'PAUSADO', value: 'PAUSADO' },
    { label: 'ENCERRADO', value: 'ENCERRADO' },
    { label: 'CANCELADO', value: 'CANCELADO' },
  ];

  constructor(
    public dialogRef: MatDialogRef<ModalEventoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService
  ) {
    this.userData = data;
    console.log(this.userData);
    this.selectedStatus = this.userData.status;
    this.status = this.userData.status;
  }

  editStatus() {
      const params = new HttpParams()
      .set('action', 'editarstatusevento')
      .set('eventoid', this.userData.id.trim().toLowerCase())
      .set('novostatus', this.selectedStatus)
      .set('atok', sessionStorage.getItem('access_token') || '');
      
      this.btnEditarStatus = 'Aguarde...';
      this.isLoading = true;
      this.mensagem = '';

      this.apiService.getAlteraStatusEvento(params).subscribe({
        next:(response) => {
          console.log(response);          
          this.mensagem = response.message;
          this.status = this.selectedStatus;
          // this.sucessoEditarStatus(response);
        },
        error: (error) => {
          console.log(error);
          this.mensagem = error;
          // this.erroEditarStatusEvento(error);
        },
        complete: () => {
          this.btnEditarStatus = 'Alterar Status';
          this.isLoading = false;
        }
      })
    }

  closeModal() { this.dialogRef.close(); }

  fecharModal(): void {
    console.log('fecharElemento');
    this.closeModal();
  }

}
