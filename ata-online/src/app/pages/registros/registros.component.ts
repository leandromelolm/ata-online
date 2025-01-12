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

  constructor(private apiService: ApiService){}

  ngOnInit(): void {
    this.buscarParticipantes();    
  }

  async buscarParticipantes(){
    let urlParams = new URLSearchParams(window.location.search)
    let urlEvento = urlParams.get('ata') || '';
    const participantes = await this.apiService.getAllParticipantes(urlEvento);
    for( let i=0; i<participantes.content.length; i++) {
      const obj = JSON.parse(participantes.content[i]);
      obj.position = i+1;
      this.ELEMENT_DATA.push(obj)
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);      
    }
  }

  getUrl() {
    let urlParams = new URLSearchParams(window.location.search)
    let urlMeeting = urlParams.get('ata') || null;
    if (urlMeeting)
      sessionStorage.setItem('url-param-meeting', urlMeeting);
  }

}
