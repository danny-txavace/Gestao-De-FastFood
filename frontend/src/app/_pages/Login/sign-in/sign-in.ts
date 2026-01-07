import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FloatLabelModule } from "primeng/floatlabel"
import { InputTextModule } from 'primeng/inputtext';
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule, NgClass } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { Router } from '@angular/router';
import { Ripple } from 'primeng/ripple';
import { BreadCrumbRepository } from '../../../_repositories/bread-crumb-repository';
import { AuthService } from '../../../_services/auth-service';
import { AuthRequestDTO } from '../../../_interfaces/Auth/auth-request-dto';
import { Subscription, take } from 'rxjs';

@Component({
  selector: 'app-sign-in',
  imports: [FloatLabelModule, InputTextModule, InputIcon, IconField, TranslateModule, TooltipModule, NgClass, ReactiveFormsModule, MessageModule, CommonModule, Ripple],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss',
})
export class SignIn implements OnInit, OnDestroy {
  private readonly subs = new Subscription();
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly authService = inject(AuthService);
  private readonly bCrumbRep = inject(BreadCrumbRepository);
  private readonly cdr = inject(ChangeDetectorRef);

  form!: FormGroup;
  isPasswordVisible = false;
  showTwoFactorInput = false;
  showLoader = false;
  isUserError = false;
  isPassError = false;

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    if (this.subs) this.subs.unsubscribe();
  }

  private initializeForm()
  {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.form.get('username')?.valueChanges.subscribe(() => {
      this.form.get('username')?.setErrors(null);
      this.isUserError = false;
    });

    this.form.get('password')?.valueChanges.subscribe(() => {
      this.form.get('password')?.setErrors(null);
      this.isPassError = false;
    });
  }

  private resetFormErrors() {
    ['username', 'password'].forEach(field => {
      this.form.get(field)?.setErrors(null);
      this.form.get(field)?.updateValueAndValidity();
    });

    this.isUserError = false;
    this.isPassError = false;
  }

  get passwordTooltip(): string {
    return this.isPasswordVisible
      ? this.translate.instant('LOGIN.TOOLTIP.HIHIDE_PASSWORDDE')
      : this.translate.instant('LOGIN.TOOLTIP.SHOW_PASSWORD');
  }

  togglePassword(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  // Sign in Flow
  onSignIn(): void
  {
    this.showLoader = true;

    this.resetFormErrors();

    if (this.form.valid)
    {
      const payload: AuthRequestDTO = this.form.value;

      this.subs.add(
        this.authService.signIn(payload).pipe(
          take(1)
        ).subscribe({
          next: (value) => {
            Object.keys(this.form.controls).forEach(key => {
              this.form.get(key)?.setErrors(null);
            });
            this.onLoginSuccess(value.roles);
          },
          error: () => {
            this.showLoader = false;
            //const msg = err.error?.message || 'Error invalid credentials'
            //console.error(msg);
            this.isUserError = true;
            this.isPassError = true;
            this.form.get('username')?.setErrors({ invalid: true });
            this.form.get('password')?.setErrors({ invalid: true });
          }
        })
      );
    }
    else
    {
      this.showLoader = false;
      this.isUserError = true;
      this.isPassError = true;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async onLoginSuccess(roles: string): Promise<void> {
    let routerUrl = ''

    if (roles === 'admin')
    {
      routerUrl = '/v1-main_management/(management-outlet:v1-main_dashboard)'
    }
    else
    {
      routerUrl = '/v1-user_view'
    }

    await this.delay(1000);
    this.showLoader = false;
    this.cdr.detectChanges();
    this.setBreadCrumb();
    this.router.navigateByUrl(routerUrl, { replaceUrl: true });
  }

  private setBreadCrumb(): void {
    const label = this.translate.instant('MANAGEMENT_NAVBAR.DASHBOARD');
    this.bCrumbRep.setBreadCrumb([
      { icon: 'pi-objects-column', label }
    ]);
  }

  /*
  onSignInWithGoogle() {
    const client_id = '571991290425-o5m7eicp00ij26fqf9oe7g6d5gbbufi5.apps.googleusercontent.com';
    const redirect_uri = 'http://localhost:4200';
    const scope = 'openid email profile';
    const response_type = 'token'; // Implicit Flow
    const state = Math.random().toString(36).substring(2); // para segurança básica

    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=${response_type}&scope=${scope}&state=${state}`;

    window.location.href = url;
  }
  */
}
