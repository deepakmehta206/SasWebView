/**
 * Module/feature codes matching SaaSPlatform.Domain.Constants.ModuleFeatureCodes.
 * Used with FeatureAccessService — do not invent codes.
 */
export const ModuleCodes = {
  Hrms: 'HRMS'
} as const;

export const FeatureCodes = {
  HrmsEmployee: 'HRMS_EMPLOYEE',
  HrmsAttendance: 'HRMS_ATTENDANCE',
  HrmsShift: 'HRMS_SHIFT',
  HrmsLeave: 'HRMS_LEAVE',
  HrmsOvertime: 'HRMS_OVERTIME',
  HrmsPayroll: 'HRMS_PAYROLL'
} as const;
