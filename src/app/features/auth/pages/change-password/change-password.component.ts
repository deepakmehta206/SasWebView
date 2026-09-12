import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent, UiCardComponent],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(200)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: passwordsMatch }
  );

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
      .changePassword({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword
      })
      .subscribe({
        next: () => {
          this.successMessage.set('Password changed successfully.');
          this.form.reset();
          this.submitting.set(false);
        },
        error: (error: unknown) => {
          this.errorMessage.set(extractApiErrorMessage(error, 'Unable to change password.'));
          this.submitting.set(false);
        }
      });
  }
}
