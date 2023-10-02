export type Asset = {
  _id?: string;
  _rev?: string;
  $collection: string;
  name: string;
  type: string;
  currencyId: string;
  _currencySign?: string;
  _balance?: number;
};
