import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { FormsModule } from '@angular/forms';
import { MatIconModule} from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { HttpClientModule } from '@angular/common/http';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ButtonComponent } from './components/button/button.component';
import { LocationComponent } from './components/location/location.component';
import { IndexComponent } from './pages/index/index.component';
import { HomeComponent } from './pages/home/home.component';
import { MenuComponent } from './components/menu/menu.component';
import { CameraComponent } from './components/camera/camera.component';
import { FormParticipanteComponent } from './components/form-participante/form-participante.component';
import { QrcodeComponent } from './pages/qrcode/qrcode.component';
import { RegistrosComponent } from './pages/registros/registros.component';
import { EventoGerenciarComponent } from './pages/evento-gerenciar/evento-gerenciar.component';
import { TermsOfUseComponent } from './pages/terms-of-use/terms-of-use.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { EventoListaComponent } from './components/evento-lista/evento-lista.component';
import { MatCardModule } from '@angular/material/card';
import { ModalEventoComponent } from './components/modal-evento/modal-evento.component';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { ModalEventoCadastrarComponent } from './components/modal-evento-cadastrar/modal-evento-cadastrar.component';
import { LoadingComponent } from './shared/loading/loading.component';

@NgModule({
  declarations: [
    AppComponent,
    ButtonComponent,
    LocationComponent,
    IndexComponent,
    HomeComponent,
    MenuComponent,
    CameraComponent,
    FormParticipanteComponent,
    QrcodeComponent,
    RegistrosComponent,
    EventoGerenciarComponent,
    TermsOfUseComponent,
    PrivacyPolicyComponent,
    EventoListaComponent,
    ModalEventoComponent,
    ClickOutsideDirective,
    ModalEventoCadastrarComponent,
    LoadingComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    MatIconModule,
    HttpClientModule,
    MatFormFieldModule,
    NgxMaskDirective,
    NgxMaskPipe,
    MatProgressSpinnerModule,
    MatTableModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatCardModule,
    MatDialogModule,
    BrowserAnimationsModule,
  ],
  providers: [
    provideAnimationsAsync(),
    provideNgxMask()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
