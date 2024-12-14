import { Component } from '@angular/core';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent {
  
  successMessage: string = '';
  errorMessage: string = '';
  imageUrl: string | undefined;
  imageBase64: any;
  blob: any;
  selectedFile: File | null = null;
  userName: string;

  constructor() {}  
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.onImagePreview(this.selectedFile);      
    }
  }

  onImagePreview(event: any): void {
    const file: File = event;
    if (file) {
      // this.convertFileToBlob(file);
      const reader = new FileReader();
      // reader.onloadend = () => {
      //   this.imageUrl = reader.result as string;
      // };
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          this.redimensionarImagem(img, 280, 360);  // Reduz a resolução para 800x600
        };
        img.src = e.target.result;  // Define o conteúdo da imagem
        this.imageUrl = img.src;
        console.log(this.imageUrl);
        
      };
      reader.readAsDataURL(file);
    }
  }

  async uploadFile(): Promise<void> {
    if (!this.selectedFile) {
      this.errorMessage = 'Nenhum arquivo selecionado.';
      this.successMessage= '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64File = (this.imageUrl as string).split(',')[1]; // Obtém apenas o Base64

        let obj = {
          base64File: base64File,
          userName: this.userName
        }
        
        const response = await fetch('https://script.google.com/a/macros/a.recife.ifpe.edu.br/s/AKfycbxXnDhv5TFKZmEYXmAGXfSp6ePKrqiHROTvAI-Bp-CgbSZsR_jd6p6HtBrmaHddZD9E/exec', {
          method: 'POST',
          body: JSON.stringify(obj)
        });

        const result = await response.json();
        if (result.success) {          
          this.errorMessage = '';
          this.successMessage= `Arquivo enviado com sucesso! ID: ${result.fileId}, ${result.sheetId}`;
          this.selectedFile = null;
          this.userName = '';
          this.imageUrl = '';
        } else {
          this.errorMessage = `Erro: ${result.message}`;
          this.successMessage= ``;
        }
      } catch (error) {
        this.errorMessage = `Erro ao enviar arquivo: ${error}`;
        this.successMessage= ``;
      }
    };
    reader.readAsDataURL(this.selectedFile);
  }


  convertFileToBlob(file: File): void {
    const reader = new FileReader();
    
    reader.onloadend = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      this.imageBase64 = reader.result;
      this.blob = new Blob([arrayBuffer], { type: file.type });
      
      console.log(reader.result);
      console.log('Imagem convertida para Blob:', this.blob);
      
    };
    reader.readAsDataURL(file);  
  }

  redimensionarImagem(imagem: HTMLImageElement, novaLargura: number, novaAltura: number): void {
    // Cria um canvas para redimensionar a imagem
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // Define as novas dimensões
    canvas.width = novaLargura;
    canvas.height = novaAltura;

    // Desenha a imagem redimensionada no canvas
    ctx.drawImage(imagem, 0, 0, novaLargura, novaAltura);

    // Converte a imagem no canvas de volta para uma URL Base64
    const novaImagemBase64 = canvas.toDataURL('image/jpeg', 0.2);  // 0.7 define a qualidade (de 0 a 1)

    // Exibe a imagem redimensionada no template
    this.imageUrl = novaImagemBase64;
  }

}
