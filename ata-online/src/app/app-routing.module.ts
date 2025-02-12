import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './pages/index/index.component';
import { HomeComponent } from './pages/home/home.component';
import { QrcodeComponent } from './pages/qrcode/qrcode.component';
import { RegistrosComponent } from './pages/registros/registros.component';
import { CriarEventoComponent } from './pages/criar-evento/criar-evento.component';
import { AuthModule } from './commom/auth/auth.module';
import { authGuard } from './commom/auth.guard';
import { authCanMatchGuard } from './commom/auth-can-match.guard';

const routes: Routes = [
  { path: '', component: IndexComponent },
  { path: 'index', component: IndexComponent },
  { path: 'home', component: HomeComponent },
  { path: 'qrcode', component: QrcodeComponent },
  { path: 'registros', component: RegistrosComponent },
  { path: 'criar-evento', component: CriarEventoComponent, canActivate: [authGuard] },
  { path: 'criar-evento/edit', component: CriarEventoComponent, canActivate: [authGuard] },
  { path: 'auth', loadChildren: () => import('./commom/auth/auth.module').then(m => AuthModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
