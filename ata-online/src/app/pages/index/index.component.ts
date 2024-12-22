import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss'
})
export class IndexComponent {

  userName: string;

  constructor(private router: Router) {}

  login() {
    sessionStorage.setItem('user', this.userName);
    this.router.navigate(['home']);
  }
}
