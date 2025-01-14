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
  isEvento: boolean = true;

  constructor(private apiService: ApiService){}

  ngOnInit(): void {
    // this.buscarParticipantesComFetch();
    this.buscarParticipantes();
        
  }

  buscarParticipantes() {
    let urlParams = new URLSearchParams(window.location.search);
    let urlEvento = urlParams.get('ata') || '';
    if (!urlEvento){
      this.isUrlAta = false;
      return;
    }
    this.apiService.getAllParticipantes(urlEvento)
    .subscribe({
      next: (response) => {
        console.log(response['message']);
        this.isEvento = response.success;
        if (response.success){
          const data = response.content;
          data!.map((item, index) => {
            const obj = JSON.parse(item);
            obj.position = index + 1;
            this.ELEMENT_DATA.push(obj)
          });
          this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
          this.isUrlAta = true;
          this.isEvento = response.success;
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
