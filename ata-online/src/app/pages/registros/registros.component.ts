import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { MatTableDataSource } from '@angular/material/table';
import { ParticipanteDTO } from '../../models/participanteDTO';

@Component({
  selector: 'app-registros',
  templateUrl: './registros.component.html',
  styleUrl: './registros.component.scss'
})
export class RegistrosComponent {

  displayedColumns: string[] = ['position', 'id', 'startLetter', 'hiddenMat'];
  dataSource !: MatTableDataSource<any>;
  ELEMENT_DATA: ParticipanteDTO[] = [];
  isUrlAta: boolean = false;

  constructor(private apiService: ApiService){}

  ngOnInit(): void {
    // this.buscarParticipantesComFetch();
    this.buscarParticipantes();
        
  }

  buscarParticipantes() {
    let urlParams = new URLSearchParams(window.location.search);
    let urlEvento = urlParams.get('ata') || '';
    this.apiService.getAllParticipantes(urlEvento)
    .subscribe({
      next: (response) => {        
        // console.log(response['message']);        
        if (response.success){
          this.isUrlAta = true;
          for( let i=0; i<response.content?.length; i++) {
            const obj = JSON.parse(response.content[i]);
            obj.position = i+1;
            this.ELEMENT_DATA.push(obj)
            this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);      
          }
        }
      },
      error: (err) => {
        console.error('Erro ao buscar dados da reunião:', err);
        alert(`Ocorreu um erro ao tentar carregar os dados da reunião. 
          Por favor, verifique sua conexão ou tente novamente mais tarde.`);
      }
    });
  }

  async buscarParticipantesComFetch(){
    let urlParams = new URLSearchParams(window.location.search)
    let urlEvento = urlParams.get('ata') || '';
    let participantes;
    if(urlEvento){
      participantes = await this.apiService.fetchGetAllParticipantes(urlEvento);
      if(participantes.success){
        this.isUrlAta = true;
        for( let i=0; i<participantes.content.length; i++) {
          const obj = JSON.parse(participantes.content[i]);
          obj.position = i+1;
          this.ELEMENT_DATA.push(obj)
          this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);      
        }
      }
    }
  }

  getUrl() {
    let urlParams = new URLSearchParams(window.location.search)
    let urlMeeting = urlParams.get('ata') || null;
    if (urlMeeting)
      sessionStorage.setItem('url-param-meeting', urlMeeting);
  }

}
