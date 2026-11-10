import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Notifications {

  private socket: Socket;
  public liveAlerts = signal<any[]>([]);

  constructor() {
    
    this.socket = io(environment.apiUrl);

    this.socket.on('admin:cart-activity', (data) => {

      console.log('Alerta WebSocket recibida:', data);

      this.liveAlerts.update(alerts => [data, ...alerts]);
    });
  }
}
