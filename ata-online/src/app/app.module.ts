import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ButtonComponent } from './components/button/button.component';
import { LocationComponent } from './components/location/location.component';
import { IndexComponent } from './pages/index/index.component';
import { FormsModule } from '@angular/forms';
import { HomeComponent } from './pages/home/home.component';
import { MenuComponent } from './components/menu/menu.component';
import { MatIconModule} from '@angular/material/icon';
import { CameraComponent } from './components/camera/camera.component';
import { FormParticipanteComponent } from './components/form-participante/form-participante.component';
import { HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { QrcodeComponent } from './pages/qrcode/qrcode.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RegistrosComponent } from './pages/registros/registros.component';
import { CriarEventoComponent } from './pages/criar-evento/criar-evento.component';
import {MatTableModule} from '@angular/material/table';

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
    CriarEventoComponent
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
    MatTableModule
  ],
  providers: [
    provideAnimationsAsync(),
    provideNgxMask()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
