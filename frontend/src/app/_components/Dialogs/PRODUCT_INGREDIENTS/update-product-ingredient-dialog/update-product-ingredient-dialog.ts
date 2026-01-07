import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputNumber } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { Subscription, take } from 'rxjs';
import { ProductIngredientSelectIngredientDTO } from '../../../../_interfaces/product-ingredient-select-ingredient-dto';
import { DialogUpdateRepository } from '../../../../_repositories/dialog-update-repository';
import { ToastRepository } from '../../../../_repositories/toast-repository';
import { NotificationHub } from '../../../../_services/notification-hub';
import { ProductService } from '../../../../_services/product-service';
import { ProductIngredientsUpdateDTO } from '../../../../_interfaces/product-ingredients-update-dto';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-update-product-ingredient-dialog',
  imports: [Ripple, FloatLabel, FormsModule, InputIcon, IconField, ReactiveFormsModule, InputTextModule, Dialog, SelectModule, InputNumber, TranslateModule],
  templateUrl: './update-product-ingredient-dialog.html',
  styleUrl: './update-product-ingredient-dialog.scss',
})
export class UpdateProductIngredientDialog implements OnInit, OnDestroy {
  private readonly productService = inject(ProductService);
  private readonly hubNotif = inject(NotificationHub);
  private readonly toastRep = inject(ToastRepository);
  private dialogUpdateRep = inject(DialogUpdateRepository);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly subs = new Subscription();
  private readonly fb = inject(FormBuilder);
  form!: FormGroup;
  showLoader = false;

  visible: boolean = false;
  id: string = '';

  ingredientOptions: ProductIngredientSelectIngredientDTO[] = [];

  ngOnInit(): void {
    this.initializeForm();

    this.subs.add(
      this.dialogUpdateRep.currentDialog$.subscribe(value => {
        if (value.format === 'ingredient_product-update')
        {
          this.visible = value.isVisible;
          this.id = value.id;

          if (value !== null)
          {
            this.form.patchValue
            ({
              ingredient: value.name,
              quantity: value.quantity
            });
          }

          this.loadingSelectIngredient();
          this.subs.add(
            this.hubNotif.receiveNotifs().subscribe(() => {
              this.loadingSelectIngredient();
            })
          );
        }
      })
    );
  }

  ngOnDestroy(): void {
    if (this.subs) this.subs.unsubscribe();
    this.dialogUpdateRep.clear();
  }

  private initializeForm()
  {
    this.form = this.fb.group({
      ingredient: [null],
      quantity: []
    });
  }

  private loadingSelectIngredient(): void
  {
    this.subs.add(
      this.productService.getSelectIgredient().subscribe((data: any) => {
        this.ingredientOptions = data;
        this.cdr.detectChanges();
      })
    );
  }

  onSubmit(): void
  {
    this.showLoader = true;

    if (this.form.valid)
    {
      const payload: ProductIngredientsUpdateDTO =
      {
        id: this.id,
        ingredientId: this.form.value.ingredient,
        quantity: this.form.value.quantity
      };

      this.subs.add(
        this.productService.updateProductIngredient(payload).pipe(
          take(1)
        ).subscribe({
          next: (resp) => {
            this.visible = false;
            this.showLoader = false;
            this.dialogUpdateRep.clear();
            this.form.reset();
            this.initializeForm();

            this.toastRep.onShowMsg('success', resp.message);
          },
          error: (err: any) => {
            this.showLoader = false;

            let errorMessage = 'ERRORS.UNEXPECTED_ERROR';
            let fieldErrors: any = {};

            // Most common cases (covers 95% of backends)
            if (err.error) {
              // Case 1: Simple string message
              if (typeof err.error === 'string') {
                errorMessage = err.error;
              }
              // Case 2: { message: "..." }
              else if (err.error.message) {
                errorMessage = err.error.message;
              }
              // Case 3: Validation errors (Spring Boot, NestJS, etc.)
              else if (err.error.errors || err.error.detail) {
                const errors = err.error.errors || err.error.detail;

                if (Array.isArray(errors)) {
                  // Array of strings: ["itemName is required", "price must be positive"]
                  errorMessage = errors.join(', ');
                }
                else if (typeof errors === 'object') {
                  // Object with field names: { itemName: ["cannot be empty"], price: ["too low"] }
                  fieldErrors = errors;
                  errorMessage = 'ERRORS.REQUIRED_FIELDS';
                }
              }
            }

            // Fallback: use status text
            if (!errorMessage || errorMessage === 'An unexpected error occurred') {
              errorMessage = err.message || err.statusText || 'ERRORS.REQUEST_FAILED';
            }

            // Show toast
            this.toastRep.onShowMsg('info', errorMessage);
          }
        })
      );
    }
    else
    {
      this.showLoader = false;
    }
  }
}
