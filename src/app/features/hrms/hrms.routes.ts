import { Routes } from '@angular/router';
import { featureGuard } from '../../core/guards/feature.guard';
import { permissionGuard } from '../../core/guards/permission.guard';
import { FeatureCodes, ModuleCodes } from '../../core/constants/feature-codes';
import { PermissionCodes } from '../../core/constants/permission-codes';

const hrmsEmployee = {
  moduleCode: ModuleCodes.Hrms,
  featureCode: FeatureCodes.HrmsEmployee
};

const hrmsShift = {
  moduleCode: ModuleCodes.Hrms,
  featureCode: FeatureCodes.HrmsShift
};

const hrmsAttendance = {
  moduleCode: ModuleCodes.Hrms,
  featureCode: FeatureCodes.HrmsAttendance
};

const hrmsOvertime = {
  moduleCode: ModuleCodes.Hrms,
  featureCode: FeatureCodes.HrmsOvertime
};

const hrmsLeave = {
  moduleCode: ModuleCodes.Hrms,
  featureCode: FeatureCodes.HrmsLeave
};

const hrmsPayroll = {
  moduleCode: ModuleCodes.Hrms,
  featureCode: FeatureCodes.HrmsPayroll
};

/**
 * HRMS routes — feature + permission gated.
 */
