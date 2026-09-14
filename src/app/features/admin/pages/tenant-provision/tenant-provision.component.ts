import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { extractApiErrorCode, extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { TENANT_TYPE_OPTIONS } from '../../../tenant/models/tenant.model';
import { MasterApiService } from '../../../masters/services/master-api.service';
import { ModuleService } from '../../../modules/services/module.service';
import { ModuleDto } from '../../../modules/models/module.model';
import { FeatureCatalogService } from '../../../features/services/feature-catalog.service';
import { FeatureDto } from '../../../features/models/feature.model';
import { PlanService } from '../../../subscription/services/plan.service';
import { PlanDto } from '../../../subscription/models/subscription.models';
import {
  BILLING_CYCLES,
  CORE_MODULE_CODE,
  PROVISION_STEPS,
  ProvisionTenantRequest
} from '../../models/admin.models';
import { AdminTenantsApiService } from '../../services/admin-tenants-api.service';
import {
  buildProvisionRequest,
  canSubmitProvision,
  ensureCoreModule,
  filterFeaturesForWizard,
  isCoreModule,
  isFeatureAllowedByPlan,
  pruneFeatureCodes
} from '../../utils/admin-provision.util';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-tenant-provision',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, PageHeaderComponent, UiCardComponent, LoadingIndicatorComponent],
  templateUrl: './tenant-provision.component.html',
  styleUrl: './tenant-provision.component.scss'
})
export class TenantProvisionComponent implements OnInit {
  private readonly api = inject(AdminTenantsApiService);
  private readonly plansApi = inject(PlanService);
  private readonly modulesApi = inject(ModuleService);
  private readonly featuresApi = inject(FeatureCatalogService);
  private readonly masterApi = inject(MasterApiService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly steps = PROVISION_STEPS;
  readonly tenantTypes = TENANT_TYPE_OPTIONS;
  readonly billingCycles = BILLING_CYCLES;
  readonly coreModuleCode = CORE_MODULE_CODE;
  readonly isCoreModule = isCoreModule;
  readonly isFeatureAllowedByPlan = isFeatureAllowedByPlan;

  readonly step = signal(0);
  readonly submitting = signal(false);
  readonly catalogLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly errorCode = signal<string | null>(null);

  readonly currencies = signal<Array<{ currencyCode: string; currencyName: string }>>([]);
  readonly plans = signal<PlanDto[]>([]);
  readonly modules = signal<ModuleDto[]>([]);
  readonly features = signal<FeatureDto[]>([]);
  readonly selectedModuleCodes = signal<string[]>([CORE_MODULE_CODE]);
  readonly selectedFeatureCodes = signal<string[]>([]);

  readonly tenantForm = this.fb.nonNullable.group({
    tenantCode: ['', [Validators.required, Validators.maxLength(50)]],
    tenantName: ['', [Validators.required, Validators.maxLength(200)]],
    tenantType: ['Generic', [Validators.required, Validators.maxLength(50)]],
    email: ['', [Validators.email, Validators.maxLength(256)]],
    phone: ['', [Validators.maxLength(50)]],
    address: ['', [Validators.maxLength(500)]],
    timeZone: ['', [Validators.maxLength(100)]],
    currencyCode: ['', [Validators.maxLength(10)]]
  });

  readonly adminForm = this.fb.nonNullable.group(
    {
      username: ['', [Validators.required, Validators.maxLength(100)]],
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.maxLength(100)]],
      email: ['', [Validators.email, Validators.maxLength(256)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(200)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: passwordsMatch }
  );

  readonly branchForm = this.fb.nonNullable.group({
    branchCode: ['', [Validators.required, Validators.maxLength(50)]],
    branchName: ['', [Validators.required, Validators.maxLength(200)]],
    address: ['', [Validators.maxLength(500)]],
    phone: ['', [Validators.maxLength(50)]],
    email: ['', [Validators.email, Validators.maxLength(256)]]
  });

  readonly subscriptionForm = this.fb.nonNullable.group({
    planId: [0, [Validators.required, Validators.min(1)]],
    billingCycle: ['MONTHLY', [Validators.required]]
  });

  readonly selectedPlan = computed(() => {
    const planId = this.subscriptionForm.controls.planId.value;
    return this.plans().find((plan) => plan.planId === planId) ?? null;
  });

  readonly visibleFeatures = computed(() =>
    filterFeaturesForWizard(this.features(), this.selectedModuleCodes())
  );

  readonly review = computed(() => this.buildRequest());

  ngOnInit(): void {
    this.loadCatalog();
    this.subscriptionForm.controls.planId.valueChanges.subscribe(() => {
      this.selectedFeatureCodes.set(
        pruneFeatureCodes(this.selectedFeatureCodes(), this.visibleFeatures(), this.selectedPlan()?.features)
      );
    });
  }

  next(): void {
    if (!this.validateCurrentStep()) {
      return;
    }
    this.errorMessage.set(null);
    this.step.update((value) => Math.min(value + 1, this.steps.length - 1));
  }

  back(): void {
    this.errorMessage.set(null);
    this.step.update((value) => Math.max(value - 1, 0));
  }

  goTo(index: number): void {
    if (index < this.step()) {
      this.step.set(index);
    }
  }

  toggleModule(moduleCode: string, checked: boolean): void {
    if (isCoreModule(moduleCode)) {
      return;
    }
    const next = new Set(this.selectedModuleCodes());
    if (checked) {
      next.add(moduleCode);
    } else {
      next.delete(moduleCode);
    }
    this.selectedModuleCodes.set(ensureCoreModule([...next]));
    this.selectedFeatureCodes.set(
      pruneFeatureCodes(this.selectedFeatureCodes(), this.visibleFeatures(), this.selectedPlan()?.features)
    );
  }

  toggleFeature(featureCode: string, checked: boolean): void {
    if (!isFeatureAllowedByPlan(featureCode, this.selectedPlan()?.features)) {
      return;
    }
    const next = new Set(this.selectedFeatureCodes());
    if (checked) {
      next.add(featureCode);
    } else {
      next.delete(featureCode);
    }
    this.selectedFeatureCodes.set([...next]);
  }

  isModuleSelected(moduleCode: string): boolean {
    return this.selectedModuleCodes().includes(moduleCode);
  }

  isFeatureSelected(featureCode: string): boolean {
    return this.selectedFeatureCodes().includes(featureCode);
  }

  provision(): void {
    if (!this.validateCurrentStep() || !canSubmitProvision(this.submitting())) {
      return;
    }

    const request = this.buildRequest();
    this.submitting.set(true);
    this.errorMessage.set(null);
    this.errorCode.set(null);

    this.api.provisionTenant(request).subscribe({
      next: (result) => {
        this.submitting.set(false);
        void this.router.navigate(['/admin/tenants', result.tenantId]);
      },
      error: (error: unknown) => {
        this.errorCode.set(extractApiErrorCode(error));
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to provision tenant.'));
        this.submitting.set(false);
      }
    });
  }

  controlError(form: 'tenant' | 'admin' | 'branch' | 'subscription', name: string): string | null {
    const group: AbstractControl =
      form === 'tenant'
        ? this.tenantForm
        : form === 'admin'
          ? this.adminForm
          : form === 'branch'
            ? this.branchForm
            : this.subscriptionForm;
    const control = group.get(name);
    if (!control?.touched || !control.errors) {
      return null;
    }
    if (control.errors['required'] || control.errors['min']) {
      return 'This field is required.';
    }
    if (control.errors['email']) {
      return 'Enter a valid email address.';
    }
    if (control.errors['minlength']) {
      return `Minimum length is ${control.errors['minlength'].requiredLength} characters.`;
    }
    if (control.errors['maxlength']) {
      return `Maximum length is ${control.errors['maxlength'].requiredLength} characters.`;
    }
    return 'Invalid value.';
  }

  adminPasswordMismatch(): boolean {
    return this.adminForm.touched && this.adminForm.hasError('passwordMismatch');
  }

  private validateCurrentStep(): boolean {
    const index = this.step();
    if (index === 0) {
      this.tenantForm.markAllAsTouched();
      if (this.tenantForm.invalid) {
        this.errorMessage.set('Please complete the tenant details.');
        return false;
      }
    }
    if (index === 1) {
      this.adminForm.markAllAsTouched();
      if (this.adminForm.invalid) {
        this.errorMessage.set(
          this.adminForm.hasError('passwordMismatch')
            ? 'New password and confirmation must match.'
            : 'Please complete the tenant admin details.'
        );
        return false;
      }
    }
    if (index === 2) {
      this.branchForm.markAllAsTouched();
      if (this.branchForm.invalid) {
        this.errorMessage.set('Please complete the initial branch details.');
        return false;
      }
    }
    if (index === 3) {
      this.subscriptionForm.markAllAsTouched();
      if (this.subscriptionForm.invalid) {
        this.errorMessage.set('Please select a subscription plan.');
        return false;
      }
    }
    return true;
  }

  private buildRequest(): ProvisionTenantRequest {
    return buildProvisionRequest({
      tenant: this.tenantForm.getRawValue(),
      admin: this.adminForm.getRawValue(),
      branch: this.branchForm.getRawValue(),
      planId: this.subscriptionForm.controls.planId.value,
      billingCycle: this.subscriptionForm.controls.billingCycle.value,
      moduleCodes: this.selectedModuleCodes(),
      featureCodes: this.selectedFeatureCodes()
    });
  }

  private loadCatalog(): void {
    this.catalogLoading.set(true);

    this.masterApi
      .getList<{ currencyCode: string; currencyName: string }>('/currencies', { isActive: true })
      .subscribe({
        next: (data) => this.currencies.set(data),
        error: () => this.currencies.set([])
      });

    this.plansApi.getList(false).subscribe({
      next: (data) => this.plans.set(data.filter((plan) => plan.isActive)),
      error: () => this.plans.set([])
    });

    this.modulesApi.getList(false).subscribe({
      next: (response) => {
        const rows = (response.data ?? []).filter((module) => module.isActive);
        this.modules.set(rows);
        const core = rows.find((module) => isCoreModule(module.moduleCode));
        if (core) {
          this.selectedModuleCodes.set(ensureCoreModule(this.selectedModuleCodes()));
        }
      },
      error: () => this.modules.set([])
    });

    this.featuresApi.getList(false).subscribe({
      next: (response) => {
        this.features.set(response.data ?? []);
        this.catalogLoading.set(false);
      },
      error: () => {
        this.features.set([]);
        this.catalogLoading.set(false);
      }
    });
  }
}
