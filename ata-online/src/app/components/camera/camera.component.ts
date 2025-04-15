import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrl: './camera.component.scss'
})
export class CameraComponent {

  errorMessage: string = '';  
  fotoCapturada: string;
  @Output() enviarParaForm: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild('videoElement') videoElement: ElementRef<HTMLVideoElement> | undefined;
  private stream: MediaStream | undefined;

  ngOnInit(): void {
    this.abrirCamera();
  }

  enviarValorParaFormComponent() {
    this.enviarParaForm.emit(this.fotoCapturada);
  }

  reloadPage(): void {
    let urlParams = window.location.search;
    if (urlParams)
      window.location.href = '/ata' + urlParams;
    else
      window.location.href = '/ata'
  }

  abrirCamera() {
    this.errorMessage = '';
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          const video = document.querySelector('video') as HTMLVideoElement;
          if (video) {
            video.srcObject = stream;
            video.style.transform = 'scaleX(-1)'; // efeito espelho na camera
          }
          stream.getTracks().forEach(track => {
            track.onended = () => {
              console.log('A câmera foi desconectada ou a permissão foi revogada.');
              alert('A câmera foi desconectada ou a permissão foi revogada.');
              this.errorMessage = 'A câmera foi desconectada ou a permissão foi revogada.';
              this.reloadPage();
            };
          });
        })
        .catch((error) => {
          console.error('Erro ao acessar a câmera: ', error);
          this.errorMessage = `Erro ao acessar a câmera: ${error}`;
        });
    } else {
      console.log('Acesso à câmera não disponível neste navegador.');
      alert('Acesso à câmera não disponível neste navegador.');
      this.errorMessage = 'Acesso à câmera não disponível neste navegador.';
    }
  }
  

  capturarFoto() {
    const video = document.querySelector('video') as HTMLVideoElement;
    const canvas = document.createElement('canvas');
    
    if (video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;      

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);        

        this.fotoCapturada = canvas.toDataURL('image/png');
      }
    }
    this.pararCamera(video);
  }

  pararCamera(video: HTMLVideoElement | null) {
    if (video && video.srcObject) {
      const stream = video.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => {
        track.stop();
      });
      video.srcObject = null;
      video.style.display = 'none';  
    }
  }
}
