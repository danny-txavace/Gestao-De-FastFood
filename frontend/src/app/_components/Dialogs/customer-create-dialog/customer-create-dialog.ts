import { NgClass } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { Subscription, take } from 'rxjs';
import { CustomerCreateDTO } from '../../../_interfaces/customer-create-dto';
import { DialogCreateRepository } from '../../../_repositories/dialog-create-repository';
import { ToastRepository } from '../../../_repositories/toast-repository';
import { CustomerService } from '../../../_services/customer-service';
import { InputNumber } from 'primeng/inputnumber';
import { capitalizeWords } from '../../../_utils/global-methods';

@Component({
  selector: 'app-customer-create-dialog',
  imports: [Ripple, FloatLabel, FormsModule, InputIcon, IconField, ReactiveFormsModule, InputTextModule, Dialog, NgClass, NgxMaskDirective, InputNumber],
  templateUrl: './customer-create-dialog.html',
  styleUrl: './customer-create-dialog.scss',
})
export class CustomerCreateDialog implements OnInit, OnDestroy {
  private readonly customerService = inject(CustomerService);
  private readonly toastRep = inject(ToastRepository);
  private dialogCreateRep = inject(DialogCreateRepository);

  private subs = new Subscription();
  private readonly fb = inject(FormBuilder);
  form!: FormGroup;
  showLoader = false;
  isErrorFullName = false;

  visible: boolean = false;

  ngOnInit(): void {
    this.initializeForm();

    this.subs.add(
      this.dialogCreateRep.currentDialog$.subscribe(value => {
        if (value.format === 'customer-create') this.visible = value.isVisible;
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
      fullName: ['', Validators.required],
      phoneNumber: [''],
      orderQty: [0]
    });

    this.subs.add(
      this.form.get('fullName')?.valueChanges.subscribe(() => {
        this.form.get('fullName')?.setErrors(null);
        this.isErrorFullName = false;
      })
    );
  }

  private resetFormErrors() {
    this.form.get('fullName')?.setErrors(null);
    this.form.get('fullName')?.updateValueAndValidity();
    this.isErrorFullName = false;
  }

  onSubmit(): void
  {
    this.showLoader = true;
    this.resetFormErrors();

    if (this.form.valid)
    {
      const payload: CustomerCreateDTO =
      {
        fullName: capitalizeWords(this.form.value.fullName),
        phoneNumber: this.form.value.phoneNumber,
        orderQty: this.form.value.orderQty
      };

      this.subs.add(
        this.customerService.create(payload).pipe(
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
          error: (err) => {
            this.showLoader = false;
            const msg = err.error?.message;
            console.error(msg);
            this.isErrorFullName = true;
            this.form.get('fullName')?.setErrors({ invalid: true });
            }
        })
      );
    }
    else
    {
      this.showLoader = false;
      this.isErrorFullName = true;
      this.form.get('fullName')?.setErrors({ invalid: true });
    }
  }
}
