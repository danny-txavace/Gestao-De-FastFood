import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { Ripple } from 'primeng/ripple';
import { Subscription, take } from 'rxjs';
import { ToastRepository } from '../../../_repositories/toast-repository';
import { UserService } from '../../../_services/user-service';
import { DialogDeleteRepository } from '../../../_repositories/dialog-delete-repository';
import { IngredientService } from '../../../_services/ingredient-service';
import { ProductService } from '../../../_services/product-service';
import { CashRegisterService } from '../../../_services/cash-register-service';
import { CustomerService } from '../../../_services/customer-service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-delete-dialog',
  imports: [Ripple, Dialog, TranslateModule],
  templateUrl: './delete-dialog.html',
  styleUrl: './delete-dialog.scss',
})
export class DeleteDialog implements OnInit, OnDestroy {
  private readonly userService = inject(UserService);
  private readonly ingredientService = inject(IngredientService);
  private readonly productService = inject(ProductService);
  private readonly cashRegstService = inject(CashRegisterService);
  private readonly customerService = inject(CustomerService);

  private readonly toastRep = inject(ToastRepository);
  private dialogDeleteRep = inject(DialogDeleteRepository);

  private subs = new Subscription();
  params: any;
  showLoader: boolean = false;
  visible: boolean = false;
  format: string = '';
  entityName: string | undefined = '';
  id: string = '';
  name: string | undefined = '';

  ngOnInit(): void {
    this.subs.add(
      this.dialogDeleteRep.currentDialog$.subscribe(value => {
        if ((value.format === 'user-delete') || (value.format === 'ingredient-delete') || (value.format === 'product-delete') || (value.format === 'ingredient_product-delete') || (value.format === 'cash_register-delete') || (value.format === 'customer-delete'))
        {
          this.visible = value.isVisible;
          this.format = value.format;
          this.entityName = value.entityName;
          this.id = value.id!;
          this.name = value.name;
        }
      })
    );
  }

  ngOnDestroy(): void {
    if (this.subs) this.subs.unsubscribe();
    this.dialogDeleteRep.clear();
  }

  onDelete(): void
  {
    this.showLoader = true;
    if (this.id !== null)
    {
      if (this.format === 'user-delete')
      {
        this.subs.add(
          this.userService.deleteUser(this.id).pipe(
            take(1)
          ).subscribe({
            next: (resp) => {
              this.visible = false;
              this.showLoader = false;
              this.dialogDeleteRep.clear();
              this.toastRep.onShowMsg('info', resp.message);
            },
            error: (err) => {
              this.showLoader = false;
              this.toastRep.onShowMsg('error', err.error?.message);
            }
          })
        );
      }
      else if (this.format === 'ingredient-delete')
      {
        this.subs.add(
          this.ingredientService.delete(this.id).pipe(
            take(1)
          ).subscribe({
            next: (resp) => {
              this.visible = false;
              this.showLoader = false;
              this.dialogDeleteRep.clear();
              this.toastRep.onShowMsg('info', resp.message);
            },
            error: (err) => {
              this.showLoader = false;
              this.toastRep.onShowMsg('error', err.error?.message);
            }
          })
        );
      }
      else if (this.format === 'product-delete')
      {
        this.subs.add(
          this.productService.delete(this.id).pipe(
            take(1)
          ).subscribe({
            next: (resp) => {
              this.visible = false;
              this.showLoader = false;
              this.dialogDeleteRep.clear();
              this.toastRep.onShowMsg('info', resp.message);
            },
            error: (err) => {
              this.showLoader = false;
              this.toastRep.onShowMsg('error', err.error?.message);
            }
          })
        );
      }
      else if (this.format === 'ingredient_product-delete')
      {
        this.subs.add(
          this.productService.deleteProductIngredient(this.id).pipe(
            take(1)
          ).subscribe({
            next: (resp) => {
              this.visible = false;
              this.showLoader = false;
              this.dialogDeleteRep.clear();
              this.toastRep.onShowMsg('info', resp.message);
            },
            error: (err) => {
              this.showLoader = false;
              this.toastRep.onShowMsg('error', err.error?.message);
            }
          })
        );
      }
      else if (this.format === 'cash_register-delete')
      {
        this.subs.add(
          this.cashRegstService.delete(this.id).pipe(
            take(1)
          ).subscribe({
            next: (resp) => {
              this.visible = false;
              this.showLoader = false;
              this.dialogDeleteRep.clear();
              this.toastRep.onShowMsg('info', resp.message);
            },
            error: (err) => {
              this.showLoader = false;
              this.toastRep.onShowMsg('error', err.error?.message);
            }
          })
        );
      }
      else if (this.format === 'customer-delete')
      {
        this.subs.add(
          this.customerService.delete(this.id).pipe(
            take(1)
          ).subscribe({
            next: (resp) => {
              this.visible = false;
              this.showLoader = false;
              this.dialogDeleteRep.clear();
              this.toastRep.onShowMsg('info', resp.message);
            },
            error: (err) => {
              this.showLoader = false;
              this.toastRep.onShowMsg('error', err.error?.message);
            }
          })
        );
      }
    }
    else
    {
      this.visible = false;
      this.showLoader = false;
    }
  }
}
