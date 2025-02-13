import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './pages/index/index.component';
import { HomeComponent } from './pages/home/home.component';
import { QrcodeComponent } from './pages/qrcode/qrcode.component';
import { RegistrosComponent } from './pages/registros/registros.component';
import { CriarEventoComponent } from './pages/criar-evento/criar-evento.component';
import { AuthModule } from './commom/auth/auth.module';
import { canActivateAuthGuard } from './commom/can-activate-auth.guard';
import { canMatchAuthGuard } from './commom/can-match-auth.guard';

const routes: Routes = [
  { path: '', component: IndexComponent },
  { path: 'index', component: IndexComponent },
  { path: 'home', component: HomeComponent },
  { path: 'qrcode', component: QrcodeComponent },
  { path: 'registros', component: RegistrosComponent },
  { path: 'criar-evento', component: CriarEventoComponent, canActivate: [canActivateAuthGuard] },
  { path: 'criar-evento/edit', component: CriarEventoComponent, canActivate: [canActivateAuthGuard] },
  { path: 'auth', loadChildren: () => import('./commom/auth/auth.module').then(m => AuthModule), canMatch: [canMatchAuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
