import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class JwtService {
  constructor() {}

  setToken(token: string): void {
    localStorage.setItem('refresh_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  removeToken(): void {
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('access_token');
  }

  decodeToken(token: string): any {
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Erro ao decodificar o token:', error);
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    const decodedToken = this.decodeToken(token);
    if (!decodedToken || !decodedToken.exp) return true;

    const expirationDate = new Date(decodedToken.exp * 1000); 
    return expirationDate < new Date();
  }

  getUserInfo(): any {
    const token = this.getToken();
    if (!token) return null;

    const decodedToken = this.decodeToken(token);
    return decodedToken ? decodedToken : null;
  }
}