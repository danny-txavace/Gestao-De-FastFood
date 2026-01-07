import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface IDialogCreate {
  format: string
  isVisible: boolean

  id?: string

  // POS
  totalAmount?: number
  orderItems?: {
    id: string
    quantity: number
  }[]
}

@Injectable({
  providedIn: 'root',
})
export class DialogCreateRepository {
  private stored: IDialogCreate = { format: '', isVisible: false };
  private currentDialog = new BehaviorSubject<IDialogCreate>(this.receive());
  currentDialog$ = this.currentDialog.asObservable();

  receive(): IDialogCreate
  {
    return this.stored;
  }

  send(value: IDialogCreate): void
  {
    this.currentDialog.next(value);
    this.stored = value;
  }

  clear(): void {
    this.stored = {
      format: '',
      isVisible: false
    };
    this.currentDialog.next(this.stored);
  }
}
