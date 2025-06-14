export type TextImportRules = {
  _id?: string;
  _rev?: string;
  $collection: string;
  name: string;
  description?: string;
  regex: string;
  walletCaptureGroup: number;
  expenseAvenueCaptureGroup: number;
  dateCaptureGroup: number;
  amountCaptureGroup: number;
  dateFormat: string;
  isActive: boolean;
  dissuadeEditing?: boolean;
  denyDeletion?: boolean;
};
