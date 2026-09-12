import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { TenantSettingDto } from '../../models/tenant-setting.model';
import { TenantContextService } from '../../services/tenant-context.service';
import { TenantSettingsService } from '../../services/tenant-settings.service';

@Component({
  selector: 'app-tenant-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent
  ],
  templateUrl: './tenant-settings.component.html',
  styleUrl: './tenant-settings.component.scss'
})
export class TenantSettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly settingsService = inject(TenantSettingsService);
  private readonly tenantContext = inject(TenantContextService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly settings = signal<TenantSettingDto[]>([]);
  readonly selectedKey = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly editForm = this.fb.nonNullable.group({
    settingKey: ['', [Validators.required, Validators.maxLength(100)]],
    settingValue: ['', [Validators.maxLength(500)]],
    dataType: ['String', [Validators.maxLength(30)]]
  });

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    const tenantId = this.tenantContext.tenantId();
    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.settingsService.getList(tenantId).subscribe({
      next: (response) => {
        const items = response.data ?? [];
        this.settings.set(items);
        this.loading.set(false);

        if (items.length > 0 && !this.selectedKey()) {
          this.selectSetting(items[0]);
        }
      },
      error: (error: unknown) => {
        this.settings.set([]);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load tenant settings.'));
        this.loading.set(false);
      }
    });
  }

  selectSetting(setting: TenantSettingDto): void {
    this.selectedKey.set(setting.settingKey);
    this.editForm.patchValue({
      settingKey: setting.settingKey,
      settingValue: setting.settingValue ?? '',
      dataType: setting.dataType ?? 'String'
    });
    this.editForm.controls.settingKey.disable();
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }

  startCreate(): void {
    this.selectedKey.set(null);
    this.editForm.reset({
      settingKey: '',
      settingValue: '',
      dataType: 'String'
    });
    this.editForm.controls.settingKey.enable();
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }

  save(): void {
    this.editForm.markAllAsTouched();
    if (this.editForm.invalid) {
      this.errorMessage.set('Please correct the highlighted fields.');
      return;
    }

    const raw = this.editForm.getRawValue();
    const key = raw.settingKey.trim();
    if (!key) {
      this.errorMessage.set('Setting key is required.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.settingsService
      .save(this.tenantContext.tenantId(), key, {
        settingValue: raw.settingValue.trim() || null,
        dataType: raw.dataType.trim() || null
      })
      .subscribe({
        next: (response) => {
          const saved = response.data;
          if (saved) {
            const next = [...this.settings()];
            const index = next.findIndex((item) => item.settingKey === saved.settingKey);
            if (index >= 0) {
              next[index] = saved;
            } else {
              next.push(saved);
            }
            this.settings.set(next);
            this.selectSetting(saved);
          }
          this.successMessage.set(response.message || 'Setting saved.');
          this.saving.set(false);
        },
        error: (error: unknown) => {
          this.errorMessage.set(extractApiErrorMessage(error, 'Unable to save setting.'));
          this.saving.set(false);
        }
      });
  }

  controlError(controlName: 'settingKey' | 'settingValue' | 'dataType'): string | null {
    const control = this.editForm.controls[controlName];
    if (!control.touched || !control.errors) {
      return null;
    }

    if (control.errors['required']) {
      return 'This field is required.';
    }
    if (control.errors['maxlength']) {
      return `Maximum length is ${control.errors['maxlength'].requiredLength} characters.`;
    }

    return 'Invalid value.';
  }
}
