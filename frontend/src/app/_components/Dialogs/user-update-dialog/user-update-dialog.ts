import { NgClass } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { Subscription, take } from 'rxjs';
import { DialogUpdateRepository } from '../../../_repositories/dialog-update-repository';
import { ToastRepository } from '../../../_repositories/toast-repository';
import { UserService } from '../../../_services/user-service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RadioButton } from 'primeng/radiobutton';
import { UsersUpdateDTO } from '../../../_interfaces/users-update-dto';

@Component({
  selector: 'app-user-update-dialog',
  imports: [Ripple, FloatLabel, FormsModule, InputIcon, IconField, ReactiveFormsModule, InputTextModule, Dialog, NgClass, NgxMaskDirective, TranslateModule, RadioButton, TranslateModule],
  templateUrl: './user-update-dialog.html',
  styleUrl: './user-update-dialog.scss',
})
export class UserUpdateDialog implements OnInit, OnDestroy {
  private readonly userService = inject(UserService);
  private readonly toastRep = inject(ToastRepository);
  private dialogUpdateRep = inject(DialogUpdateRepository);
  private readonly translateService = inject(TranslateService);
  private readonly subs = new Subscription();
  private readonly fb = inject(FormBuilder);

  form!: FormGroup;
  showLoader = false;
  visible: boolean = false;

  isNewPassVisible = false;
  isConfirmPassVisible = false;
  isErrorUsername = false;
  isNewPassError = false;
  isConfirmPassError = false;

  newPassErrorMsg: string = '';
  confirmPassErrorMsg: string = '';

  id: string = '';

  ngOnInit(): void {
    this.initializeForm();

    this.subs.add(
      this.dialogUpdateRep.currentDialog$.subscribe(value => {
        if (value.format === 'user-update')
        {
          this.visible = value.isVisible;

          this.id = value.id;

          if (value !== null)
          {
            this.form.patchValue
            ({
              username: value.name,
              phoneNumber: value.phoneNumber,
              roles: value.roles,
              status: value.isActive
            });
          }
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
      username: ['', Validators.required],
      phoneNumber: [''],
      newPassword: ['', Validators.minLength(6)],
      confirmPassword: ['', Validators.minLength(6)],
      roles: [''],
      status: ['']
    });

    this.form.get('username')?.valueChanges.subscribe(() => {
      this.form.get('username')?.setErrors(null);
      this.isErrorUsername = false;
    });

    this.form.get('newPassword')?.valueChanges.subscribe(() => {
      this.form.get('newPassword')?.setErrors(null);
      this.isNewPassError = false;
    });

    this.form.get('confirmPassword')?.valueChanges.subscribe(() => {
      this.form.get('confirmPassword')?.setErrors(null);
      this.isConfirmPassError = false;
    });
  }

  private resetFormErrors() {
    ['username', 'newPassword', 'confirmPassword'].forEach(field => {
      this.form.get(field)?.setErrors(null);
      this.form.get(field)?.updateValueAndValidity();
    });

    this.isErrorUsername = false;
    this.isNewPassError = false;
    this.isConfirmPassError = false;
  }

  togglePassword(format: string): void {
    switch (format)
    {
      case 'new':
        this.isNewPassVisible = !this.isNewPassVisible;
        break;
      case 'confirm':
        this.isConfirmPassVisible = !this.isConfirmPassVisible;
        break;
    }
  }

  onSubmit(): void
  {
    this.showLoader = true;
    this.resetFormErrors();

    let newPassword = '';
    newPassword = this.form.value.newPassword;
    const confirmPassword = this.form.value.confirmPassword;

    if (newPassword !== null && newPassword.length > 0 && newPassword.length < 6) {
      this.showLoader = false;
      this.isNewPassError = true;
      this.form.get('newPassword')?.setErrors({ invalid: true });
      this.newPassErrorMsg = this.translateService.instant('DIALOGS.USERS.UPDATE.NEW_PASSWORD_TOO_SHORT');

      return;
    }

    if (confirmPassword !== null && confirmPassword.length > 0 && confirmPassword.length < 6) {
      this.showLoader = false;
      this.isConfirmPassError = true;
      this.form.get('confirmPassword')?.setErrors({ invalid: true });
      this.confirmPassErrorMsg = this.translateService.instant('DIALOGS.USERS.UPDATE.CONFIRM_PASSWORD_TOO_SHORT');

      return;
    }

    if (newPassword !== confirmPassword) {
      this.showLoader = false;
      ['newPassword', 'confirmPassword'].forEach(field => {
        this.form.get(field)?.setErrors({ invalid: true });
        this.isNewPassError = true;
        this.isConfirmPassError = true;
      });
      this.newPassErrorMsg = this.translateService.instant('DIALOGS.USERS.UPDATE.PASSWORDS_DO_NOT_MATCH');
      this.confirmPassErrorMsg = this.translateService.instant('DIALOGS.USERS.UPDATE.PASSWORDS_DO_NOT_MATCH');

      return;
    }

    if (this.form.valid)
    {
      const payload: UsersUpdateDTO =
      {
        id: this.id,
        username: this.form.value.username,
        phoneNumber: this.form.value.phoneNumber,
        roles: this.form.value.roles,
        isActive: this.form.value.status,
        password: newPassword
      }

      this.subs.add(
        this.userService.updateUser(payload).pipe(
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
            this.toastRep.onShowMsg('info', resp.message);
          },
          error: (err) => {
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
            this.toastRep.onShowMsg('error', errorMessage);

            this.isErrorUsername = true;
            this.form.get('username')?.setErrors({ invalid: true });
          }
        })
      );
    }
    else
    {
      this.showLoader = false;
      this.isErrorUsername = true;

      return;
    }
  }
}
