import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpTransportType, HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { Observable, Subject } from 'rxjs';

// npm install @microsoft/signalr
@Injectable({
  providedIn: 'root'
})
export class NotificationHub {
  private readonly hubUrl = `${environment.myUrl}/notificationHub`;
  private hubConnection?: HubConnection;
  private connectionSubject = new Subject<boolean>();

  constructor()
  {
    this.buildConnection();
  }

  private buildConnection(): void
  {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${this.hubUrl}`, {
        skipNegotiation: false,
        transport: HttpTransportType.WebSockets
      })
      .configureLogging(LogLevel.Warning)
      .withAutomaticReconnect()
      .build();

    this.registerEvents();
  }

  private registerEvents(): void
  {
    this.hubConnection!.onclose(err => {
      this.connectionSubject.next(false);
      if (err) this.tryRestartConnection();
    });

    this.hubConnection!.onreconnecting(err => {
      this.connectionSubject.next(false);
    });

    this.hubConnection!.onreconnected(conn => {
      this.connectionSubject.next(true);
    });
  }

  async startConnection(): Promise<void>
  {
    if (this.hubConnection?.state === HubConnectionState.Connected) return;

    try
    {
      await this.hubConnection?.start();
      this.connectionSubject.next(true);
    }
    catch (err)
    {
      this.connectionSubject.next(false);
      this.tryRestartConnection();
    }
  }

  private async tryRestartConnection(): Promise<void>
  {
    await new Promise(resolve => setTimeout(resolve, 5000));
    this.startConnection();
  }

  get connectionStatus$() : Observable<boolean>
  {
    return this.connectionSubject.asObservable();
  }

  receiveNotifs(): Observable<string>
  {
    return new Observable<string>(ob => {
      const handler = (message: string) => ob.next(message);
      this.hubConnection?.on('keyNotification', handler);

      return () => this.hubConnection?.off('keyNotification', handler);
    })
  }

  async disconnect(): Promise<void>
  {
    if (this.hubConnection?.state === HubConnectionState.Connected)
    {
      try
      {
        await this.hubConnection.stop();
        this.connectionSubject.next(true);
      }
      catch (err)
      {
        console.error('hub error: ', err);
        this.connectionSubject.next(false);
      }
    }
  }
}
