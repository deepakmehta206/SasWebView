import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { HasPermissionDirective } from '../../../../core/permissions/has-permission.directive';
import { PermissionCodes } from '../../../../core/constants/permission-codes';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { HrmsApiService } from '../../services/hrms-api.service';
import { LeaveRequestDto } from '../../models/hrms.models';

@Component({
  selector: 'app-leave-requests-detail',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    HasPermissionDirective
  ],
  templateUrl: './leave-requests-detail.component.html',
  styleUrl: './leave-requests-detail.component.scss'
})
export class LeaveRequestDetailComponent implements OnInit {
  private readonly api = inject(HrmsApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly permissionCodes = PermissionCodes;
  readonly loading = signal(true);
  readonly acting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly row = signal<LeaveRequestDto | null>(null);

  readonly actionForm = this.fb.nonNullable.group({
    comments: [''],
    rejectedReason: [''],
    approvalLevel: [1]
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading.set(true);
    this.errorMessage.set(null);
    this.api.getLeaveRequest(id).subscribe({
      next: (data) => {
        this.row.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        this.row.set(null);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load leave request.'));
        this.loading.set(false);
      }
    });
  }

  private actionBody() {
    const value = this.actionForm.getRawValue();
    return {
      comments: value.comments.trim() || null,
      rejectedReason: value.rejectedReason.trim() || null,
      approvalLevel: Number(value.approvalLevel) || 1
    };
  }

  approve(): void {
    const current = this.row();
    if (!current || this.acting()) {
      return;
    }
    this.acting.set(true);
    this.errorMessage.set(null);
    this.api.approveLeave(current.leaveRequestId, this.actionBody()).subscribe({
      next: (data) => {
        this.row.set(data);
        this.acting.set(false);
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to approve leave.'));
        this.acting.set(false);
      }
    });
  }

  reject(): void {
    const current = this.row();
    if (!current || this.acting()) {
      return;
    }
    const body = this.actionBody();
    if (!body.rejectedReason) {
      this.errorMessage.set('Rejected reason is required.');
      return;
    }
    this.acting.set(true);
    this.errorMessage.set(null);
    this.api.rejectLeave(current.leaveRequestId, body).subscribe({
      next: (data) => {
        this.row.set(data);
        this.acting.set(false);
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to reject leave.'));
        this.acting.set(false);
      }
    });
  }

  cancel(): void {
    const current = this.row();
    if (!current || this.acting()) {
      return;
    }
    this.acting.set(true);
    this.errorMessage.set(null);
    this.api.cancelLeave(current.leaveRequestId, this.actionBody()).subscribe({
      next: (data) => {
        this.row.set(data);
        this.acting.set(false);
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to cancel leave.'));
        this.acting.set(false);
      }
    });
  }
}
