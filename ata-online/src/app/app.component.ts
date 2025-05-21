import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  constructor(private router: Router, private titleService: Title) {}

  ngOnInit(): void {
    this.titleService.setTitle(environment.title);
  }
  
  exibirMenu(): boolean {
    const rotasSemMenu = ['/politica-de-privacidade', '/termos-de-uso'];
    return !rotasSemMenu.includes(this.router.url);
  }
}
