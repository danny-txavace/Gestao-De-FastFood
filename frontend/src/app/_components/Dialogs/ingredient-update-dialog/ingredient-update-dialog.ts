import { NgClass } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputNumber } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { Subscription, take } from 'rxjs';
import { ToastRepository } from '../../../_repositories/toast-repository';
import { IngredientService } from '../../../_services/ingredient-service';
import { DialogUpdateRepository } from '../../../_repositories/dialog-update-repository';
import { RadioButton } from 'primeng/radiobutton';
import { IngredientsUpdateDTO } from '../../../_interfaces/ingredients-update-dto';
import { capitalizeWords } from '../../../_utils/global-methods';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-ingredient-update-dialog',
  imports: [Ripple, FloatLabel, FormsModule, InputIcon, IconField, ReactiveFormsModule, InputTextModule, Dialog, NgClass, DatePicker, SelectModule, InputNumber, RadioButton, TranslateModule],
  templateUrl: './ingredient-update-dialog.html',
  styleUrl: './ingredient-update-dialog.scss',
})
export class IngredientUpdateDialog implements OnInit, OnDestroy {
  private readonly ingredientService = inject(IngredientService);
  private readonly toastRep = inject(ToastRepository);
  private dialogUpdateRep = inject(DialogUpdateRepository);
  private readonly translateService = inject(TranslateService);
  private readonly subs = new Subscription();
  private readonly fb = inject(FormBuilder);
  form!: FormGroup;
  showLoader = false;

  isErrorItemName = false;
  visible: boolean = false;

  id: string = '';
  itemName: string | undefined = '';

  unitOptions: { label: string, value: string }[] =
  [ { label: '', value: '' } ];

  ngOnInit(): void {
    this.initializeForm();

    this.subs.add(
      this.dialogUpdateRep.currentDialog$.subscribe(value => {
        if (value.format === 'ingredient-update')
        {
          this.visible = value.isVisible;

          this.id = value.id;
          this.itemName = value.name;

          if (value !== null)
          {
            this.form.patchValue
            ({
              itemName: value.name,
              batchNumber: value.batchNumber,
              packageSize: value.packageSize,
              unitOfMeasure: value.unitOfMeasure,
              quantity: value.quantity,
              unitCostPrice: value.unitCostPrice,
              expirationAt: value.expirationAt ? new Date(value.expirationAt) : null,
              status: value.isActive
            });
          }

          this.translateions();
          this.subs.add(
            this.translateService.onLangChange.subscribe(() => {
              this.translateions();
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
      itemName: ['', Validators.required],
      batchNumber: [null],
      packageSize: [0],
      unitOfMeasure: [null],
      quantity: [0],
      unitCostPrice: [0],
      expirationAt: [null],
      status: ['']
    });

    this.form.get('itemName')?.valueChanges.subscribe(() => {
      this.form.get('itemName')?.setErrors(null);
      this.isErrorItemName = false;
    });
  }

  private resetFormErrors() {
    this.form.get('itemName')?.setErrors(null);
    this.form.get('itemName')?.updateValueAndValidity();

    this.isErrorItemName = false;
  }

  private translateions(): void
  {
    this.unitOptions = [
      // General
      { label: this.translateService.instant('COMMON.UNIT_OF_MEASURE.UNIT'), value: 'unit' },
      { label: this.translateService.instant('COMMON.UNIT_OF_MEASURE.BOTTLE'), value: 'bottle' },
      { label: this.translateService.instant('COMMON.UNIT_OF_MEASURE.DOZEN'), value: 'dozen' },

      // Weight
      { label: this.translateService.instant('COMMON.UNIT_OF_MEASURE.GRAM'), value: 'g' },
      { label: this.translateService.instant('COMMON.UNIT_OF_MEASURE.KILOGRAM'), value: 'kg' },
      { label: this.translateService.instant('COMMON.UNIT_OF_MEASURE.MILLIGRAM'), value: 'mg' },

      // Volume
      { label: this.translateService.instant('COMMON.UNIT_OF_MEASURE.MILLILITER'), value: 'ml' },
      { label: this.translateService.instant('COMMON.UNIT_OF_MEASURE.LITER'), value: 'L' },
      { label: this.translateService.instant('COMMON.UNIT_OF_MEASURE.OTHER'), value: 'other' },
    ];
  }

  onSubmit(): void
  {
    this.showLoader = true;
    this.resetFormErrors();

    if (this.form.valid)
    {
      const payload: IngredientsUpdateDTO =
      {
        id: this.id,
        itemName: capitalizeWords(this.form.value.itemName),
        batchNumber: this.form.value.batchNumber,
        packageSize: this.form.value.packageSize,
        unitOfMeasure: this.form.value.unitOfMeasure,
        quantity: this.form.value.quantity,
        unitCostPrice: this.form.value.unitCostPrice,
        expirationAt: this.form.value.expirationAt,
        isActive: this.form.value.status
      };

      this.subs.add(
        this.ingredientService.update(payload).pipe(
          take(1)
        ).subscribe({
          next: (resp) => {
            Object.keys(this.form.controls).forEach(key => {
              this.form.get(key)?.setErrors(null);
            });

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

                  // Auto-mark invalid fields in the form
                  Object.keys(fieldErrors).forEach(field => {
                    const control = this.form.get(field);
                    if (control) {
                      control.setErrors({ serverError: fieldErrors[field].join(', ') });
                      control.markAsTouched();
                    }
                  });
                }
              }
            }

            // Fallback: use status text
            if (!errorMessage || errorMessage === 'An unexpected error occurred') {
              errorMessage = err.message || err.statusText || 'ERRORS.REQUEST_FAILED';
            }

            // Show toast
            this.toastRep.onShowMsg('error', errorMessage);

            // Optional: highlight specific field (like itemName)
            this.form.get('itemName')?.setErrors({ invalid: true });
            this.isErrorItemName = true;
          }
        })
      );
    }
    else
    {
      this.showLoader = false;
      this.isErrorItemName = true;
    }
  }
}
