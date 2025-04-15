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

  ngOnInit() {
    sessionStorage.clear();
  }

  redirectHome() {
    this.router.navigate(['ata']);
  }
}
