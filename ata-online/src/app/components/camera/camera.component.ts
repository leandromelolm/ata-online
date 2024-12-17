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

  abrirCamera() {
    this.errorMessage = '';
    // Verifica se a API está disponível no navegador
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // Solicita acesso à câmera
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          // Exibe o stream da câmera no elemento <video>
          const video = document.querySelector('video') as HTMLVideoElement;
          if (video) {  // Verifica se o video não é null
            video.srcObject = stream;
          }
        })
        .catch((error) => {
          console.error('Erro ao acessar a câmera: ', error);
          this.errorMessage = 'Erro ao acessar a câmera';
        });
    } else {
      console.log('Acesso à câmera não disponível neste navegador.');
      alert('Acesso à câmera não disponível neste navegador.');
      this.errorMessage = 'Erro ao acessar a câmera';
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
      
      // Parar todas as tracks (de vídeo e áudio) associadas ao stream
      const tracks = stream.getTracks();
      tracks.forEach(track => {
        track.stop(); // Para cada track (de vídeo ou áudio)
      });
  
      // Limpar a referência do srcObject
      video.srcObject = null;
  
      // Esconder o elemento video, se desejado
      video.style.display = 'none';  
    }
  }
}
