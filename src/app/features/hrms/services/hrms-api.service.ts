import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  AttendanceDto,
  AttendanceSummaryDto,
  CreateEmployeeDocumentRequest,
  CreateEmployeeRequest,
  DepartmentDto,
  DesignationDto,
  EmployeeDocumentDto,
  EmployeeDto,
  EmployeeProfileDto,
  EmployeeSalaryDto,
  EmployeeTypeDto,
  HolidayDto,
  LeaveActionRequest,
  LeavePolicyDto,
  LeaveRequestDto,
  LeaveTypeDto,
  OvertimeDto,
  PayrollRunDto,
  PayslipDto,
  SalaryComponentDto,
  SalaryStructureDto,
  SaveEmployeeProfileRequest,
  SensitiveEmployeeProfileDto,
  SetStatusRequest,
  ShiftDto,
  UpdateEmployeeRequest
} from '../models/hrms.models';

type Params = Record<string, string | number | boolean>;

@Injectable({ providedIn: 'root' })
export class HrmsApiService {
  private readonly api = inject(ApiService);

  private list<T>(path: string, params?: Params): Observable<T[]> {
    return this.api
      .get<ApiResponse<T[]>>(path, params ? { params } : undefined)
      .pipe(map((r) => r.data ?? []));
  }

  private one<T>(path: string, params?: Params): Observable<T> {
    return this.api
      .get<ApiResponse<T>>(path, params ? { params } : undefined)
      .pipe(map((r) => r.data as T));
  }

  private post<T>(path: string, body: unknown): Observable<T> {
    return this.api.post<ApiResponse<T>>(path, body).pipe(map((r) => r.data as T));
  }

  private put<T>(path: string, body: unknown): Observable<T> {
    return this.api.put<ApiResponse<T>>(path, body).pipe(map((r) => r.data as T));
  }

  private patch<T>(path: string, body: unknown): Observable<T> {
    return this.api.patch<ApiResponse<T>>(path, body).pipe(map((r) => r.data as T));
  }

  // Org
  getDepartments(params?: Params) {
    return this.list<DepartmentDto>('/departments', params);
  }
  getDepartment(id: number) {
    return this.one<DepartmentDto>(`/departments/${id}`);
  }
  createDepartment(body: unknown) {
    return this.post<DepartmentDto>('/departments', body);
  }
  updateDepartment(id: number, body: unknown) {
    return this.put<DepartmentDto>(`/departments/${id}`, body);
  }
  setDepartmentStatus(id: number, isActive: boolean) {
    return this.patch<null>(`/departments/${id}/status`, { isActive });
  }

  getDesignations(params?: Params) {
    return this.list<DesignationDto>('/designations', params);
  }
  getDesignation(id: number) {
    return this.one<DesignationDto>(`/designations/${id}`);
  }
  createDesignation(body: unknown) {
    return this.post<DesignationDto>('/designations', body);
  }
  updateDesignation(id: number, body: unknown) {
    return this.put<DesignationDto>(`/designations/${id}`, body);
  }

  getEmployeeTypes(params?: Params) {
    return this.list<EmployeeTypeDto>('/employee-types', params);
  }
  getEmployeeType(id: number) {
    return this.one<EmployeeTypeDto>(`/employee-types/${id}`);
  }
  createEmployeeType(body: unknown) {
    return this.post<EmployeeTypeDto>('/employee-types', body);
  }
  updateEmployeeType(id: number, body: unknown) {
    return this.put<EmployeeTypeDto>(`/employee-types/${id}`, body);
  }

  // Employees
  getEmployees(params?: Params) {
    return this.list<EmployeeDto>('/employees', params);
  }
  getEmployee(id: number) {
    return this.one<EmployeeDto>(`/employees/${id}`);
  }
  createEmployee(body: CreateEmployeeRequest) {
    return this.post<EmployeeDto>('/employees', body);
  }
  updateEmployee(id: number, body: UpdateEmployeeRequest) {
    return this.put<EmployeeDto>(`/employees/${id}`, body);
  }
  setEmployeeStatus(id: number, body: SetStatusRequest) {
    return this.patch<null>(`/employees/${id}/status`, body);
  }
  getEmployeeProfile(id: number) {
    return this.one<EmployeeProfileDto>(`/employees/${id}/profile`);
  }
  getSensitiveProfile(id: number) {
    return this.one<SensitiveEmployeeProfileDto>(`/employees/${id}/profile/sensitive`);
  }
  saveEmployeeProfile(id: number, body: SaveEmployeeProfileRequest) {
    return this.put<EmployeeProfileDto>(`/employees/${id}/profile`, body);
  }
  getEmployeeDocuments(id: number) {
    return this.list<EmployeeDocumentDto>(`/employees/${id}/documents`);
  }
  createEmployeeDocument(id: number, body: CreateEmployeeDocumentRequest) {
    return this.post<EmployeeDocumentDto>(`/employees/${id}/documents`, body);
  }
  deleteEmployeeDocument(employeeId: number, documentId: number) {
    return this.api.delete<ApiResponse<null>>(`/employees/${employeeId}/documents/${documentId}`);
  }

