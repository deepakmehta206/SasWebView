import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { ApiService } from '../services/api.service';
import { ApiResponse } from '../models/api-response.model';
import { EffectiveAccessDto, EffectiveModuleDto } from './feature-access.models';

/**
 * Holds tenant module/feature availability from GET /me/features.
 * Phase 4 only — does not use subscription entitlements (Phase 5).
 * UX visibility only; backend remains authoritative.
 */
@Injectable({ providedIn: 'root' })
export class FeatureAccessService {
  private readonly api = inject(ApiService);

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

    return this.api.get<ApiResponse<EffectiveAccessDto>>('/me/features').pipe(
      map((response) => response.data ?? { modules: [] }),
      tap((data) => {
        this.modulesSignal.set(data.modules ?? []);
        this.loadedSignal.set(true);
        this.loadingSignal.set(false);
      }),
      catchError((_error: unknown) => {
        this.modulesSignal.set([]);
        this.loadedSignal.set(true);
        this.loadingSignal.set(false);
        this.errorSignal.set('Unable to load effective features.');
        // Do not block login — return empty access.
        return of({ modules: [] } satisfies EffectiveAccessDto);
      })
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
}
