import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Address {
  
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  
  addresses = signal<any[]>([]);

  loadAddresses() {

    this.http.get<any[]>(`${this.apiUrl}/address`).subscribe(res => {

      this.addresses.set(res);
    });
  }

  createAddress(data: any) {

    return this.http.post(`${this.apiUrl}/address`, data);
  }

  updateAddress(id: string, data: any) {

    return this.http.patch(`${this.apiUrl}/address/${id}`, data);
  }

  deleteAddress(id: string) {

    return this.http.delete(`${this.apiUrl}/address/${id}`);
  }
}