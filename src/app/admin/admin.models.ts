export type AdminEntityType = 'jobseekers' | 'employers';
export type ModerationStatus = 'active' | 'suspended';
export type ModerationAction = 'suspend' | 'unsuspend' | 'delete';

export interface AdminAccountSummary {
  id: string;
  entityType: AdminEntityType;
  displayName: string;
  email: string;
  status: ModerationStatus;
  createdAt: string | null;
}

export interface AdminDetailField {
  label: string;
  value: string;
}

export interface AdminAccountDetails extends AdminAccountSummary {
  detailFields: AdminDetailField[];
  suspensionReason: string | null;
  suspendedAt: string | null;
}

export interface DeleteConfirmationData {
  accountName: string;
  entityLabel: string;
}

export interface SuspensionReasonDialogData {
  accountName: string;
  entityLabel: string;
}
