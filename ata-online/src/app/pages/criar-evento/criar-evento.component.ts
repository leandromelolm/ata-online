import { Component } from '@angular/core';
import QRCode from 'qrcode';
import { trigger, style, animate, transition } from '@angular/animations';
import { CryptoService } from '../../services/crypto.service';
import { HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-criar-evento',
  templateUrl: './criar-evento.component.html',
  styleUrl: './criar-evento.component.scss',
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
export class CriarEventoComponent {

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
  user: string;
  password: string;
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

  constructor( 
    private cryptoService: CryptoService,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    if(this.router.url.split('?')[0] === '/criar-evento/edit')
      this.isUrlEdit = true;

    this.generateDeviceId();
    
  }

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

    let obj = {
      data: this.data,
      hora: this.hora,
      local: this.local.trim(),
      titulo: this.titulo.toUpperCase().trim(),
      descricao: this.descricao.trim(),
      action: 'addEvento'
    }
    
    this.btnSubmitForm = 'Aguarde';
    this.isSending = true;

    this.send(obj);
  }

  async send(obj : any) {
    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbxJhOJh2hJVqiYLH59RXpROQBayFYTFSmx5qhkalHn3VqplFC8DuOUM0Elwy_HuOmzT/exec', {
        method: 'POST',
        body: JSON.stringify(obj)
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
        this.message = 'Erro no envio';
      }
    } catch (error) {
      this.message = `Erro: ${error}`;
    }
    this.isSending = false;
    this.btnSubmitForm = 'Cadastrar Evento';
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

    if (this.validarCodigoProvisorio(this.codigo)) {
      isError = true;
    }

    if(isError)
      return true;
    else
      return false
  }

  validarCodigoProvisorio(codigo: string): boolean {
    if (codigo === '241208') {  
      this.erroInputCodigo = false;
      return false;
    } else {
      this.erroInputCodigo = true;
      return true;
    }    
  }

  validarCampos() {
    if (this.titulo && this.hora && this.data && this.local && this.descricao && this.codigo.length === 6 && !this.erroInputCodigo)
      return 'btn__primary';
    else
      return 'btn__2';
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

  editStatus() {
    this.responseMsgEditStatus = '';
    let pw = this.cryptoService.encrypt(this.password);
    const params = new HttpParams()
    .set('action', 'editarstatusevento')
    .set('eventoid', this.eventoid.trim().toLowerCase())
    .set('novostatus', this.selectedStatus)
    .set('user', this.user.trim().toLowerCase())
    .set('pw', pw.trim())
    // .set('teste', 'teste');  
    this.apiService.getAlteraStatusEvento(params).subscribe({
      next:(response) => {
        this.sucessoEditarStatus(response);
      },
      error: (error) => {
        this.erroEditarStatusEvento(error);
      }
    }
    )
  }

  sucessoEditarStatus(response: any) {
    console.log(response);
    this.responseMsgEditStatus = response.message;
  }

  erroEditarStatusEvento(error: any) {
    console.log(error);
    this.responseMsgEditStatus = error.message;
  }

  generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };
  
  generateDeviceId = () => {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = `${this.generateUUID()}-${window.screen.width}-${window.screen.height}`;
      localStorage.setItem('deviceId', deviceId);
    }
  }

  sair() {
    window.location.href = '/'
  }

}