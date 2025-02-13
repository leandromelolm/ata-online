import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { CadastroComponent } from './components/cadastro/cadastro.component';
import { canMatchAuthGuard } from '../can-match-auth.guard';

const routes: Routes = [
  {
    path: 'login', component: LoginComponent, // rota com canMatchAuthGuard no app-routing.module.ts
  },
  {
    path: 'cadastro', component: CadastroComponent, canMatch: [canMatchAuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
