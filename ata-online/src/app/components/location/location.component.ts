import { Component, EventEmitter, Output } from '@angular/core';
import { LocalizacaoService } from '../../services/localizacao.service';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrl: './location.component.scss'
})
export class LocationComponent {

  btnClickLocation: string = "Localizar"
  endereco: {
    state: '', 
    city: '', 
    postcode: '',
    suburb: '',
    road: '',
    house_number: ''
  };

  @Output() enviarEnderecoParaFormComponent: EventEmitter<any> = new EventEmitter<any>();

  constructor(private localizacaoService: LocalizacaoService) {}
  
  ngOnInit(){
    this.getCurrentLocation();
    // this.getAddress('Av. Oliveira Lima, 1029 - Soledade, Recife - PE, 50030-230');
  }
  
  getCurrentLocation() {
    if (navigator.geolocation) {
      console.log('Geolocalização disponível.');      
      // Verificar se a geolocalização foi ativada ou se o navegador tem permissão
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.localizacaoService.atualizarLocalizacaoAtiva(true);
          this.getAddressWithLatLon(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          // Caso o usuário negue a permissão ou haja algum erro
          this.localizacaoService.atualizarLocalizacaoAtiva(false);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.log("Usuário negou a solicitação de geolocalização.");
              alert(`Você precisa ativar a geolocalização e permitir o acesso.
Veja se seu navegador permite acessar a sua localização.`);
              break;
            case error.POSITION_UNAVAILABLE:
              console.log("Informação de localização indisponível.");
              alert("Não foi possível obter sua localização.");
              break;
            case error.TIMEOUT:
              console.log("A solicitação de geolocalização expirou.");
              alert("A solicitação de geolocalização demorou muito.");
              break;
            default:
              console.log("Erro desconhecido ao tentar acessar a localização.");
              alert("Erro ao acessar sua localização.");
              break;
          }
        }
      );
    } else {
      this.localizacaoService.atualizarLocalizacaoAtiva(false);
      console.log("Geolocalização não é suportada neste navegador.");
      alert("A geolocalização não é suportada neste navegador.");

    }
  }

  async getAddressWithLatLon(lat: number, lon: number) {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse.php?lat=${lat}&lon=${lon}&zoom=18&format=jsonv2`)
    const e = await res.json();
    console.log(e);
    this.endereco = e.address;
    this.enviarValorParaForm();
  }

  enviarValorParaForm() {
    this.enviarEnderecoParaFormComponent.emit(this.endereco);
  }

  

  calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c; // Distância em km
  }

  async getAddress(str: String) {
    const res = await fetch(`https://nominatim.openstreetmap.org/search.php?q=${str}&format=jsonv2`)  
    const e = await res.json();
    console.log(e);
    // retorna com informações de coordenadas e detalhes do endereço
  }

  public clickLocation(): void {
    this.getCurrentLocation();
  }  

}
