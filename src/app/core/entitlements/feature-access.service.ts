import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { ApiService } from '../services/api.service';
import { ApiResponse } from '../models/api-response.model';
import { EffectiveAccessDto, EffectiveModuleDto } from './feature-access.models';
import { EntitlementService } from './entitlement.service';
import {
  EffectiveEntitlementModuleDto,
  EffectiveEntitlementsDto
} from './entitlement.models';

/**
 * Holds tenant module/feature availability for nav/UX gating.
 * Primary source: GET /me/entitlements (available → enabled).
 * Fallback: GET /me/features when entitlements fail.
 * Public API and signal shape are preserved from Phase 4.
 * UX visibility only; backend remains authoritative.
 */
@Injectable({ providedIn: 'root' })
export class FeatureAccessService {
  private readonly api = inject(ApiService);
  private readonly entitlements = inject(EntitlementService);

  private readonly modulesSignal = signal<EffectiveModuleDto[]>([]);
  private readonly loadedSignal = signal(false);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly modules = this.modulesSignal.asReadonly();
  readonly loaded = this.loadedSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly enabledModuleCodes = computed(() => {
    const codes = new Set<string>();
    for (const module of this.modulesSignal()) {
      if (module.enabled) {
        codes.add(module.code);
      }
    }
    return codes;
  });

  readonly enabledFeatureCodes = computed(() => {
    const codes = new Set<string>();
    for (const module of this.modulesSignal()) {
      if (!module.enabled) {
        continue;
      }
      for (const feature of module.features ?? []) {
        if (feature.enabled) {
          codes.add(feature.code);
        }
      }
    }
    return codes;
  });

  load(): Observable<EffectiveAccessDto> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.entitlements.load().pipe(
      map((data) => mapEntitlementsToAccess(data)),
      tap((access) => this.applyAccess(access)),
      catchError(() => this.loadFeaturesFallback())
    );
  }

  reload(): Observable<EffectiveAccessDto> {
    return this.load();
  }

  clear(): void {
    this.modulesSignal.set([]);
    this.loadedSignal.set(false);
    this.loadingSignal.set(false);
    this.errorSignal.set(null);
    this.entitlements.clear();
  }

  isModuleEnabled(moduleCode: string): boolean {
    if (!moduleCode) {
      return true;
    }
    return this.enabledModuleCodes().has(moduleCode);
  }

  isFeatureEnabled(featureCode: string): boolean {
    if (!featureCode) {
      return true;
    }
    return this.enabledFeatureCodes().has(featureCode);
  }

  getEnabledModules(): EffectiveModuleDto[] {
    return this.modulesSignal().filter((module) => module.enabled);
  }

  getEnabledFeatures(): string[] {
    return [...this.enabledFeatureCodes()];
  }

  private loadFeaturesFallback(): Observable<EffectiveAccessDto> {
    this.entitlements.clearAfterFallback();

    return this.api.get<ApiResponse<EffectiveAccessDto>>('/me/features').pipe(
      map((response) => response.data ?? { modules: [] }),
      tap((data) => this.applyAccess(data)),
      catchError((_error: unknown) => {
        this.modulesSignal.set([]);
        this.loadedSignal.set(true);
        this.loadingSignal.set(false);
        this.errorSignal.set('Unable to load effective features.');
        return of({ modules: [] } satisfies EffectiveAccessDto);
      })
    );
  }

  private applyAccess(data: EffectiveAccessDto): void {
    this.modulesSignal.set(data.modules ?? []);
    this.loadedSignal.set(true);
    this.loadingSignal.set(false);
    this.errorSignal.set(null);
  }
}

function mapEntitlementsToAccess(data: EffectiveEntitlementsDto): EffectiveAccessDto {
  return {
    modules: (data.modules ?? []).map((module) => mapModule(module))
  };
}

function mapModule(module: EffectiveEntitlementModuleDto): EffectiveModuleDto {
  return {
    code: module.code,
    name: module.name,
    enabled: module.available,
    features: (module.features ?? []).map((feature) => ({
      code: feature.code,
      enabled: feature.available
    }))
  };
}
