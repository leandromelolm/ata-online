import { Component, EventEmitter, Output } from '@angular/core';
import { LocalizacaoService } from '../../services/localizacao.service';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrl: './location.component.scss'
})
export class LocationComponent {

  lat: number = 0;
  long: number = 0;
  btnClickLocation: string = "Localizar"
  endereco: {
    state: '', 
    city: '', 
    postcode: '',
    suburb: '',
    road: ''
  };

  @Output() valorEnviado = new EventEmitter<boolean>();

  constructor(private localizacaoService: LocalizacaoService) {}
  
  ngOnInit(){
    this.getCurrentLocation();
    // this.getAddres('Av. Oliveira Lima, 1029 - Soledade, Recife - PE, 50030-230'); 
  }

  public clickLocation(): void {
    this.getCurrentLocation();
  }
  
  getCurrentLocation() {
    if (navigator.geolocation) {
      console.log('Geolocalização disponível.');      
      
      // Verificar se a geolocalização foi ativada ou se o navegador tem permissão
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.localizacaoService.atualizarLocalizacaoAtiva(true);
          const lat1 = position.coords.latitude;
          const lon1 = position.coords.longitude;
  
          // Coordenadas do segundo ponto
          const lat2 = -8.079862866502374;
          const lon2 = -34.908358728835786;
  
          this.lat = lat1;
          this.long = lon1;
          this.getAddressWithLatLon(lat1, lon1);
  
          const distancia = this.calcularDistancia(lat1, lon1, lat2, lon2);
          console.log(`Distância: ${distancia} km`);
        },
        (error) => {
          // Caso o usuário negue a permissão ou haja algum erro
          this.localizacaoService.atualizarLocalizacaoAtiva(false);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.log("Usuário negou a solicitação de geolocalização.");
              alert("Você precisa permitir o acesso à sua localização para continuar.");
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

  async getAddressWithLatLon(lat: number, lon: number) {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse.php?lat=${lat}&lon=${lon}&zoom=18&format=jsonv2`)
    const e = await res.json();
    console.log(e);
    this.endereco = e.address;    
  }

  async getAddres(str: String) {
    const res = await fetch(`https://nominatim.openstreetmap.org/search.php?q=${str}&format=jsonv2`)  
    const e = await res.json();
    console.log(e);      
  }

}
