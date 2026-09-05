import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss'
})
export class IndexComponent {

  titleMain: string = "AtaOnline";
  background_title: string = "ata-online";


  constructor(private router: Router) {}

  ngOnInit() {
    this.titleMain = environment.titleMain;
    this.background_title = environment.title
    sessionStorage.clear();

  }

  redirectHome() {
    this.router.navigate(['ata']);
  }
}
