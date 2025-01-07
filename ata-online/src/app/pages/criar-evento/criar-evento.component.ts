import { Component } from '@angular/core';
import QRCode from 'qrcode';
import { trigger, style, animate, transition } from '@angular/animations';

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

  senha: string = ''
  errorInputSenha: boolean = false;

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
   if (fieldName === 'senha' && !this.senha){
      this.errorInputSenha = true;
   }
  }

  submitForm() {
    if(this.validarForm())
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

  validarForm(): boolean {
    let nError = 0;

    if (!this.titulo) {
      this.errorInputTitulo= true;
      nError = 1;
    }

    if(!this.data) {
      this.errorInputData = true;
      nError = 1;
    }

    if (!this.hora) {
      this.errorInputHora = true
      nError = 1;
    }

    if (!this.local) {
      this.errorInputLocal = true
      nError = 1;
    }

    if (!this.descricao) {
      this.errorInputDescricao = true
      nError = 1;
    }

    if (this.errorInputSenha) {
      nError = 1;
    }

    if(nError === 1)
      return true;
    else
      return false
  }

  validarSenhaProvisoria(senha: string): boolean {
    if (senha !== 'sindatsb12345' && senha.length > 5){  
      this.errorInputSenha = true;
      return true;
    } else {
      this.errorInputSenha = false;
      return false;
    }    
  }

  validarCampos() {
    if (this.titulo && this.hora && this.data && this.local && this.descricao)
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
    this.senha = '';
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

  sair() {
    window.location.href = '/'
  }

}

