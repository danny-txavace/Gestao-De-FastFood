import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface IRouterUrl {
  url: string
}

@Injectable({
  providedIn: 'root',
})
export class RouterUrlRepository {
  private stored: IRouterUrl = { url: '' };
  private currentRouter = new BehaviorSubject<IRouterUrl>(this.receive());
  currentRouter$ = this.currentRouter.asObservable();

  receive(): IRouterUrl
  {
    return this.stored;
  }

  send(value: IRouterUrl): void
  {
    this.currentRouter.next(value);
    this.stored = value;
  }

  clear(): void {
    this.stored = {
      url: ''
    };
    this.currentRouter.next(this.stored);
  }
}
