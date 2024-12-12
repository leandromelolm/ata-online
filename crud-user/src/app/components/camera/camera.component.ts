import { Component } from '@angular/core';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrl: './camera.component.scss'
})
export class CameraComponent {

  fotoCapturada: string | null = null;

  ngOnInit(): void {
    // this.abrirCamera();
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
    }
  }

  capturarFoto() {
    // Seleciona o elemento <video> e o <canvas> para capturar a foto
    const video = document.querySelector('video') as HTMLVideoElement;
    const canvas = document.createElement('canvas');
    
    if (video) {
      // Ajusta o tamanho do canvas para o tamanho do vídeo
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Desenha o vídeo no canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Converte a imagem do canvas para uma URL de imagem
        this.fotoCapturada = canvas.toDataURL('image/png');
      }
    }
  }
}
