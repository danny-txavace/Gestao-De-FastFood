import { NgClass } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { Subscription, take } from 'rxjs';
import { DialogCreateRepository } from '../../../_repositories/dialog-create-repository';
import { ToastRepository } from '../../../_repositories/toast-repository';
import { IngredientService } from '../../../_services/ingredient-service';
import { SelectModule } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { InputNumber } from 'primeng/inputnumber';
import { IngredientsCreateDTO } from '../../../_interfaces/ingredients-create-dto';
import { capitalizeWords } from '../../../_utils/global-methods';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-ingredient-create-dialog',
  imports: [Ripple, FloatLabel, FormsModule, InputIcon, IconField, ReactiveFormsModule, InputTextModule, Dialog, NgClass, DatePicker, SelectModule, InputNumber, TranslateModule],
  templateUrl: './ingredient-create-dialog.html',
  styleUrl: './ingredient-create-dialog.scss',
})
export class IngredientCreateDialog implements OnInit, OnDestroy {
  private readonly ingredientService = inject(IngredientService);
  private readonly toastRep = inject(ToastRepository);
  private dialogCreateRep = inject(DialogCreateRepository);
  private readonly translateService = inject(TranslateService);
  private readonly subs = new Subscription();
  private readonly fb = inject(FormBuilder);

  form!: FormGroup;
  showLoader = false;

  isErrorItemName = false;
  visible: boolean = false;

  unitOptions: { label: string, value: string }[] =
  [ { label: '', value: '' } ];

  ngOnInit(): void {
    this.initializeForm();

    this.subs.add(
      this.dialogCreateRep.currentDialog$.subscribe(value => {
        if (value.format === 'ingredient-create')
          {
            this.visible = value.isVisible;

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
    this.dialogCreateRep.clear();
  }

  private initializeForm()
  {
    this.form = this.fb.group({
      itemName: ['', Validators.required],
      batchNumber: [null],
      packageSize: [],
      unitOfMeasure: [null],
      quantity: [],
      unitCostPrice: [],
      expirationAt: [null],
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
      const payload: IngredientsCreateDTO =
      {
        itemName: capitalizeWords(this.form.value.itemName),
        batchNumber: this.form.value.batchNumber,
        packageSize: this.form.value.packageSize,
        unitOfMeasure: this.form.value.unitOfMeasure,
        quantity: this.form.value.quantity,
        unitCostPrice: this.form.value.unitCostPrice,
        expirationAt: this.form.value.expirationAt
      };

      this.subs.add(
        this.ingredientService.create(payload).pipe(
          take(1)
        ).subscribe({
          next: (resp) => {
            Object.keys(this.form.controls).forEach(key => {
              this.form.get(key)?.setErrors(null);
            });

            this.visible = false;
            this.showLoader = false;
            this.dialogCreateRep.clear();
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
