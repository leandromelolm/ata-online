import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './pages/index/index.component';
import { HomeComponent } from './pages/home/home.component';
import { QrcodeComponent } from './pages/qrcode/qrcode.component';
import { RegistrosComponent } from './pages/registros/registros.component';

const routes: Routes = [
  { path: '', component: IndexComponent },
  { path: 'index', component: IndexComponent },
  { path: 'home', component: HomeComponent },
  { path: 'qrcode', component: QrcodeComponent },
  { path: 'registros', component: RegistrosComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
