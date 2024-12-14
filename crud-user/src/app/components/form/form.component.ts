import { Component } from '@angular/core';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent {

  selectedFile: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  imageUrl: string | undefined;
  imageBase64: any;
  blob: any;
  selectedFile2: File | null = null;;

  constructor() {}  
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile2 = input.files[0];
      this.onImagePreview(this.selectedFile2);
      this.selectedFile = true;
    }
  }

  onImagePreview(event: any): void {
    const file: File = event;
    if (file) {
      // this.convertFileToBlob(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        this.imageUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async uploadFile(): Promise<void> {
    if (!this.selectedFile2) {
      this.errorMessage = 'Nenhum arquivo selecionado.';
      this.successMessage= '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64File = (reader.result as string).split(',')[1]; // Obtém apenas o Base64
        const response = await fetch('https://script.google.com/a/macros/a.recife.ifpe.edu.br/s/AKfycbxXnDhv5TFKZmEYXmAGXfSp6ePKrqiHROTvAI-Bp-CgbSZsR_jd6p6HtBrmaHddZD9E/exec', {
          method: 'POST',
          body: base64File
        });

        const result = await response.json();
        if (result.success) {          
          this.errorMessage = '';
          this.successMessage= `Arquivo enviado com sucesso! ID: ${result.fileId}, ${result.sheetId}`;
        } else {
          this.errorMessage = `Erro: ${result.message}`;
          this.successMessage= ``;
        }
      } catch (error) {
        this.errorMessage = `Erro ao enviar arquivo: ${error}`;
        this.successMessage= ``;
      }
    };
    reader.readAsDataURL(this.selectedFile2);
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

}
