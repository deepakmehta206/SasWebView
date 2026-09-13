/**
 * Full Phase 6 HRMS page + routes generator.
 * Run from SaaSPlatform.Web: node scripts/gen-hrms-full.mjs
 */
import fs from 'fs';
import path from 'path';

const root = path.resolve('src/app/features/hrms');
function write(rel, content) {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content.replace(/\r?\n/g, '\n'), 'utf8');
}

const scss = `.page{display:flex;flex-direction:column;gap:1rem}
.form-actions{display:flex;flex-wrap:wrap;gap:.75rem;margin-top:.5rem}
.filters{display:grid;gap:.85rem;align-items:end}
@media(min-width:700px){.filters{grid-template-columns:repeat(auto-fill,minmax(10rem,1fr))}}
.detail-list{display:grid;gap:.75rem;margin:0}
.detail-list>div{display:grid;gap:.15rem}
.detail-list dt{font-size:.8rem;color:var(--color-text-muted);font-weight:600}
.detail-list dd{margin:0}
`;

const imports = `import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { HasPermissionDirective } from '../../../../core/permissions/has-permission.directive';
import { PermissionCodes } from '../../../../core/constants/permission-codes';
import { PermissionService } from '../../../../core/permissions/permission.service';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { BranchContextService } from '../../../branch/services/branch-context.service';
import { HrmsApiService } from '../../services/hrms-api.service';
import { MasterApiService } from '../../../masters/services/master-api.service';
`;

