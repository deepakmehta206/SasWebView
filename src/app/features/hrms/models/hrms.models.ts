/** HRMS DTOs matching backend camelCase. */

export interface DepartmentDto {
  departmentId: number;
  tenantId: number;
  branchId: number;
  departmentCode: string;
  departmentName: string;
  parentDepartmentId: number | null;
  description: string | null;
  isActive: boolean;
}

export interface DesignationDto {
  designationId: number;
  tenantId: number;
  designationCode: string;
  designationName: string;
  description: string | null;
  isActive: boolean;
}

export interface EmployeeTypeDto {
  employeeTypeId: number;
  tenantId: number;
  employeeTypeCode: string;
  employeeTypeName: string;
  description: string | null;
  isActive: boolean;
}

export interface EmployeeDto {
  employeeId: number;
  tenantId: number;
  branchId: number;
  employeeCode: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  dateOfJoining: string;
  dateOfLeaving: string | null;
  gender: string | null;
  departmentId: number | null;
  designationId: number | null;
  employeeTypeId: number | null;
  reportingManagerId: number | null;
  userId: number | null;
  status: string;
  isActive: boolean;
}

export interface CreateEmployeeRequest {
  branchId: number;
  employeeCode: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  dateOfJoining: string;
  dateOfLeaving?: string | null;
  gender?: string | null;
  departmentId?: number | null;
  designationId?: number | null;
  employeeTypeId?: number | null;
  reportingManagerId?: number | null;
  userId?: number | null;
  status?: string;
}

export interface UpdateEmployeeRequest extends CreateEmployeeRequest {
  isActive: boolean;
}

export interface SetStatusRequest {
  status: string;
  isActive: boolean;
}

export interface EmployeeProfileDto {
  employeeProfileId: number;
  tenantId: number;
  employeeId: number;
  fatherName: string | null;
  motherName: string | null;
  address: string | null;
  cityId: number | null;
  stateId: number | null;
  countryId: number | null;
  postalCode: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  bloodGroup: string | null;
  maritalStatus: string | null;
}

export interface SensitiveEmployeeProfileDto {
  employeeProfileId: number;
  tenantId: number;
  employeeId: number;
  bankAccountNumber: string | null;
  bankName: string | null;
  ifscCode: string | null;
  pan: string | null;
  aadhaarLast4: string | null;
}

export interface SaveEmployeeProfileRequest {
  fatherName?: string | null;
  motherName?: string | null;
  address?: string | null;
  cityId?: number | null;
  stateId?: number | null;
  countryId?: number | null;
  postalCode?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  bloodGroup?: string | null;
  maritalStatus?: string | null;
  bankAccountNumber?: string | null;
  bankName?: string | null;
  ifscCode?: string | null;
  pan?: string | null;
  aadhaarLast4?: string | null;
}

export interface EmployeeDocumentDto {
  employeeDocumentId: number;
  tenantId: number;
  employeeId: number;
  documentTypeId: number;
  documentNumber: string | null;
  fileId: number | null;
  issueDate: string | null;
  expiryDate: string | null;
  status: string;
  isActive: boolean;
}

export interface CreateEmployeeDocumentRequest {
  documentTypeId: number;
  documentNumber?: string | null;
  fileId?: number | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  status?: string;
}

export interface ShiftDto {
  shiftId: number;
  tenantId: number;
  branchId: number;
  shiftCode: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  graceInMinutes: number;
  isNightShift: boolean;
  isActive: boolean;
}

export interface HolidayDto {
  holidayId: number;
  tenantId: number;
  branchId: number | null;
  holidayDate: string;
  holidayName: string;
  holidayType: string | null;
  isOptional: boolean;
  isActive: boolean;
}

export interface AttendanceDto {
  attendanceId: number;
  tenantId: number;
  branchId: number;
  employeeId: number;
  attendanceDate: string;
  shiftId: number | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: string;
  workedMinutes: number;
  overtimeMinutes: number;
  source: string | null;
}

