import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IBreadCrumbItem } from '../_interfaces/ibread-crumb-item';

@Injectable({
  providedIn: 'root'
})
export class BreadCrumbRepository {
  private storageKey = 'breadcrumb';
  private _breadcrumb$ = new BehaviorSubject<IBreadCrumbItem[]>(this.getInitialization());
  breadcrumb$ = this._breadcrumb$.asObservable();

  getBreadCrumb(): IBreadCrumbItem[] { return this._breadcrumb$.getValue(); }

  setBreadCrumb(breadCrumb: IBreadCrumbItem[]) {
    this.clear();
    this._breadcrumb$.next(breadCrumb);
    sessionStorage.setItem(this.storageKey, JSON.stringify(breadCrumb));
  }

  private clear() {
    this._breadcrumb$.next([]);
    sessionStorage.removeItem(this.storageKey);
  }

  private getInitialization(): IBreadCrumbItem[] {
    const data = sessionStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  addBreadCrumb(breadCrumb: IBreadCrumbItem) {
    const current = this._breadcrumb$.getValue();
    const exists = current.find(b => b.label === breadCrumb.label);

    if (!exists) {
      const updated = [...current, breadCrumb];
      this._breadcrumb$.next(updated);
      sessionStorage.setItem(this.storageKey, JSON.stringify(updated));
    }
  }
}
