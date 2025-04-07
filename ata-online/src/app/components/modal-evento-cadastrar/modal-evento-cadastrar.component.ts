import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { take } from 'rxjs';
import QRCode from 'qrcode';

@Component({
  selector: 'app-modal-evento-cadastrar',
  templateUrl: './modal-evento-cadastrar.component.html',
  styleUrl: './modal-evento-cadastrar.component.scss',
  animations: [
  
      trigger('fadeInOut', [
        transition(':enter', [
          style({ opacity: 0 }),
          animate('500ms ease-in', style({ opacity: 1 }))
        ]),
        transition(':leave', [
          animate('500ms ease-out', style({ opacity: 0 }))
        ])
      ]),
  
      trigger('fadeInUp', [
        transition(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
        ]),
        transition(':leave', [
          animate('500ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' }))
        ])
      ])
  
    ]
  })
export class ModalEventoCadastrarComponent {

  data: Date;
  hora: String;
  local: String;
  titulo: String;
  descricao: String;
  btnSubmitForm = 'Cadastrar Evento';
  message: string = '';
  idEvento: string = '';
  qrText: string = '';
  qrCodeImage: string = '';
  btnQRCode = 'Gerar QR Code';
  btnDownloadQRCode = 'Baixar QRCode';
  isFormEvento: boolean = true;
  isSending: boolean = false;
  errorInputTitulo: boolean = false;
  errorInputData: boolean = false;
  errorInputHora: boolean = false;
  errorInputLocal: boolean = false;
  errorInputDescricao: boolean = false;  
  codigo: string = ''
  erroInputCodigo: boolean = false;
  
  btnEditarStatus: string = 'Editar Status';
  eventoid: string;
  isUrlEdit: boolean = false;
  responseMsgEditStatus: string = '';
  selectedStatus: string = '';
  statusList = [
    { label: 'ABERTO', value: 'ABERTO' },
    { label: 'FECHADO', value: 'FECHADO' },
    { label: 'PAUSADO', value: 'PAUSADO' },
    { label: 'ENCERRADO', value: 'ENCERRADO' },
    { label: 'CANCELADO', value: 'CANCELADO' },
  ];
  statusEvento: string = 'ABERTO';
  coordenadas: string;
  bCoordsAutorizarRegistro: boolean = false;
  bObterLocalDoParticipante: boolean = false;
  latitude: string = '0';
  longitude: string = '0';

  @Output() valueChanged = new EventEmitter<string>();

  constructor(
    public dialogRef: MatDialogRef<ModalEventoCadastrarComponent>,
    private router: Router,
    private apiService: ApiService
  ) {}

  closeModal(): void { this.dialogRef.close(); }

  onBlurField(fieldName: string): void {
   if (fieldName === 'titulo' && !this.titulo){
      this.errorInputTitulo = true;
   }
   if (fieldName === 'data' && !this.data){
      this.errorInputData = true;
   }
   if (fieldName === 'hora' && !this.hora){
      this.errorInputHora = true;
   }
   if (fieldName === 'local' && !this.local){
      this.errorInputLocal = true;
   }
   if (fieldName === 'descricao' && !this.descricao){
      this.errorInputDescricao = true;
   }
   if (fieldName === 'codigo' && !this.codigo){
      this.erroInputCodigo = true;
   }
  }

  submitForm() {
    if(this.checkError())
      return;

    if(this.bCoordsAutorizarRegistro && this.coordenadas) {
      if (!this.validarCoordenadas(this.coordenadas.replace(/\s+/g, ""))) {
        alert('Coordenadas inválidas. Por favor, insira no formato correto.');
        return;
      }
      let coords = this.coordenadas.split(',');
      this.latitude = coords[0].trim();
      this.longitude = coords[1].trim();
    } else {
      this.latitude = '0';
      this.longitude = '0';
    }

    let data = {
      data: this.data,
      hora: this.hora,
      local: this.local.trim(),
      titulo: this.titulo.toUpperCase().trim(),
      descricao: this.descricao.trim(),
      bRestritoParaInLoco: this.bCoordsAutorizarRegistro,
      bObterLocalDoParticipante: this.bObterLocalDoParticipante,
      status: this.statusEvento,
      coords: {lat: this.latitude, long: this.longitude},
      action: 'createEvento',
      dono: sessionStorage.getItem('username'),
      atok: sessionStorage.getItem('access_token')
    };
    
    this.btnSubmitForm = 'Aguarde';
    this.isSending = true;
    this.salvarEvento(data);
    // this.send(data);
    // console.log(data);    
  }