function listFormSimple({ folder, classBase, title, id, code, name, list, get, create, update, basePath }) {
  write(`pages/${folder}/${folder}-list.component.scss`, scss);
  write(
    `pages/${folder}/${folder}-list.component.ts`,
    `${imports}
@Component({
  selector: 'app-${folder}-list',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, UiCardComponent, LoadingIndicatorComponent, EmptyStateComponent, HasPermissionDirective],
  templateUrl: './${folder}-list.component.html',
  styleUrl: './${folder}-list.component.scss'
})
export class ${classBase}ListComponent implements OnInit {
  private readonly api = inject(HrmsApiService);
  readonly permissionCodes = PermissionCodes;
  readonly loading = signal(true);
  readonly rows = signal<any[]>([]);
  readonly errorMessage = signal<string | null>(null);
  ngOnInit(){ this.load(); }
  load(){
    this.loading.set(true); this.errorMessage.set(null);
    this.api.${list}().subscribe({
      next: d => { this.rows.set(d); this.loading.set(false); },
      error: e => { this.rows.set([]); this.errorMessage.set(extractApiErrorMessage(e,'Unable to load.')); this.loading.set(false); }
    });
  }
}
`
  );
  write(
    `pages/${folder}/${folder}-list.component.html`,
    `<section class="page">
  <app-page-header title="${title}">
    <ng-container *appHasPermission="permissionCodes.EmployeeEdit">
      <a class="btn btn--primary" routerLink="new">Add</a>
    </ng-container>
  </app-page-header>
  <app-ui-card title="${title}">
    @if (errorMessage()) { <div class="alert alert--danger">{{ errorMessage() }}</div> }
    @if (loading()) { <app-loading-indicator label="Loading…" /> }
    @else if (!rows().length) {
      <app-empty-state title="No records" message="Nothing found.">
        <button type="button" class="btn btn--secondary" (click)="load()">Retry</button>
      </app-empty-state>
    } @else {
      <div class="table-wrap"><table class="data-table">
        <thead><tr><th>Code</th><th>Name</th><th>Active</th><th></th></tr></thead>
        <tbody>
          @for (row of rows(); track row.${id}) {
            <tr>
              <td>{{ row.${code} }}</td><td>{{ row.${name} }}</td><td>{{ row.isActive ? 'Yes' : 'No' }}</td>
              <td><ng-container *appHasPermission="permissionCodes.EmployeeEdit">
                <a class="btn btn--secondary" [routerLink]="[row.${id}, 'edit']">Edit</a>
              </ng-container></td>
            </tr>
          }
        </tbody>
      </table></div>
    }
  </app-ui-card>
</section>`
  );

  write(`pages/${folder}/${folder}-form.component.scss`, scss);
  write(
    `pages/${folder}/${folder}-form.component.ts`,
    `${imports}
@Component({
  selector: 'app-${folder}-form',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, PageHeaderComponent, UiCardComponent, LoadingIndicatorComponent],
  templateUrl: './${folder}-form.component.html',
  styleUrl: './${folder}-form.component.scss'
})
export class ${classBase}FormComponent implements OnInit {
  private readonly api = inject(HrmsApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isEdit = signal(false);
  private id: number | null = null;
  readonly form = this.fb.nonNullable.group({
    ${code}: ['', Validators.required],
    ${name}: ['', Validators.required],
    description: [''],
    isActive: [true]
  });
  ngOnInit(){
    const raw = this.route.snapshot.paramMap.get('id');
    if (!raw) return;
    this.isEdit.set(true); this.id = Number(raw); this.loading.set(true);
    this.api.${get}(this.id).subscribe({
      next: (row: any) => {
        this.form.patchValue({ ${code}: row.${code}, ${name}: row.${name}, description: row.description ?? '', isActive: row.isActive });
        this.loading.set(false);
      },
      error: e => { this.errorMessage.set(extractApiErrorMessage(e,'Unable to load.')); this.loading.set(false); }
    });
  }
  submit(){
    if (this.form.invalid || this.saving()) { this.form.markAllAsTouched(); return; }
    this.saving.set(true); this.errorMessage.set(null);
    const v = this.form.getRawValue();
    const body: any = { ${code}: v.${code}.trim(), ${name}: v.${name}.trim(), description: v.description.trim() || null };
    if (this.isEdit()) body.isActive = v.isActive;
    const req$ = this.isEdit() ? this.api.${update}(this.id!, body) : this.api.${create}(body);
    req$.subscribe({
      next: () => { this.saving.set(false); void this.router.navigate(['${basePath}']); },
      error: e => { this.errorMessage.set(extractApiErrorMessage(e,'Unable to save.')); this.saving.set(false); }
    });
  }
}
`
  );
  write(
    `pages/${folder}/${folder}-form.component.html`,
    `<section class="page">
  <app-page-header [title]="(isEdit() ? 'Edit' : 'Add') + ' item'">
    <a class="btn btn--secondary" routerLink="${basePath}">Back</a>
  </app-page-header>
  <app-ui-card title="Details">
    @if (errorMessage()) { <div class="alert alert--danger">{{ errorMessage() }}</div> }
    @if (loading()) { <app-loading-indicator label="Loading…" /> } @else {
      <form class="form-grid" [formGroup]="form" (ngSubmit)="submit()">
        <label class="form-field"><span class="form-label">Code</span><input class="form-input" formControlName="${code}" /></label>
        <label class="form-field"><span class="form-label">Name</span><input class="form-input" formControlName="${name}" /></label>
        <label class="form-field"><span class="form-label">Description</span><input class="form-input" formControlName="description" /></label>
        @if (isEdit()) { <label class="form-check"><input type="checkbox" formControlName="isActive" /><span>Active</span></label> }
        <div class="form-actions"><button class="btn btn--primary" type="submit" [disabled]="saving()">{{ saving() ? 'Saving…' : 'Save' }}</button></div>
      </form>
    }
  </app-ui-card>
</section>`
  );
}

listFormSimple({
  folder: 'designations',
  classBase: 'Designation',
  title: 'Designations',
  id: 'designationId',
  code: 'designationCode',
  name: 'designationName',
  list: 'getDesignations',
  get: 'getDesignation',
  create: 'createDesignation',
  update: 'updateDesignation',
  basePath: '/hrms/designations'
});

listFormSimple({
  folder: 'employee-types',
  classBase: 'EmployeeType',
  title: 'Employee types',
  id: 'employeeTypeId',
  code: 'employeeTypeCode',
  name: 'employeeTypeName',
  list: 'getEmployeeTypes',
  get: 'getEmployeeType',
  create: 'createEmployeeType',
  update: 'updateEmployeeType',
  basePath: '/hrms/employee-types'
});

console.log('Generated simple masters');
