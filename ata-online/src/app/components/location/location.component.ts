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
  }
  
  getCurrentLocation() {
    if (navigator.geolocation) {
      console.log('Geolocalização disponível.');      
      // Verificar se a geolocalização foi ativada ou se o navegador tem permissão
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.localizacaoService.atualizarLocalizacaoAtiva(true);
          this.getAddressWithCoordinates(position.coords.latitude, position.coords.longitude);
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

  async getAddressWithCoordinates(lati: number, long: number) {
    const url = `https://nominatim.openstreetmap.org/reverse.php?lat=${lati}&lon=${long}&zoom=18&format=jsonv2`;
    const res = await fetch(url)
    const e = await res.json();
    let {lat, lon, address} = e;
    this.endereco = address;
    this.enviarValorParaForm(lat, lon);
  }

  enviarValorParaForm(lat: number, long: number) {
    this.enviarEnderecoParaFormComponent.emit({ ...this.endereco, lat, long });
  }

}