  // Time
  getShifts(params?: Params) {
    return this.list<ShiftDto>('/shifts', params);
  }
  getShift(id: number) {
    return this.one<ShiftDto>(`/shifts/${id}`);
  }
  createShift(body: unknown) {
    return this.post<ShiftDto>('/shifts', body);
  }
  updateShift(id: number, body: unknown) {
    return this.put<ShiftDto>(`/shifts/${id}`, body);
  }

  getHolidays(params?: Params) {
    return this.list<HolidayDto>('/holidays', params);
  }
  createHoliday(body: unknown) {
    return this.post<HolidayDto>('/holidays', body);
  }
  updateHoliday(id: number, body: unknown) {
    return this.put<HolidayDto>(`/holidays/${id}`, body);
  }

  getAttendance(params: Params) {
    return this.list<AttendanceDto>('/attendance', params);
  }
  saveAttendance(body: unknown) {
    return this.post<AttendanceDto>('/attendance', body);
  }
  getAttendanceSummary(params: Params) {
    return this.list<AttendanceSummaryDto>('/attendance/summary', params);
  }

  getOvertime(params?: Params) {
    return this.list<OvertimeDto>('/overtime', params);
  }
  createOvertime(body: unknown) {
    return this.post<OvertimeDto>('/overtime', body);
  }
  approveOvertime(id: number) {
    return this.post<OvertimeDto>(`/overtime/${id}/approve`, {});
  }

  // Leave
  getLeaveTypes(params?: Params) {
    return this.list<LeaveTypeDto>('/leave-types', params);
  }
  createLeaveType(body: unknown) {
    return this.post<LeaveTypeDto>('/leave-types', body);
  }
  updateLeaveType(id: number, body: unknown) {
    return this.put<LeaveTypeDto>(`/leave-types/${id}`, body);
  }

  getLeavePolicies(params?: Params) {
    return this.list<LeavePolicyDto>('/leave-policies', params);
  }
  saveLeavePolicy(body: unknown) {
    return this.post<LeavePolicyDto>('/leave-policies', body);
  }

  getLeaveRequests(params?: Params) {
    return this.list<LeaveRequestDto>('/leave-requests', params);
  }
  getLeaveRequest(id: number) {
    return this.one<LeaveRequestDto>(`/leave-requests/${id}`);
  }
  createLeaveRequest(body: unknown) {
    return this.post<LeaveRequestDto>('/leave-requests', body);
  }
  approveLeave(id: number, body: LeaveActionRequest = {}) {
    return this.post<LeaveRequestDto>(`/leave-requests/${id}/approve`, body);
  }
  rejectLeave(id: number, body: LeaveActionRequest) {
    return this.post<LeaveRequestDto>(`/leave-requests/${id}/reject`, body);
  }
  cancelLeave(id: number, body: LeaveActionRequest = {}) {
    return this.post<LeaveRequestDto>(`/leave-requests/${id}/cancel`, body);
  }

  // Salary / payroll
  getSalaryComponents(params?: Params) {
    return this.list<SalaryComponentDto>('/salary-components', params);
  }
  createSalaryComponent(body: unknown) {
    return this.post<SalaryComponentDto>('/salary-components', body);
  }
  updateSalaryComponent(id: number, body: unknown) {
    return this.put<SalaryComponentDto>(`/salary-components/${id}`, body);
  }

  getSalaryStructures(params?: Params) {
    return this.list<SalaryStructureDto>('/salary-structures', params);
  }
  getSalaryStructure(id: number) {
    return this.one<SalaryStructureDto>(`/salary-structures/${id}`);
  }
  createSalaryStructure(body: unknown) {
    return this.post<SalaryStructureDto>('/salary-structures', body);
  }
  updateSalaryStructure(id: number, body: unknown) {
    return this.put<SalaryStructureDto>(`/salary-structures/${id}`, body);
  }

  getEmployeeSalaries(params?: Params) {
    return this.list<EmployeeSalaryDto>('/employee-salaries', params);
  }
  saveEmployeeSalary(body: unknown) {
    return this.post<EmployeeSalaryDto>('/employee-salaries', body);
  }

  getPayrollRuns(params?: Params) {
    return this.list<PayrollRunDto>('/payroll/runs', params);
  }
  getPayrollRun(id: number) {
    return this.one<PayrollRunDto>(`/payroll/runs/${id}`);
  }
  createPayrollRun(body: unknown) {
    return this.post<PayrollRunDto>('/payroll/runs', body);
  }
  processPayrollRun(id: number) {
    return this.post<PayrollRunDto>(`/payroll/runs/${id}/process`, {});
  }
  approvePayrollRun(id: number) {
    return this.post<PayrollRunDto>(`/payroll/runs/${id}/approve`, {});
  }
  lockPayrollRun(id: number) {
    return this.post<PayrollRunDto>(`/payroll/runs/${id}/lock`, {});
  }

  getPayslips(params?: Params) {
    return this.list<PayslipDto>('/payslips', params);
  }
  getPayslip(id: number) {
    return this.one<PayslipDto>(`/payslips/${id}`);
  }
}
