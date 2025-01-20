import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { LocalizacaoService } from '../../services/localizacao.service';
import { Subscription } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { Meeting } from '../../models/meeting';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss',
  animations: [

    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('500ms ease-out', style({ opacity: 0 }))
      ])
    ]),

    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('500ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' }))
      ])
    ])

  ]
})
export class FormComponent {
  
  successMessage: string = '';
  sheetId: string = '';
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
  enderecoLocal: any;
  infoReuniao: string = '';
  isLocationActive: boolean;
  isMeeting: boolean = false;
  isSending: boolean = false;
  isSpinner: boolean = true;
  private subscription: Subscription;
  reuniao: string = '';
  errorInputUserName: boolean = false;
  errorInputMatricula: boolean = false;
  btnColor: string = "btn__2";
  meeting: Meeting = new Meeting();

  constructor(
    private router: Router, 
    private localizacaoService: LocalizacaoService,
    private apiService: ApiService,
  ) {}

  async ngOnInit() {

    this.tempoDesdeUltimaRequisicaoGet();

    this.getMeetingData();
    
    this.getUrl();

    // Inscreve-se para ouvir as atualizações sobre o estado de localizacaoAtiva
    this.subscription = this.localizacaoService.localizacaoAtiva$.subscribe(
      (status) => {
        this.isLocationActive = status;
        console.log('Localização ativa:', this.isLocationActive);
      }
    );
  }
  
