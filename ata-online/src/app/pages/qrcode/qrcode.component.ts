import { Component } from '@angular/core';
import QRCode from 'qrcode';

@Component({
  selector: 'app-qrcode',
  templateUrl: './qrcode.component.html',
  styleUrl: './qrcode.component.scss'
})
export class QrcodeComponent {

  strQRCode: string = '';
  qrText: string = '';
  qrCodeImage: string = '';
  btnQRCode = 'Gerar QR Code';
  btnDownloadQRCode = 'Download';
  urlOrigin = '';

  ngOnInit() {       
    this.getParam();
  }

  getParam() {
    // let urlParam = sessionStorage.getItem('url-param-meeting');
    let urlParamMeeting = new URLSearchParams(window.location.search);
    let urlParam = urlParamMeeting.get('ata');
    this.urlOrigin = window.location.origin;
    this.qrText = `${this.urlOrigin}/ata?ata=${urlParam}`
    console.log(urlParam);
    this.generateQRCode();
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
