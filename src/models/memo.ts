export type Memo = {
  _id?: string;
  _rev?: string;
  $collection: string;
  name: string;
  content: string;
  modifiedEpoch?: number;
};
