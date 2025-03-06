import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './pages/index/index.component';
import { HomeComponent } from './pages/home/home.component';
import { QrcodeComponent } from './pages/qrcode/qrcode.component';
import { RegistrosComponent } from './pages/registros/registros.component';
import { EventoGerenciarComponent } from './pages/evento-gerenciar/evento-gerenciar.component';
import { AuthModule } from './commom/auth/auth.module';
import { canActivateAuthGuard } from './commom/can-activate-auth.guard';
import { canMatchAuthGuard } from './commom/can-match-auth.guard';
import { TermsOfUseComponent } from './pages/terms-of-use/terms-of-use.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';

const routes: Routes = [
  { path: '', component: IndexComponent },
  { path: 'index', component: IndexComponent },
  { path: 'home', component: HomeComponent },
  { path: 'qrcode', component: QrcodeComponent },
  { path: 'registros', component: RegistrosComponent },
  { path: 'criar-evento', component: EventoGerenciarComponent, canActivate: [canActivateAuthGuard] },
  { path: 'meus-eventos', component: EventoGerenciarComponent, canActivate: [canActivateAuthGuard] },
  { path: 'auth', loadChildren: () => import('./commom/auth/auth.module').then(m => AuthModule), canMatch: [canMatchAuthGuard] },
  { path: 'termos-de-uso', component: TermsOfUseComponent },
  { path: 'politica-de-privacidade', component: PrivacyPolicyComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