export const HRMS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [featureGuard, permissionGuard],
    data: {
      moduleCode: ModuleCodes.Hrms,
      anyPermissions: [
        PermissionCodes.EmployeeView,
        PermissionCodes.AttendanceView,
        PermissionCodes.LeaveView,
        PermissionCodes.PayrollView,
        PermissionCodes.PayslipView
      ]
    },
    loadComponent: () =>
      import('./pages/hrms-hub/hrms-hub.component').then((m) => m.HrmsHubComponent)
  },

  // Departments
  {
    path: 'departments',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsEmployee, permission: PermissionCodes.EmployeeView },
    loadComponent: () =>
      import('./pages/departments/departments-list.component').then((m) => m.DepartmentListComponent)
  },
  {
    path: 'departments/new',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsEmployee, permission: PermissionCodes.EmployeeEdit },
    loadComponent: () =>
      import('./pages/departments/departments-form.component').then((m) => m.DepartmentFormComponent)
  },
  {
    path: 'departments/:id/edit',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsEmployee, permission: PermissionCodes.EmployeeEdit },
    loadComponent: () =>
      import('./pages/departments/departments-form.component').then((m) => m.DepartmentFormComponent)
  },

  // Designations
  {
    path: 'designations',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsEmployee, permission: PermissionCodes.EmployeeView },
    loadComponent: () =>
      import('./pages/designations/designations-list.component').then((m) => m.DesignationListComponent)
  },
  {
    path: 'designations/new',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsEmployee, permission: PermissionCodes.EmployeeEdit },
    loadComponent: () =>
      import('./pages/designations/designations-form.component').then((m) => m.DesignationFormComponent)
  },
  {
    path: 'designations/:id/edit',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsEmployee, permission: PermissionCodes.EmployeeEdit },
    loadComponent: () =>
      import('./pages/designations/designations-form.component').then((m) => m.DesignationFormComponent)
  },

  // Employee types
  {
    path: 'employee-types',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsEmployee, permission: PermissionCodes.EmployeeView },
    loadComponent: () =>
      import('./pages/employee-types/employee-types-list.component').then((m) => m.EmployeeTypeListComponent)
  },
  {
    path: 'employee-types/new',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsEmployee, permission: PermissionCodes.EmployeeEdit },
    loadComponent: () =>
      import('./pages/employee-types/employee-types-form.component').then((m) => m.EmployeeTypeFormComponent)
  },
  {
    path: 'employee-types/:id/edit',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsEmployee, permission: PermissionCodes.EmployeeEdit },
    loadComponent: () =>
      import('./pages/employee-types/employee-types-form.component').then((m) => m.EmployeeTypeFormComponent)
  },

  // Employees
  {
    path: 'employees',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsEmployee, permission: PermissionCodes.EmployeeView },
    loadComponent: () =>
      import('./pages/employees/employees-list.component').then((m) => m.EmployeeListComponent)
  },
  {
    path: 'employees/new',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsEmployee, permission: PermissionCodes.EmployeeAdd },
    loadComponent: () =>
      import('./pages/employees/employees-form.component').then((m) => m.EmployeeFormComponent)
  },
  {
    path: 'employees/:id/edit',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsEmployee, permission: PermissionCodes.EmployeeEdit },
    loadComponent: () =>
      import('./pages/employees/employees-form.component').then((m) => m.EmployeeFormComponent)
  },
  {
    path: 'employees/:id',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsEmployee, permission: PermissionCodes.EmployeeView },
    loadComponent: () =>
      import('./pages/employees/employees-detail.component').then((m) => m.EmployeeDetailComponent)
  },

  // Shifts
  {
    path: 'shifts',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsShift, permission: PermissionCodes.AttendanceView },
    loadComponent: () =>
      import('./pages/shifts/shifts-list.component').then((m) => m.ShiftListComponent)
  },
  {
    path: 'shifts/new',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsShift, permission: PermissionCodes.AttendanceEdit },
    loadComponent: () =>
      import('./pages/shifts/shifts-form.component').then((m) => m.ShiftFormComponent)
  },
  {
    path: 'shifts/:id/edit',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsShift, permission: PermissionCodes.AttendanceEdit },
    loadComponent: () =>
      import('./pages/shifts/shifts-form.component').then((m) => m.ShiftFormComponent)
  },

  // Holidays
  {
    path: 'holidays',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsAttendance, permission: PermissionCodes.AttendanceView },
    loadComponent: () =>
      import('./pages/holidays/holidays-list.component').then((m) => m.HolidayListComponent)
  },
  {
    path: 'holidays/new',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsAttendance, permission: PermissionCodes.AttendanceEdit },
    loadComponent: () =>
      import('./pages/holidays/holidays-form.component').then((m) => m.HolidayFormComponent)
  },
  {
    path: 'holidays/:id/edit',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsAttendance, permission: PermissionCodes.AttendanceEdit },
    loadComponent: () =>
      import('./pages/holidays/holidays-form.component').then((m) => m.HolidayFormComponent)
  },

  // Attendance
  {
    path: 'attendance',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsAttendance, permission: PermissionCodes.AttendanceView },
    loadComponent: () =>
      import('./pages/attendance/attendance-page.component').then((m) => m.AttendancePageComponent)
  },

  // Overtime
  {
    path: 'overtime',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsOvertime, permission: PermissionCodes.AttendanceView },
    loadComponent: () =>
      import('./pages/overtime/overtime-page.component').then((m) => m.OvertimePageComponent)
  },

  // Leave hub + children
  {
    path: 'leave',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsLeave, permission: PermissionCodes.LeaveView },
    loadComponent: () =>
      import('./pages/leave-hub/leave-hub.component').then((m) => m.LeaveHubComponent)
  },
  {
    path: 'leave/types',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsLeave, permission: PermissionCodes.LeaveView },
    loadComponent: () =>
      import('./pages/leave-types/leave-types-list.component').then((m) => m.LeaveTypeListComponent)
  },
  {
    path: 'leave/types/new',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsLeave, permission: PermissionCodes.LeaveApply },
    loadComponent: () =>
      import('./pages/leave-types/leave-types-form.component').then((m) => m.LeaveTypeFormComponent)
  },
  {
    path: 'leave/types/:id/edit',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsLeave, permission: PermissionCodes.LeaveApply },
    loadComponent: () =>
      import('./pages/leave-types/leave-types-form.component').then((m) => m.LeaveTypeFormComponent)
  },
  {
    path: 'leave/policies',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsLeave, permission: PermissionCodes.LeaveView },
    loadComponent: () =>
      import('./pages/leave-policies/leave-policies-list.component').then((m) => m.LeavePolicyListComponent)
  },
  {
    path: 'leave/policies/new',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsLeave, permission: PermissionCodes.LeaveApply },
    loadComponent: () =>
      import('./pages/leave-policies/leave-policies-form.component').then((m) => m.LeavePolicyFormComponent)
  },
  {
    path: 'leave/policies/:id/edit',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsLeave, permission: PermissionCodes.LeaveApply },
    loadComponent: () =>
      import('./pages/leave-policies/leave-policies-form.component').then((m) => m.LeavePolicyFormComponent)
  },
  {
    path: 'leave/requests',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsLeave, permission: PermissionCodes.LeaveView },
    loadComponent: () =>
      import('./pages/leave-requests/leave-requests-list.component').then((m) => m.LeaveRequestListComponent)
  },
  {
    path: 'leave/requests/new',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsLeave, permission: PermissionCodes.LeaveApply },
    loadComponent: () =>
      import('./pages/leave-requests/leave-requests-form.component').then((m) => m.LeaveRequestFormComponent)
  },
  {
    path: 'leave/requests/:id',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsLeave, permission: PermissionCodes.LeaveView },
    loadComponent: () =>
      import('./pages/leave-requests/leave-requests-detail.component').then((m) => m.LeaveRequestDetailComponent)
  },

  // Salary hub + children
  {
    path: 'salary',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsPayroll, permission: PermissionCodes.PayrollView },
    loadComponent: () =>
      import('./pages/salary-hub/salary-hub.component').then((m) => m.SalaryHubComponent)
  },
  {
    path: 'salary/components',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsPayroll, permission: PermissionCodes.PayrollView },
    loadComponent: () =>
      import('./pages/salary-components/salary-components-list.component').then(
        (m) => m.SalaryComponentListComponent
      )
  },
  {
    path: 'salary/components/new',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsPayroll, permission: PermissionCodes.PayrollProcess },
    loadComponent: () =>
      import('./pages/salary-components/salary-components-form.component').then(
        (m) => m.SalaryComponentFormComponent
      )
  },
  {
    path: 'salary/components/:id/edit',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsPayroll, permission: PermissionCodes.PayrollProcess },
    loadComponent: () =>
      import('./pages/salary-components/salary-components-form.component').then(
        (m) => m.SalaryComponentFormComponent
      )
  },
  {
    path: 'salary/structures',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsPayroll, permission: PermissionCodes.PayrollView },
    loadComponent: () =>
      import('./pages/salary-structures/salary-structures-list.component').then(
        (m) => m.SalaryStructureListComponent
      )
  },
  {
    path: 'salary/structures/new',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsPayroll, permission: PermissionCodes.PayrollProcess },
    loadComponent: () =>
      import('./pages/salary-structures/salary-structures-form.component').then(
        (m) => m.SalaryStructureFormComponent
      )
  },
  {
    path: 'salary/structures/:id/edit',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsPayroll, permission: PermissionCodes.PayrollProcess },
    loadComponent: () =>
      import('./pages/salary-structures/salary-structures-form.component').then(
        (m) => m.SalaryStructureFormComponent
      )
  },
  {
    path: 'salary/employee-salaries',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsPayroll, permission: PermissionCodes.PayrollView },
    loadComponent: () =>
      import('./pages/employee-salaries/employee-salaries-list.component').then(
        (m) => m.EmployeeSalaryListComponent
      )
  },
  {
    path: 'salary/employee-salaries/new',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsPayroll, permission: PermissionCodes.PayrollProcess },
    loadComponent: () =>
      import('./pages/employee-salaries/employee-salaries-form.component').then(
        (m) => m.EmployeeSalaryFormComponent
      )
  },

  // Payroll hub + children
  {
    path: 'payroll',
    canActivate: [featureGuard, permissionGuard],
    data: {
      ...hrmsPayroll,
      anyPermissions: [PermissionCodes.PayrollView, PermissionCodes.PayslipView]
    },
    loadComponent: () =>
      import('./pages/payroll-hub/payroll-hub.component').then((m) => m.PayrollHubComponent)
  },
  {
    path: 'payroll/runs',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsPayroll, permission: PermissionCodes.PayrollView },
    loadComponent: () =>
      import('./pages/payroll-runs/payroll-runs-list.component').then((m) => m.PayrollRunListComponent)
  },
  {
    path: 'payroll/runs/new',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsPayroll, permission: PermissionCodes.PayrollProcess },
    loadComponent: () =>
      import('./pages/payroll-runs/payroll-runs-form.component').then((m) => m.PayrollRunFormComponent)
  },
  {
    path: 'payroll/runs/:id',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsPayroll, permission: PermissionCodes.PayrollView },
    loadComponent: () =>
      import('./pages/payroll-runs/payroll-runs-detail.component').then((m) => m.PayrollRunDetailComponent)
  },
  {
    path: 'payroll/payslips',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsPayroll, permission: PermissionCodes.PayslipView },
    loadComponent: () =>
      import('./pages/payslips/payslips-list.component').then((m) => m.PayslipListComponent)
  },
  {
    path: 'payroll/payslips/:id',
    canActivate: [featureGuard, permissionGuard],
    data: { ...hrmsPayroll, permission: PermissionCodes.PayslipView },
    loadComponent: () =>
      import('./pages/payslips/payslips-detail.component').then((m) => m.PayslipDetailComponent)
  }
];
