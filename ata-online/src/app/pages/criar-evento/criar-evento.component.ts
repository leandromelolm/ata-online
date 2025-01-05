import { Component } from '@angular/core';
import QRCode from 'qrcode';

@Component({
  selector: 'app-criar-evento',
  templateUrl: './criar-evento.component.html',
  styleUrl: './criar-evento.component.scss'
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

  async submitForm(){
    let obj = {
      data: this.data,
      hora: this.hora.substring(0,2)+":"+this.hora.substring(2,4),
      local: this.local,
      titulo: this.titulo,
      descricao: this.descricao,
      action: 'addEvento'
    }
    console.log(obj);
    this.btnSubmitForm = 'Aguarde';

    const response = await fetch('https://script.google.com/macros/s/AKfycbxJhOJh2hJVqiYLH59RXpROQBayFYTFSmx5qhkalHn3VqplFC8DuOUM0Elwy_HuOmzT/exec', {
      method: 'POST',
      body: JSON.stringify(obj)
    });

    const res = await response.json();
    console.log(res);
    this.message = res.message;
    this.idEvento = res.content.id
    this.qrText = `https://sindatsb.web.app/home?ata=${res.content.id}`
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

}

