import { Injectable } from '@angular/core';
import CryptoJS from 'crypto-js'; 
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  private secretKey = environment.ENV_CRYPTO_KEY_SECRET;

  constructor() {}

  encrypt(value: string): string {
    return CryptoJS.AES.encrypt(value, this.secretKey.trim()).toString();
  }

  decrypt(encryptedValue: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedValue, this.secretKey.trim());
    return bytes.toString(CryptoJS.enc.Utf8);
  }   
  
}
