import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Login } from '../../models/login';
import { AuthenticationService } from '../../service/authentication.service';
import { Router } from '@angular/router';
import { MatSnackBar} from '@angular/material/snack-bar';
import { catchError } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  titleMain: string = "AtaOnline"
  loginForm!: FormGroup; 
  authLogin!: Login;
  errorAuth: boolean;
  successAuth: boolean;
  messageLogin: string;
  successMessage: string;
  loading: boolean = false;
  btnDisabled: boolean = true;
  btnColor: string = 'btn__grey'

  private _snackBar = inject(MatSnackBar);

  constructor(
    private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router
  ){ }

  ngOnInit(): void {
    this.titleMain = environment.titleMain;
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      password: ['',Validators.compose([
        Validators.required,
        Validators.minLength(6),
        this.specialCharacterValidator,
      ])]
    });

    this.loginForm.valueChanges.subscribe(() => {
      this.btnDisabled = this.loginForm.invalid;
      this.btnColor = this.loginForm.valid ? 'btn__primary' : 'btn__grey';
    });

    this.generateDeviceId();
  }


  login() {
    this.handleLoginError(true, '');

    this.authLogin = Object.assign('',this.authLogin, this.loginForm.value);
    this.authLogin.username = this.authLogin.username.toLowerCase();
    
    if (this.loginForm.invalid || this.loading) return;

    this.loading = true;
    this.btnDisabled = true;
    
    this.authenticationService.login({
      username: this.authLogin.username,
      password: this.authLogin.password,
      action: 'authCredentials',
      deviceid: localStorage.getItem('device_id') || ''
    }).pipe(
      catchError((error) => {
      return error;
      })
    ).subscribe({
      next: (res) => {
        if(res.success){
          this.handleLoginSuccess(res.message)
        } else {
          this.handleLoginError(res.success, res.message);
          this.loading = false;
          this.btnDisabled = false;
        }
      },
      error: (error) => {
        console.error(error);
      },
      complete: () => {
        console.log('Login request completed');      
      }
    });

  }

  logout(){
    this.authenticationService.logout();
    this.router.navigate(['auth', 'login']);
  }

  handleLoginError(success: boolean, message: string){
    this.errorAuth = !success
    this.messageLogin = message;
  }

  handleLoginSuccess(message: string){
    this.successAuth = true;
    this.messageLogin = message;
    setTimeout(() => {
      this.router.navigate(['meus-eventos']);
    }, 2000);
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, '', {duration: 3000});
  }

  generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  
  generateDeviceId = () => {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = `${this.generateUUID()}-${window.screen.width}-${window.screen.height}`;
      localStorage.setItem('device_id', deviceId);
    }
  }

  specialCharacterValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const specialChars = /[!?,#$%\&*]/;
    if (control.value && specialChars.test(control.value)) {
      return null;
    } else {
      return { specialCharacter: true }; 
    }
  }

  sair() {
    this.router.navigate(['/']);
  }
}