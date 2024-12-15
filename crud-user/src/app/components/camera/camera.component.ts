import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrl: './camera.component.scss'
})
export class CameraComponent {

  fotoCapturada: string;
  @Output() enviarParaPai: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild('videoElement') videoElement: ElementRef<HTMLVideoElement> | undefined;
  private stream: MediaStream | undefined;

  ngOnInit(): void {
    this.abrirCamera();
  }

  enviarValorParaPai() {
    this.enviarParaPai.emit(this.fotoCapturada);
  }

  abrirCamera() {
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
        });
    } else {
      console.log('Acesso à câmera não disponível neste navegador.');
      alert('Acesso à câmera não disponível neste navegador.')
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
  }

  // startCamera(): void {
  //   if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  //     navigator.mediaDevices.getUserMedia({ video: true })
  //       .then((stream) => {
  //         this.stream = stream;
  //         // Atribui o stream de vídeo ao elemento <video>
  //         if (this.videoElement && this.videoElement.nativeElement) {
  //           this.videoElement.nativeElement.srcObject = stream;
  //         }
  //       })
  //       .catch((error) => {
  //         console.error('Erro ao acessar a câmera: ', error);
  //       });
  //   } else {
  //     console.error('A API getUserMedia não é suportada neste navegador.');
  //   }
  // }

  // Função para parar a câmera
  // stopCamera(): void {
  //   if (this.stream) {
  //     const tracks = this.stream.getTracks();
  //     tracks.forEach((track) => track.stop());  // Para todos os tracks do stream (vídeo, áudio)
  //     if (this.videoElement && this.videoElement.nativeElement) {
  //       this.videoElement.nativeElement.srcObject = null;  // Remove o stream do vídeo
  //     }
  //   }
  // }
}
