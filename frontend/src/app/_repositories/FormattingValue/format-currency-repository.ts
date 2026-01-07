import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormatCurrencyRepository {
  private storageKey = 'cury';
  private _currencyCountry$ = new BehaviorSubject<string>(this.getInitialCurrencyStored());

  getInitialCurrencyStored(): string
  {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) as string : 'Mozambican MT';
  }

  clear(): void {
    this._currencyCountry$.next('');
    localStorage.removeItem(this.storageKey);
  }

  setStoredCurrancy(value: string) {
    this.clear();
    this._currencyCountry$.next(value);
    localStorage.setItem(this.storageKey, JSON.stringify(value));
  }
}
