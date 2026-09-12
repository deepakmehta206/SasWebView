import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { APP_NAME } from '../../../../core/constants/app.constants';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  readonly appName = APP_NAME;
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly developmentResetToken = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    tenantCode: ['', [Validators.required, Validators.maxLength(50)]],
    username: ['', [Validators.required, Validators.maxLength(100)]]
  });

  submit(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.developmentResetToken.set(null);
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.errorMessage.set('Please fill in all required fields.');
      return;
    }

    const value = this.form.getRawValue();
    this.submitting.set(true);

    this.auth
      .forgotPassword({
        tenantCode: value.tenantCode.trim(),
        username: value.username.trim()
      })
      .subscribe({
        next: (response) => {
          // Generic success â€” do not reveal whether the account exists.
          this.successMessage.set(
            'If the account exists, a password reset has been initiated.'
          );
          if (response.developmentResetToken) {
            this.developmentResetToken.set(response.developmentResetToken);
          }
          this.submitting.set(false);
        },
        error: (error: unknown) => {
          this.errorMessage.set(extractApiErrorMessage(error, 'Unable to start password reset.'));
          this.submitting.set(false);
        }
      });
  }
}
