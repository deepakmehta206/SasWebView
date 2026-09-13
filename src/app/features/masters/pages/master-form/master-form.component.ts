import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { extractApiErrorMessage, extractApiErrors } from '../../../../core/utils/api-error.util';
import {
  MasterDefinition,
  MasterFieldDef,
  MasterSelectOption,
  getMasterDefinition
} from '../../models/master.definitions';
import { MasterApiService } from '../../services/master-api.service';

@Component({
  selector: 'app-master-form',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent
  ],
  templateUrl: './master-form.component.html',
  styleUrl: './master-form.component.scss'
})
export class MasterFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(MasterApiService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly fieldErrors = signal<string[]>([]);
  readonly definition = signal<MasterDefinition | null>(null);
  readonly isEdit = signal(false);
  readonly recordId = signal<number | null>(null);
  readonly selectOptions = signal<Record<string, MasterSelectOption[]>>({});

  form: FormGroup = this.fb.group({});

  ngOnInit(): void {
    const key = this.route.snapshot.data['masterKey'] as string;
    const def = getMasterDefinition(key);
    this.definition.set(def);
    if (!def) {
      this.errorMessage.set('Unknown master resource.');
      this.loading.set(false);
      return;
    }

    const idParam = this.route.snapshot.paramMap.get('id');
    const edit = !!idParam;
    this.isEdit.set(edit);
    if (edit) {
      this.recordId.set(Number(idParam));
    }

    this.buildForm(def, edit);
    this.loadOptionSources(def);

    if (edit) {
      this.api.getById<Record<string, unknown>>(def.endpoint, Number(idParam)).subscribe({
        next: (row) => {
          const patch: Record<string, unknown> = {};
          for (const field of this.visibleFields(def, true)) {
            patch[field.key] = row[field.key] ?? (field.type === 'checkbox' ? false : '');
          }
          this.form.patchValue(patch);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load record.'));
          this.loading.set(false);
        }
      });
    } else {
      this.loading.set(false);
    }
  }

  visibleFields(def: MasterDefinition, edit: boolean): MasterFieldDef[] {
    return def.fields.filter((field) => {
      if (field.createOnly && edit) {
        return false;
      }
      if (field.editOnly && !edit) {
        return false;
      }
      return true;
    });
  }

  submit(): void {
    const def = this.definition();
    if (!def || this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    this.fieldErrors.set([]);

    const raw = this.form.getRawValue() as Record<string, unknown>;
    const body: Record<string, unknown> = {};
    for (const field of this.visibleFields(def, this.isEdit())) {
      let value = raw[field.key];
      if (field.type === 'number' || field.type === 'select') {
        if (value === '' || value == null) {
          value = null;
        } else {
          value = Number(value);
        }
      }
      if (field.type === 'checkbox') {
        value = !!value;
      }
      if (typeof value === 'string') {
        value = value.trim();
      }
      body[field.key] = value;
    }

    const request$ = this.isEdit()
      ? this.api.update(def.endpoint, this.recordId()!, body)
      : this.api.create(def.endpoint, body);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigate(['/masters', def.key]);
      },
      error: (error: unknown) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to save.'));
        this.fieldErrors.set(
          extractApiErrors(error)
            .filter((item) => !!item.field)
            .map((item) => `${item.field}: ${item.message}`)
        );
        this.saving.set(false);
      }
    });
  }

  private buildForm(def: MasterDefinition, edit: boolean): void {
    const group: Record<string, FormControl> = {};
    for (const field of this.visibleFields(def, edit)) {
      const validators = field.required ? [Validators.required] : [];
      let initial: unknown = field.type === 'checkbox' ? false : '';
      if (field.key === 'decimalPlaces') {
        initial = 2;
      }
      if (field.key === 'conversionFactor') {
        initial = 1;
      }
      group[field.key] = this.fb.control(initial, validators);
    }
    this.form = this.fb.group(group);
  }

  private loadOptionSources(def: MasterDefinition): void {
    for (const field of def.fields) {
      if (!field.optionsFrom) {
        continue;
      }
      this.api.loadSelectOptions(field.optionsFrom).subscribe({
        next: (options) =>
          this.selectOptions.update((current) => ({ ...current, [field.key]: options })),
        error: () => undefined
      });
    }
  }
}
