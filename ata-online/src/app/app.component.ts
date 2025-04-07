import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ata-online';
  textRegisterUser = 'Cadastrar Usuário';

  constructor(private router: Router) {}

  exibirMenu(): boolean {
    const rotasSemMenu = ['/politica-de-privacidade', '/termos-de-uso'];
    return !rotasSemMenu.includes(this.router.url);
  }
}
