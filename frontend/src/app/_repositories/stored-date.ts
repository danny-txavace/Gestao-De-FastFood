import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface iStoredDate {
  start?: Date | undefined,
  end?: Date | undefined
}

@Injectable({
  providedIn: 'root'
})
export class StoredDate {
  private readonly storageKey = 'std';
  private currentDateSubject = new BehaviorSubject<iStoredDate>(this.getStoredDate());
  currentDate$ = this.currentDateSubject.asObservable();

  setStoredDate(value: iStoredDate): void {
    this.clear();
    this.currentDateSubject.next(value);
    sessionStorage.setItem(this.storageKey, JSON.stringify({
      start: value.start?.toISOString(),
      end: value.end?.toISOString()
    }));
  }

  clear(): void {
    sessionStorage.removeItem(this.storageKey);
  }

  getStoredDate(): iStoredDate
  {
    const data = sessionStorage.getItem(this.storageKey);
    if (!data) {
      return { start: new Date(), end: new Date() };
    }

    const parsed = JSON.parse(data) as Partial<iStoredDate | { start?: string; end?: string }>;

    return {
      start: parsed.start ? new Date(parsed.start) : new Date(),
      end: parsed.end ? new Date(parsed.end) : new Date()
    };
  }
}
