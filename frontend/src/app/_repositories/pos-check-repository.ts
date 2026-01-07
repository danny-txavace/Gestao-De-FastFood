import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface PosCheckData {
  userId: string,
  cashRegisterId: string;
  status: boolean;
}

@Injectable({ providedIn: 'root' })
export class PosCheckRepository {
  private readonly storageKey = 'pos1234534523sjk_qwf';
  private currentCheckPos = new BehaviorSubject<PosCheckData>(this.get());
  currentCheckPos$ = this.currentCheckPos.asObservable();

  get(): PosCheckData {
    const data = sessionStorage.getItem(this.storageKey);
    if (!data) {
      return { userId: '', cashRegisterId: '', status: false };
    }

    const parsed = JSON.parse(data) as Partial<PosCheckData | { userId: string, cashRegisterId: string; status: false }>;

   return {
    userId: parsed.userId ? parsed.userId : '',
    cashRegisterId: parsed.cashRegisterId ? parsed.cashRegisterId : '',
    status: parsed.status ? parsed.status : false
   }
  }

  set(value: PosCheckData): void {
    this.currentCheckPos.next(value);
    sessionStorage.setItem(this.storageKey, JSON.stringify({
      userId: value.userId,
      cashRegisterId: value.cashRegisterId,
      status: value.status
    }));
  }

  clear(): void {
    this.set({ userId: '', cashRegisterId: '', status: false });
    sessionStorage.removeItem(this.storageKey);
    console.log('cash cleaned!!')
  }
}