  salvarEvento(data: any): void {
    this.apiService.saveEvento(data).pipe(
      take(1)
    ).subscribe({
      next: (res) => {
        console.log('next',res);
        if (res.success) {
          this.message = res.message;
          this.idEvento = res.content.id
          this.qrText = `https://sindatsb.web.app/home?ata=${res.content.id}`;
          this.limparCampos();
          this.isFormEvento = false;
          this.valueChanged.emit();
        } else {
          this.message = `Falha ao salvar. mensagem de erro: ${res.error}`;
        }
      },
      error: (error) => {
        console.log(error);
        this.message = `Erro: ${error}`;
      },
      complete: ()=> {
        console.log("resquisição completa");
        this.isSending = false;
        this.btnSubmitForm = 'Cadastrar Evento';
      }
    })
  }
 
  checkError(): boolean {
    let isError = false;

    if (!this.titulo) {
      this.errorInputTitulo= true;
      isError = true;
    }

    if(!this.data) {
      this.errorInputData = true;
      isError = true;
    }

    if (!this.hora) {
      this.errorInputHora = true
      isError = true;
    }

    if (!this.local) {
      this.errorInputLocal = true
      isError = true;
    }

    if (!this.descricao) {
      this.errorInputDescricao = true
      isError = true;
    }

    if(isError)
      return true;
    else
      return false
  }

  validarCampos() {
    if (this.titulo && this.hora && this.data && this.local && this.descricao)
      return 'btn__primary';
    else
      return 'btn__grey';
  }

  limparCampos() {
    this.titulo = '';
    this.data = new Date();
    this.hora = '';
    this.local = '';
    this.descricao = '';
    this.codigo = '';
  }

  generateQRCode() {
    if (this.qrText) {
      QRCode.toDataURL(this.qrText)
        .then(url => {
          this.qrCodeImage = url;
        })
        .catch(err => {
          console.error(err);
        });
    } else {
      alert('Por favor, insira um texto ou URL.');
    }
  }

  downloadQRCode() {
    if (this.qrCodeImage) {
      const link = document.createElement('a');
      link.href = this.qrCodeImage;
      link.download = 'qrcode_ata.png';
      link.click();
    } else {
      alert('Nenhum QR Code gerado para download.');
    }
  }

  validarCoordenadas(coordenadas: string): boolean {
    const regex = /^-?\d{1,2}(\.\d{1,15})?,-?\d{1,3}(\.\d{1,15})?$/;
    return regex.test(coordenadas);
  }

  sair() {
    window.location.href = '/'
  }

  onValueChanged(value: string) {
    this.eventoid = value; // Atualiza o valor recebido
  }


  async send(data : any) {
    try {
      const response = await fetch(`https://script.google.com/macros/s/{SCRIPT_ID}/exec`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      const res = await response.json();
      console.log(res);
      if (res.success){
        this.message = res.message;
        this.idEvento = res.content.id
        this.qrText = `https://sindatsb.web.app/home?ata=${res.content.id}`;
        this.limparCampos();
        this.isFormEvento = false;
      } else {
        this.message = `Falha ao salvar. mensagem de erro: ${res.error}`;
      }
    } catch (error) {
      this.message = `Erro: ${error}`;
    }
    this.isSending = false;
    this.btnSubmitForm = 'Cadastrar Evento';
  }
}