  ngOnDestroy() {
    // Cancela a inscrição ao destruir o componente para evitar vazamentos de memória
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getUrl() {
    let urlParams = new URLSearchParams(window.location.search)
    let urlMeeting = urlParams.get('ata') || null;
    if (urlMeeting)
      sessionStorage.setItem('url-param-meeting', urlMeeting);
  }
  
  clearSessionStorage() {
    sessionStorage.clear();
  }
  
  tempoDesdeUltimaRequisicaoGet() {
    let tInicial = sessionStorage.getItem('get-time') || "";
    let tFinal = new Date().getTime()
    if (tFinal - parseInt(tInicial) >= 10 * 60 * 1000) {
      console.log("Já se passaram 10 minutos desde a última requisição get.");
      this.clearSessionStorage();
    }
  }

  getMeetingData() {
    const urlParams = new URLSearchParams(window.location.search);
    if(urlParams.size === 0) {
      return this.messageRandom();
    }

    const reuniaoStatus = sessionStorage.getItem('reuniao-status');
    const sheetPageId = sessionStorage.getItem('sheet-page-id');
    const urlReuniao = urlParams.get('ata');

    if (reuniaoStatus === 'ABERTO' && urlReuniao === sheetPageId) {
      return this.messageMeeting(JSON.parse(sessionStorage.getItem('reuniao') || ''));
    }

    this.apiService.getMeeting(urlParams.get('ata'))
    .subscribe({
      next: (response) => {
        this.messageMeeting(response)
      },
      error: (err) => {
        console.error('Erro ao buscar dados da evento:', err);
        alert('Ocorreu um erro ao tentar carregar os dados da evento. Por favor, verifique sua conexão ou tente novamente mais tarde.');
      }
    });
  }
  
  messageMeeting(response: any) {
    // console.log(response);
    this.isSpinner = false;
    if (!response.success) {
      this.infoReuniao = 'Nenhum resultado encontrado';
      return;
    }

    if(response.content.status === 'FECHADO') {
      this.isMeeting = false;
      this.infoReuniao = 'Evento Fechado.'
    }

    if(response.content.status === 'ABERTO') {
      this.isMeeting = true;
      this.meeting.titulo = response.content.titulo;
      this.meeting.data = response.content.data;
      this.meeting.hora = response.content.hora;
      this.meeting.local = response.content.local;
    }

    if(response.content.status === 'PAUSADO') {
      this.isMeeting = false;
      this.infoReuniao = 'Evento Pausado.'
    }

    if(response.content.status === 'ENCERRADO') {
      this.isMeeting = false;
      this.infoReuniao = 'Evento Encerrado.';
    }

    if(response.content.status === 'CANCELADO') {
      this.isMeeting = false;
      this.infoReuniao = 'Evento Cancelado.';
    }


    sessionStorage.setItem('reuniao', JSON.stringify(response));
    sessionStorage.setItem('reuniao-status', response.content.status);
    sessionStorage.setItem('sheet-page-id', response.content.id);
    sessionStorage.setItem('folder-id', response.content.idFolder);
    sessionStorage.setItem('get-time', new Date().getTime().toString())
  }

  messageRandom() {
    this.infoReuniao = 'Leia o QRCode feito para o evento';
    this.isSpinner = false;
  }

  validarForm(): boolean {
    if (!this.cpf && !this.matricula || !this.userName)
      return true;
    else
      return false;
  }

  validarCampos(): string {
    if (!this.cpf && this.matricula.length < 6 || !this.userName)
      return 'btn__2';
    else
      return 'btn__primary';
  }

  onUserNameChange(): void {
    this.userName = this.userName.toUpperCase();
  }

  onBlurUserName(): void {
    if (!this.userName) {
      this.errorInputUserName = true;  // Mostra a mensagem de erro
    }
  }

  onBlurMatricula(): void {
    if (this.matricula.length < 6) {
      this.errorInputMatricula = true;
    }
  }

  onInputMatricula(): void {
    this.errorInputMatricula = false;
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
    // console.log(this.selectedFile);   
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
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          this.redimensionarImagem(img, 220, 280);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  erroValidacaoFormulario(): boolean {
    let nError = 0;

    if (!this.userName) {
      this.errorInputUserName = true;
      nError = 1;
    }

    if(this.matricula.length < 6){
      this.errorInputMatricula = true;
      nError = 1;
    }

    if (!this.selectedFile) {
      this.errorMessage = 'Nenhum arquivo selecionado.';
      this.successMessage= '';
      nError = 1;
    }

    if(nError === 1)
      return true;
    else
      return false
  }

  obterIniciais(nomeCompleto: any) {
    const palavras = nomeCompleto.trim().split(/\s+/);  
    // ignorar preposições comuns
    const preposicoes = ['de', 'da', 'do', 'das', 'dos'];
    const iniciais = palavras
      .filter((palavra: string) => !preposicoes.includes(palavra.toLowerCase()))
      .map((palavra: string[]) => palavra[0].toUpperCase());  
    return iniciais.join(' ');
  }

  esconderNumero(numero: string) {
    const numeroStr = numero.toString();
    if (numeroStr.length < 6) {
      return "Número muito curto!";
    }
    let n = numeroStr.length - 4;
    let parteOculta = "*".repeat(n);
    const visivel = numeroStr.slice(n, -1);
    return `${parteOculta}${visivel}*`;
  }  

  submitForm() {
    
    if(this.erroValidacaoFormulario())
      return;
      
    const base64File = (this.imageUrl as string).split(',')[1]; // Obtém apenas o Base64

    let obj = {
      base64File: base64File,
      userName: this.userName.trim(),
      matricula: this.matricula.trim(),
      cpf: this.cpf.trim(),
      distrito: this.distrito ? this.distrito.trim() : '',
      unidade: this.unidade ? this.unidade.trim() : '',
      enderecoLocal: JSON.stringify(this.enderecoLocal),
      status: sessionStorage.getItem('reuniao-status'),
      folderId: sessionStorage.getItem('folder-id'),
      sheetPageId: sessionStorage.getItem('sheet-page-id'),
      action:  'addParticipante',
      startLetter: this.obterIniciais(this.userName.trim()),
      hiddenMat: this.esconderNumero(this.matricula)
    }
    this.buttonText = 'Aguarde';
    this.isSending = true;

    //** Usa Fetch
    // this.saveParticipanteComFetch(obj);

    //** Usa HttpClient
    this.saveParticipante(obj);

  }

  saveParticipante(obj: any) {
    this.apiService.addParticipanteAoEvento(obj)
    .subscribe({
      next: (response) => {
        this.responseMessageSuccess(response)
      },
      error: (err) => {
        this.errorMessage = `Erro ao enviar arquivo: ${err}`;
        this.successMessage= ``;
        this.isSending = false;
      }
    });
  }

  async saveParticipanteComFetch(obj: any) {
    const res =  await this.apiService.fetchPostAddParticipante(obj);    
    this.responseMessageSuccess(res);
  }

  responseMessageSuccess(res: any) {
    if (res.message) {
      this.errorMessage = '';
      this.successMessage= `Registro enviado com sucesso!`;
      this.sheetId = res.content?.sheetId!;
      this.selectedFile = null;
      this.limparCampos();
      this.isSending = false;
    } else {
      this.errorMessage = `Erro: ${res.message}`;
      this.successMessage= ``;
      this.isSending = false;
    }
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
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = novaLargura;
    canvas.height = novaAltura;
    ctx.drawImage(imagem, 0, 0, novaLargura, novaAltura);
    const novaImagemBase64 = canvas.toDataURL('image/jpeg', 0.3);  // 0.3 define a qualidade (de 0 a 1)
    this.imageUrl = novaImagemBase64;
    // console.log(this.imageUrl.length);
  }

  sair() {
    if (sessionStorage.getItem('url-param-meeting')){
      if (confirm('Ao sair as informações sobre o evento serão apagadas. Será necessário ler novamente o QRCode do evento para um novo registro'))
        window.location.href = '/'
    } else
      window.location.href = '/'
  }

}