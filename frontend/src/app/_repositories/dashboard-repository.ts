import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardRepository {
  private storageKeySingle = 'dashActivSingleTab';
  private _acitveSingleTab$ = new BehaviorSubject<string>(this.getInitialStoredSingleActiveTab());

  setStoredSingleTab(value: string): void
  {
    this.clearSingle();
    this._acitveSingleTab$.next(value);
    sessionStorage.setItem(this.storageKeySingle, JSON.stringify(value))
  }

  clearSingle(): void {
    this._acitveSingleTab$.next('');
    sessionStorage.removeItem(this.storageKeySingle);
  }

  getInitialStoredSingleActiveTab(): string
  {
    const data = sessionStorage.getItem(this.storageKeySingle);
    return data ? JSON.parse(data) as string : 'Overview';
  }
}
