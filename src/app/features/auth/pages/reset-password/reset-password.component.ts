import { Component, OnInit, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { APP_NAME } from '../../../../core/constants/app.constants';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly appName = APP_NAME;
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group(
    {
      token: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(200)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: passwordsMatch }
  );

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.form.controls.token.setValue(token);
    }
  }

  submit(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.errorMessage.set(
        this.form.hasError('passwordMismatch')
          ? 'New password and confirmation must match.'
          : 'Please correct the highlighted fields.'
      );
      return;
    }

    const value = this.form.getRawValue();
    this.submitting.set(true);

    this.auth
      .resetPassword({
        token: value.token.trim(),
        newPassword: value.newPassword
      })
      .subscribe({
        next: () => {
          this.successMessage.set('Password has been reset. You can sign in now.');
          this.submitting.set(false);
          setTimeout(() => void this.router.navigate(['/login']), 1200);
        },
        error: (error: unknown) => {
          this.errorMessage.set(extractApiErrorMessage(error, 'Unable to reset password.'));
          this.submitting.set(false);
        }
      });
  }
}
