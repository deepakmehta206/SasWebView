/** Matches backend BranchDto (camelCase JSON). */
export interface BranchDto {
  branchId: number;
  tenantId: number;
  branchCode: string;
  branchName: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  status: string;
  isActive: boolean;
  createdDate: string;
  modifiedDate?: string | null;
}

/** Matches backend CreateBranchRequest. */
export interface CreateBranchRequest {
  branchCode: string;
  branchName: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  status: string;
}

/** Matches backend UpdateBranchRequest. */
export interface UpdateBranchRequest {
  branchCode: string;
  branchName: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  status: string;
}
