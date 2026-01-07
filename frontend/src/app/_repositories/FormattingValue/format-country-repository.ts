import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormatCountryRepository {
  private storageKey = 'ctry';
  private _countryActive$ = new BehaviorSubject<string>(this.getInitialCountryStored());

  getInitialCountryStored(): string
  {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) as string : 'Mozambique';
  }

  clear(): void {
    this._countryActive$.next('');
    localStorage.removeItem(this.storageKey);
  }

  setStoredCountry(value: string) {
    this.clear();
    this._countryActive$.next(value);
    localStorage.setItem(this.storageKey, JSON.stringify(value));
  }
}
