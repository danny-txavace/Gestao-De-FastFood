import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface IDialogUpdate {
  format: string
  isVisible: boolean
  id: string
  name: string

  // User
  phoneNumber?: string
  roles?: string

  // Ingredient
  batchNumber?: string
  packageSize?: number
  unitOfMeasure?: string
  quantity?: number
  unitCostPrice?: number
  expirationAt?: Date

  // Product
  imageUrl?: string | ArrayBuffer | null
  removeImage?: boolean
  price?: number
  category?: string

  // Customer
  orderQty?: number

  // POS
  amount?: number

  // global
  isActive?: boolean
}

@Injectable({
  providedIn: 'root',
})
export class DialogUpdateRepository {
  private stored: IDialogUpdate =
  {
    format: '',
    isVisible: false,
    id: '',
    name: ''
  };
  private currentDialog = new BehaviorSubject<IDialogUpdate>(this.receive());
  currentDialog$ = this.currentDialog.asObservable();

  receive(): IDialogUpdate
  {
    return this.stored;
  }

  send(value: IDialogUpdate): void
  {
    this.currentDialog.next(value);
    this.stored = value;
  }

  clear(): void {
    this.stored = {
      format: '',
      isVisible: false,
      id: '',
      name: ''
    };
    this.currentDialog.next(this.stored);
  }
}
