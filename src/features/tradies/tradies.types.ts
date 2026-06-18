/**
 * Domain types for the admin tradies Feature_Module.
 *
 * These interfaces mirror the shapes returned by the backend's
 * `/api/admin/tradies` endpoints. `TradieListItem` is the compact
 * representation used in the paginated list view; `TradieDetail`
 * extends it with every profile field needed by the detail dialog.
 */

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface TradieListItem {
  id: string;
  businessName: string | null;
  abn: string;
  profileStatus: ApprovalStatus;
  createdAt: string;
  user: { id: string; name: string; email: string };
  services: { id: string; name: string }[];
  serviceRegions: { id: string; name: string }[];
}

export interface TradieDetail extends TradieListItem {
  businessNumber: string | null;
  businessLocation: string | null;
  serviceDescription: string | null;
  website: string | null;
  businessImages: string[] | null;
  abnVerified: boolean;
  abnData: {
    businessName?: string;
    status?: string;
    entityType?: string;
  } | null;
  yearsOfExperience: number;
  bio: string | null;
  introVideoUrl: string | null;
  awards: string | null;
  profilePhoto: string | null;
  serviceRadiusKm: number | null;
  tradeLicenseUrl: string | null;
  publicLiabilityInsuranceUrl: string | null;
  idProofUrl: string | null;
  rejectionReason: string | null;
  hasLicense: boolean;
  licenseNumber: string | null;
  licenseExpiryDate: string | null;
  insuranceUrl: string | null;
  insuranceExpiryDate: string | null;
  insuranceVerified: boolean;
  timeFrom: string | null;
  timeTo: string | null;
  openDays: string[] | null;
  isAvailable: boolean;
  isEmergencyAvailable: boolean;
  workPhotos: { id: string; imageUrl: string; sortOrder: number }[];
}

export interface TradieListParams {
  page: number;
  limit: number;
  status?: ApprovalStatus;
  search?: string;
}

export interface BulkActionResult {
  processed: number;
  failed: number;
}
