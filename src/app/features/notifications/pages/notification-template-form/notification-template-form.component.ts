import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { AuthStateService } from '../../../../core/auth/auth-state.service';
import { PermissionCodes } from '../../../../core/constants/permission-codes';
import { PermissionService } from '../../../../core/permissions/permission.service';
import { NotificationChannels, NotificationTemplateDto } from '../../../../core/notifications/notification.models';
import { NotificationTemplateService } from '../../../../core/notifications/notification-template.service';
import { formatChannelLabel } from '../../../../core/notifications/notification-display.util';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';

@Component({
  selector: 'app-notification-template-form',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, PageHeaderComponent, UiCardComponent, LoadingIndicatorComponent],
  templateUrl: './notification-template-form.component.html',
  styleUrl: './notification-template-form.component.scss'
})
export class NotificationTemplateFormComponent implements OnInit {
  private readonly api = inject(NotificationTemplateService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly permissions = inject(PermissionService);
  readonly authState = inject(AuthStateService);

  readonly permissionCodes = PermissionCodes;
  readonly channels = [
    NotificationChannels.InApp,
    NotificationChannels.Email,
    NotificationChannels.Sms,
    NotificationChannels.WhatsApp
  ];
  readonly formatChannel = formatChannelLabel;

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly templateId = signal<number | null>(null);
  readonly existing = signal<NotificationTemplateDto | null>(null);

  readonly isCreate = computed(() => this.templateId() == null);
  readonly isPlatformAdmin = computed(() => this.authState.currentUser()?.isPlatformAdmin === true);
  readonly isSystemTemplate = computed(() => this.existing()?.tenantId == null);
  readonly canMutate = computed(() => {
    if (!this.permissions.hasPermission(PermissionCodes.NotificationTemplateManage)) {
      return false;
    }
    if (this.isCreate()) {
      return true;
    }
    return !this.isSystemTemplate() || this.isPlatformAdmin();
  });

  readonly form = this.fb.nonNullable.group({
    templateCode: ['', [Validators.required, Validators.maxLength(100)]],
    channel: ['IN_APP' as string, Validators.required],
    language: ['en', [Validators.required, Validators.maxLength(10)]],
    subject: [''],
    body: ['', Validators.required],
    providerTemplateName: [''],
    isActive: [true],
    isSystemTemplate: [false]
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('templateId');
    if (!idParam) {
      this.loading.set(false);
      if (!this.canMutate()) {
        this.form.disable();
      }
      return;
    }

    const id = Number(idParam);
    if (!Number.isFinite(id) || id <= 0) {
      this.errorMessage.set('Invalid template.');
      this.loading.set(false);
      return;
    }

    this.templateId.set(id);
    this.api.getById(id).subscribe({
      next: (data) => {
        this.existing.set(data);
        this.form.patchValue({
          templateCode: data.templateCode,
          channel: data.channel,
          language: data.language,
          subject: data.subject ?? '',
          body: data.body,
          providerTemplateName: data.providerTemplateName ?? '',
          isActive: data.isActive,
          isSystemTemplate: data.tenantId == null
        });
        if (!this.canMutate()) {
          this.form.disable();
        }
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load template.'));
        this.loading.set(false);
      }
    });
  }

  submit(): void {
    if (!this.canMutate() || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    const value = this.form.getRawValue();

    if (this.isCreate()) {
      this.api
        .create({
          templateCode: value.templateCode.trim(),
          channel: value.channel,
          language: value.language.trim() || 'en',
          subject: value.subject.trim() || null,
          body: value.body,
          providerTemplateName: value.providerTemplateName.trim() || null,
          isSystemTemplate: this.isPlatformAdmin() ? value.isSystemTemplate : false
        })
        .subscribe({
          next: () => {
            this.saving.set(false);
            void this.router.navigate(['/settings/notification-templates']);
          },
          error: (error: unknown) => {
            this.saving.set(false);
            this.errorMessage.set(extractApiErrorMessage(error, 'Unable to create template.'));
          }
        });
      return;
    }

    const id = this.templateId();
    if (id == null) {
      return;
    }

    this.api
      .update(id, {
        templateCode: value.templateCode.trim(),
        channel: value.channel,
        language: value.language.trim() || 'en',
        subject: value.subject.trim() || null,
        body: value.body,
        providerTemplateName: value.providerTemplateName.trim() || null,
        isActive: value.isActive
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          void this.router.navigate(['/settings/notification-templates']);
        },
        error: (error: unknown) => {
          this.saving.set(false);
          this.errorMessage.set(extractApiErrorMessage(error, 'Unable to update template.'));
        }
      });
  }
}
