import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class Auth {

  private apiUrl = environment.apiUrl;
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient, private router: Router) { }

  currentUser = signal<any>(this.getUserFromStorage());

  login(email: string, password: string): Observable<any> {

    return this.http.post(`${this.apiUrl}/auth/login`, { email, password });
  }

  register(userData: any): Observable<any> {

    return this.http.post(`${this.apiUrl}/user`, userData);
  }

  saveToken(token: string) {

    if (isPlatformBrowser(this.platformId)) {
      
      localStorage.setItem('access_token', token);
    }
  }

  saveUser(user: any) {

    if (isPlatformBrowser(this.platformId)) {

      localStorage.setItem('user', JSON.stringify(user));
    }

    this.currentUser.set(user);
  }

  getUserFromStorage() {

    // SOLO intenta leer localStorage si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {

      const user = localStorage.getItem('user');

      return user ? JSON.parse(user) : null;
    }

    return null; // Si estamos en el servidor, devuelve null
  }

  logout() {

    if (isPlatformBrowser(this.platformId)) {

      localStorage.removeItem('access_token');

      localStorage.removeItem('user');
    }

    this.currentUser.set(null);

    this.router.navigate(['/login']);
  }

  getToken() {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('access_token');
    }
    return null;
  }
}
