import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { CadastroComponent } from './components/cadastro/cadastro.component';
import { authCanMatchGuard } from '../auth-can-match.guard';

const routes: Routes = [
  {
    path: 'login', component: LoginComponent, canMatch: [authCanMatchGuard]
  },
  {
    path: 'cadastro', component: CadastroComponent, canMatch: [authCanMatchGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
