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
import { ToastRepository } from '../../../_repositories/toast-repository';
import { UsersCreateDTO } from '../../../_interfaces/users-create-dto';
import { UserService } from '../../../_services/user-service';
import { DialogCreateRepository } from '../../../_repositories/dialog-create-repository';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-user-create-dialog',
  imports: [Ripple, FloatLabel, FormsModule, InputIcon, IconField, ReactiveFormsModule, InputTextModule, Dialog, NgClass, NgxMaskDirective, TranslateModule],
  templateUrl: './user-create-dialog.html',
  styleUrl: './user-create-dialog.scss',
})
export class UserCreateDialog implements OnInit, OnDestroy {
  private readonly userService = inject(UserService);
  private readonly toastRep = inject(ToastRepository);
  private dialogCreateRep = inject(DialogCreateRepository);
  private readonly subs = new Subscription();
  private readonly fb = inject(FormBuilder);

  form!: FormGroup;
  showLoader = false;
  isErrorUsername = false;
  
  visible: boolean = false;

  ngOnInit(): void {
    this.initializeForm();

    this.subs.add(
      this.dialogCreateRep.currentDialog$.subscribe(value => {
        if (value.format === 'user-create') this.visible = value.isVisible;
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
      username: ['', Validators.required],
      phoneNumber: ['']
    });

    this.form.get('username')?.valueChanges.subscribe(() => {
      this.form.get('username')?.setErrors(null);
      this.isErrorUsername = false;
    });
  }

  private resetFormErrors() {
    this.form.get('username')?.setErrors(null);
    this.form.get('username')?.updateValueAndValidity();
    this.isErrorUsername = false;
  }

  onSubmit(): void
  {
    this.showLoader = true;
    this.resetFormErrors();

    if (this.form.valid)
    {
      const payload: UsersCreateDTO = this.form.value;

      this.subs.add(
        this.userService.createUser(payload).pipe(
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
    }
  }
}
