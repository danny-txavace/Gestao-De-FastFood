import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface IDialogDelete {
  format: string
  isVisible: boolean
  entityName: string
  id: string
  name: string
}

@Injectable({
  providedIn: 'root',
})
export class DialogDeleteRepository {
  private stored: IDialogDelete =
  {
    format: '',
    isVisible: false,
    entityName: '',
    id: '',
    name: ''
  };
  private currentDialog = new BehaviorSubject<IDialogDelete>(this.receive());
  currentDialog$ = this.currentDialog.asObservable();

  receive(): IDialogDelete
  {
    return this.stored;
  }

  send(value: IDialogDelete): void
  {
    this.currentDialog.next(value);
    this.stored = value;
  }

  clear(): void {
    this.stored = {
      format: '',
      isVisible: false,
      entityName: '',
      id: '',
      name: ''
    };
    this.currentDialog.next(this.stored);
  }
}
