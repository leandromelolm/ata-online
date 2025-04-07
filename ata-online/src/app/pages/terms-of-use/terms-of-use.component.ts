import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-terms-of-use',
  templateUrl: './terms-of-use.component.html',
  styleUrl: './terms-of-use.component.scss'
})
export class TermsOfUseComponent {

  termosDeUso: string = '';
  
  constructor (
    private apiService: ApiService
  ) {}

  async ngOnInit() {
    this.getTermosDeUso()
  }

  getTermosDeUso() {
    this.apiService.getTermsOfUse().subscribe({
      next: (response) => {
        this.termosDeUso = response.content;
      },
      error: (err) =>{
        this.termosDeUso = err;
      }
    })
  }

  fecharPagina() {
    window.close();
  }
}
