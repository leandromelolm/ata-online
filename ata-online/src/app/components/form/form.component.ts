import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { LocalizacaoService } from '../../services/localizacao.service';
import { Subscription } from 'rxjs';
import { ApiService } from '../../services/api.service';

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
  userName: string = '';
  matricula: string = '';
  cpf: string = '';
  distrito: string;
  unidade: string;
  valorRecebido: string = 'mostrar';
  buttonText: string = 'Enviar';
  localizacaoAtiva: boolean;
  enderecoLocal: any;
  isMeeting: boolean = false;
  infoReuniao: string = '';
  isLoading: boolean = false;
  isSpinner: boolean = true;
  private subscription: Subscription;

  constructor(
    private router: Router, 
    private localizacaoService: LocalizacaoService,
    private apiService: ApiService
  ) {}

  async ngOnInit() {

    this.getMeetingData();

    // Inscreve-se para ouvir as atualizações sobre o estado de localizacaoAtiva
    this.subscription = this.localizacaoService.localizacaoAtiva$.subscribe(
      (status) => {
        this.localizacaoAtiva = status;
        console.log('Localização ativa:', this.localizacaoAtiva);
      }
    );

  }
  
  ngOnDestroy() {
    // Cancela a inscrição ao destruir o componente para evitar vazamentos de memória
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  
  getMeetingData() {
    let urlParams = new URLSearchParams(window.location.search);
    if(urlParams.size === 0) {
      return this.messageRandom();
    }
    this.apiService.getMeeting(urlParams.get('reuniao'))
    .subscribe({
      next: (response) => {
        this.messageMeeting(response);
        sessionStorage.setItem('reuniao-status', response.result.status);
        sessionStorage.setItem('sheet-page-id', response.result.id);
        sessionStorage.setItem('folder-id', response.result.idfolder);
      },
      error: (err) => {
        console.error('Erro ao buscar dados da reunião:', err);
        alert('Ocorreu um erro ao tentar carregar os dados da reunião. Por favor, verifique sua conexão ou tente novamente mais tarde.');
      }
    });
  }
  
  messageMeeting(response: any) {
    this.isSpinner = false;
    if(response.result.status === 'ABERTO' || response.result.status === 'TEST') {
      this.isMeeting = true;
      this.infoReuniao = `
      ${response.result.data} |
      ${response.result.hora} |
      ${response.result.local}
      `;
    }
    if(response.result.status === 'ENCERRADO') {
      this.infoReuniao = 'Reunião encerrada.';
    }
    if(response.result.status === 'PAUSADO') {
      this.infoReuniao = 'Reunião pausada.'
    } 
    if (response.result.status === 'Object Not Found') {
      this.infoReuniao = 'Reunião não encontrada';
      this.isSpinner = false;
    }
  }

  messageRandom() {
    this.infoReuniao = 'Leia o QRCode válido da reunião';
    this.isSpinner = false;
  }

  validarForm(): boolean {
    if (!this.cpf && !this.matricula || !this.userName)
      return true;
    else
      return false;
  }

  onUserNameChange(): void {
    this.userName = this.userName.toUpperCase();  // Converte para maiúsculas
  }

  redirectLogin() {
    this.router.navigate(['login']);
  }

  reloadPage() {
    let urlParams = window.location.search;
    if (urlParams)
      window.location.href = '/home' + urlParams;
    else
      window.location.href = '/home'
  }

  receberValorDaCamera(valor: string) {
    this.selectedFile = this.retornarUmFile(valor, 'imagem.png', 'image/png');
    console.log(this.selectedFile);    
    this.onImagePreview(this.selectedFile);
    this.valorRecebido = 'ocultar'
  }

  receberValorDaLocalizacao(e: any) {
    const endereco = {"state": e.state,  "city": e.city,  "postcode": e.postcode, "suburb": e.suburb, "road": e.road, "house_number": e.house_number};
    this.enderecoLocal = endereco;
    this.isSpinner = false;
  }

  alterarValor(valor: string) {
    this.valorRecebido = valor;
    this.imageUrl = '';
  }

  retornarUmFile(base64: string, nomeArquivo: string, tipo: string): File {
    // Remover o prefixo "data:image/png;base64," (ou outros tipos de mídia) da string Base64
    const base64Data = base64.split(',')[1];
  
    // Converter a string Base64 para um array de bytes
    const byteCharacters = atob(base64Data);
  
    // Criar um array de bytes
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
      const slice = byteCharacters.slice(offset, offset + 1024);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      byteArrays.push(new Uint8Array(byteNumbers));
    }
  
    // Criar o Blob a partir do array de bytes
    const blob = new Blob(byteArrays, { type: tipo });
  
    // Retornar o File com o nome especificado
    return new File([blob], nomeArquivo, { type: tipo });
  }
  
  
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
      };
      reader.readAsDataURL(file);
    }
  }

  async upload(): Promise<void> {
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
          userName: this.userName,
          matricula: this.matricula,
          cpf: this.cpf,
          distrito: this.distrito,
          unidade: this.unidade,
          enderecoLocal: JSON.stringify(this.enderecoLocal),
          status: sessionStorage.getItem('reuniao-status'),
          folderId: sessionStorage.getItem('folder-id'),
          sheetPageId: sessionStorage.getItem('sheet-page-id')
        }
        this.buttonText = 'Aguarde';
        this.isLoading = true;
        const response = await fetch('https://script.google.com/macros/s/AKfycbxJhOJh2hJVqiYLH59RXpROQBayFYTFSmx5qhkalHn3VqplFC8DuOUM0Elwy_HuOmzT/exec', {
          method: 'POST',
          body: JSON.stringify(obj)
        });

        const result = await response.json();
        
        this.buttonText = 'Enviar';
        if (result.success) {
          this.errorMessage = '';
          this.successMessage= `Registro enviado com sucesso! ID: ${result.sheetId} - ${result.fileId}`;
          this.selectedFile = null;
          this.limparCampos();
          this.isLoading = false;
        } else {
          this.errorMessage = `Erro: ${result.message}`;
          this.successMessage= ``;
          this.isLoading = false;
        }
      } catch (error) {
        this.errorMessage = `Erro ao enviar arquivo: ${error}`;
        this.successMessage= ``;
        this.isLoading = false;
      }
    };
    reader.readAsDataURL(this.selectedFile);
  } 
  limparCampos() {
    this.userName = '';
    this.matricula = '';
    this.cpf = '';
    this.distrito = '';
    this.unidade = '';
    this.imageUrl = '';
  }

  convertFileToBlob(file: File): void {
    const reader = new FileReader();
    
    reader.onloadend = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      this.imageBase64 = reader.result;
      this.blob = new Blob([arrayBuffer], { type: file.type });
      
      // console.log(reader.result);
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
    console.log(this.imageUrl.length);    
  }

  sair() {
    window.location.href = '/'
  }

}