import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { APP_NAME } from '../../../../core/constants/app.constants';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly appName = APP_NAME;
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showPassword = signal(false);

  readonly form = this.fb.nonNullable.group({
    tenantCode: ['', [Validators.required, Validators.maxLength(50)]],
    username: ['', [Validators.required, Validators.maxLength(100)]],
    password: ['', [Validators.required, Validators.maxLength(200)]]
  });

  submit(): void {
    this.errorMessage.set(null);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.errorMessage.set('Please fill in all required fields.');
      return;
    }

    const value = this.form.getRawValue();
    this.submitting.set(true);

    this.auth
      .login({
        tenantCode: value.tenantCode.trim(),
        username: value.username.trim(),
        password: value.password
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          const target = this.safeReturnUrl(returnUrl) ?? '/dashboard';
          void this.router.navigateByUrl(target);
        },
        error: (error: unknown) => {
          this.errorMessage.set(this.auth.mapLoginError(error) || extractApiErrorMessage(error, 'Login failed.'));
          this.submitting.set(false);
        }
      });
  }

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  private safeReturnUrl(returnUrl: string | null): string | null {
    if (!returnUrl || !returnUrl.startsWith('/') || returnUrl.startsWith('//')) {
      return null;
    }

    if (returnUrl.startsWith('/login') || returnUrl.startsWith('/forgot-password') || returnUrl.startsWith('/reset-password')) {
      return null;
    }

    return returnUrl;
  }
}
