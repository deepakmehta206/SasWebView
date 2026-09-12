/** Matches backend EffectiveAccessDto from GET /me/features (camelCase). */

export interface EffectiveFeatureDto {
  code: string;
  enabled: boolean;
}

export interface EffectiveModuleDto {
  code: string;
  name: string;
  enabled: boolean;
  features: EffectiveFeatureDto[];
}

export interface EffectiveAccessDto {
  modules: EffectiveModuleDto[];
}
