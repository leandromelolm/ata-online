import { Component } from '@angular/core';
import { UploadService } from '../../services/upload.service';
import { Observable } from 'rxjs';
import { IndexedDbService } from '../../services/indexed-db.service';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent {

  selectedFile: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private uploadService: UploadService, 
    private indexedDbService: IndexedDbService
  ) {}
  
  imageUrl: string | undefined;

  onFileChange(event: any): void {
    const file: File = event.target.files[0];  // Pegando o primeiro arquivo selecionado

    if (file) {
      this.convertFileToBlob(file);

      // Criando a URL da imagem para a pré-visualização
      const reader = new FileReader();
      reader.onloadend = () => {
        this.imageUrl = reader.result as string;  // A URL para a pré-visualização
      };
      reader.readAsDataURL(file);  // Leitura da imagem como URL
    }
  }

  convertFileToBlob(file: File): void {
    const reader = new FileReader();
    
    reader.onloadend = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const blob = new Blob([arrayBuffer], { type: file.type });
      console.log('Imagem convertida para Blob:', blob);

      // this.uploadImage(blob);
      this.saveImageToIndexedDB(blob);
      this.selectedFile = true;
    };

    reader.readAsArrayBuffer(file);
  }

  // uploadImage(blob: Blob): void {
  //   const formData = new FormData();
  //   formData.append('file', blob, 'image.jpg');
  //   console.log('Pronto para enviar o FormData:', formData);
  //   this.selectedFile = true;
  //   this.onUpload(formData)
  // }

  uploadImage(blob: Blob): void {
    const formData = new FormData();
    formData.append('file', blob, 'image.jpg');  // O nome do campo 'file' deve ser o mesmo que no Google Apps Script
  
    fetch('https://script.google.com/a/macros/a.recife.ifpe.edu.br/s/AKfycbxXnDhv5TFKZmEYXmAGXfSp6ePKrqiHROTvAI-Bp-CgbSZsR_jd6p6HtBrmaHddZD9E/exec', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      console.log("Imagem enviada com sucesso:", data);
      // Aqui você pode processar a resposta, como mostrar a URL do arquivo salvo
    })
    .catch(error => {
      console.error("Erro ao enviar a imagem:", error);
    });
  }


  onUpload(): void {
    if (this.selectedFile) {
      // Chama o serviço de upload
      const formData = new FormData();
      this.indexedDbService.getImageById(1).then((imageData: { blob: any; }) => {
        // A imagem recuperada do IndexedDB será um Blob
        const imageBlob = imageData.blob;
        // Criando o FormData        
        formData.append('file', imageBlob, 'image.jpg');
      });

      fetch('https://script.google.com/a/macros/a.recife.ifpe.edu.br/s/AKfycbxXnDhv5TFKZmEYXmAGXfSp6ePKrqiHROTvAI-Bp-CgbSZsR_jd6p6HtBrmaHddZD9E/exec', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        console.log('Imagem enviada com sucesso:', data);
      })
      .catch(error => {
        console.error('Erro ao enviar a imagem:', error);
      }); 

      // this.uploadService.uploadImage(formData).subscribe(
      //   (response) => {
      //     this.successMessage = `Imagem enviada com sucesso! ${response}`;
      //     this.errorMessage = '';
      //   },
      //   (error) => {
      //     this.errorMessage = 'Erro ao enviar a imagem!';
      //     this.successMessage = '';
      //   }
      // );

    } else {
      this.errorMessage = 'Por favor, selecione uma imagem primeiro!';
      this.successMessage = '';
    }
  }

   // Função para salvar a imagem no IndexedDB
   saveImageToIndexedDB(imageBlob: Blob): void {
    this.indexedDbService.saveImage(imageBlob)
      .then((message) => {
        console.log(message);  // Exibe mensagem de sucesso
      })
      .catch((error) => {
        console.error(error);  // Exibe erro caso ocorra
      });
  }

  // Função para exibir as imagens armazenadas
  showAllImages(): void {
    this.indexedDbService.getAllImages()
      .then((images) => {
        console.log('Imagens armazenadas:', images);
      })
      .catch((error) => {
        console.error(error);
      });
  }

}
