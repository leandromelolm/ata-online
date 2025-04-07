import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent {

  politicaDePrivacidade: string = '';

  constructor (
    private apiService: ApiService
  ) {}

  async ngOnInit() {
    this.getPoliticaDePrivacidade()
  }

  getPoliticaDePrivacidade() {
    this.apiService.getPrivacyPolicy().subscribe({
      next: (response) => {
        this.politicaDePrivacidade = response.content;
      },
      error: (err) =>{
        this.politicaDePrivacidade = err;
      }
    })
  }

  fecharPagina() {
    window.close();
  }

}
