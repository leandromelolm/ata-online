import { Component } from '@angular/core';

@Component({
  selector: 'app-qrcode',
  templateUrl: './qrcode.component.html',
  styleUrl: './qrcode.component.scss'
})
export class QrcodeComponent {

  strQRCode: string = '';

  ngOnInit() {
    
    // let urlParam = sessionStorage.getItem('url-param-meeting');
    let urlParamMeeting = new URLSearchParams(window.location.search);
    let urlParam = urlParamMeeting.get('ata');
    
    if (urlParam === 'test')
      this.strQRCode = urlParam;
    
    if (urlParam?.startsWith('2605'))
      this.strQRCode = '2605'
  }

}
