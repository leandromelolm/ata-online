import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {

  rotaParaRegistros: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    // this.getUrlParameterToRegistrosPage();
  }

  getSessionUrlParameter(rota: string): void {
    const urlParamMeeting = sessionStorage.getItem('url-param-meeting');
    const queryParams = urlParamMeeting ? { ata: urlParamMeeting } : {};

    this.rotaParaRegistros = rota;

    this.router.navigate([this.rotaParaRegistros], { queryParams });
  }
}