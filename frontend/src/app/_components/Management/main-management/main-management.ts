import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ManagementNavbar } from "../management-navbar/management-navbar";
import { ManagementOutlet } from "../../../_pages/Outlet/management-outlet/management-outlet";
import { IBreadCrumbItem } from '../../../_interfaces/ibread-crumb-item';
import { BreadCrumbRepository } from '../../../_repositories/bread-crumb-repository';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ManagementFooter } from "../management-footer/management-footer";
import { AuthService } from '../../../_services/auth-service';

@Component({
  selector: 'app-main-management',
  imports: [ManagementNavbar, ManagementOutlet, CommonModule, ManagementFooter],
  templateUrl: './main-management.html',
  styleUrl: './main-management.scss'
})
export class MainManagement implements OnInit, OnDestroy {
  private readonly bCrumbRep = inject(BreadCrumbRepository);

  readonly authService = inject(AuthService);

  private subs = new Subscription();
  private router = inject(Router);
  breadCrumbItem: IBreadCrumbItem[] = [];

  ngOnInit(): void {
    this.authService.checkSession();
    this.subs.add(
      this.bCrumbRep.breadcrumb$.subscribe(bc => this.breadCrumbItem = bc)
    );
  }

  ngOnDestroy(): void {
    if(this.subs) this.subs.unsubscribe();
  }

  navigateTo (breadCrumb: { icon?: string, label: string, url?: any[] }[]) {
    this.bCrumbRep.setBreadCrumb(breadCrumb);
  }

  goBackTo(label: string) {
    const current = this.bCrumbRep.getBreadCrumb();
    const target = current.find(b => b.label === label);

    if (target) {
      const index = current.findIndex(b => b.label === label);
      const updated = current.slice(0, index + 1);

      this.bCrumbRep.setBreadCrumb(updated);

      if (target.url) {
        this.router.navigate(target.url);
      }
    }
  }
}