export interface AttendanceSummaryDto {
  employeeId: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  branchId: number;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  halfDays: number;
  totalWorkedMinutes: number;
  totalOvertimeMinutes: number;
}

export interface OvertimeDto {
  overtimeId: number;
  tenantId: number;
  branchId: number;
  employeeId: number;
  attendanceId: number | null;
  overtimeDate: string;
  startTime: string;
  endTime: string;
  minutes: number;
  rate: number;
  amount: number;
  status: string;
  approvedBy: number | null;
  approvedDate: string | null;
}

export interface LeaveTypeDto {
  leaveTypeId: number;
  tenantId: number;
  leaveCode: string;
  leaveName: string;
  paidLeave: boolean;
  annualQuota: number;
  carryForwardAllowed: boolean;
  maxCarryForward: number;
  requiresApproval: boolean;
  isActive: boolean;
}

export interface LeavePolicyDto {
  leavePolicyId: number;
  tenantId: number;
  leaveTypeId: number;
  policyName: string;
  accrualType: string;
  accrualValue: number;
  carryForwardAllowed: boolean;
  maxCarryForward: number;
  applicableToEmployeeTypeId: number | null;
  isActive: boolean;
}

export interface LeaveRequestDto {
  leaveRequestId: number;
  tenantId: number;
  branchId: number;
  employeeId: number;
  leaveTypeId: number;
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason: string | null;
  status: string;
  appliedDate: string;
  approvedDate: string | null;
  approvedBy: number | null;
  rejectedReason: string | null;
}

export interface LeaveActionRequest {
  comments?: string | null;
  rejectedReason?: string | null;
  approvalLevel?: number;
}

export interface SalaryComponentDto {
  salaryComponentId: number;
  tenantId: number;
  componentCode: string;
  componentName: string;
  componentType: string;
  calculationType: string;
  isTaxable: boolean;
  isStatutory: boolean;
  isActive: boolean;
}

export interface SalaryStructureDetailDto {
  salaryStructureDetailId?: number;
  salaryComponentId: number;
  calculationType: string;
  amount: number;
  percentage: number | null;
  sequence: number;
  componentCode?: string;
  componentName?: string;
}

export interface SalaryStructureDto {
  salaryStructureId: number;
  tenantId: number;
  structureCode: string;
  structureName: string;
  isActive: boolean;
  details: SalaryStructureDetailDto[];
}

export interface EmployeeSalaryDto {
  employeeSalaryId: number;
  tenantId: number;
  employeeId: number;
  salaryStructureId: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  basicSalary: number;
  grossSalary: number;
  ctc: number;
  status: string;
}

export interface PayrollRunDto {
  payrollRunId: number;
  tenantId: number;
  branchId: number;
  payrollMonth: number;
  payrollYear: number;
  runDate: string;
  employeeCount: number;
  grossAmount: number;
  deductionAmount: number;
  netAmount: number;
  status: string;
  processedBy: number | null;
  processedDate: string | null;
  details: PayrollDetailDto[];
}

export interface PayrollDetailDto {
  payrollDetailId: number;
  tenantId: number;
  payrollRunId: number;
  employeeId: number;
  basicAmount: number;
  grossAmount: number;
  deductionAmount: number;
  netAmount: number;
  workingDays: number;
  presentDays: number;
  leaveDays: number;
  lopDays: number;
  employeeCode?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  components: PayrollComponentDetailDto[];
}

export interface PayrollComponentDetailDto {
  payrollComponentDetailId: number;
  tenantId: number;
  payrollDetailId: number;
  salaryComponentId: number;
  amount: number;
  calculationValue: number;
  componentCode?: string | null;
  componentName?: string | null;
  componentType?: string | null;
  calculationType?: string | null;
}

export interface PayslipDto {
  payslipId: number;
  tenantId: number;
  payrollRunId: number;
  payrollDetailId: number;
  employeeId: number;
  payslipNumber: string;
  payrollMonth: number;
  payrollYear: number;
  grossAmount: number;
  deductionAmount: number;
  netAmount: number;
  generatedDate: string;
  fileId: number | null;
  components: PayrollComponentDetailDto[];
}
