/** Allowed product statuses — single source of truth for validator + template. */
export const PRODUCT_STATUSES = ['Pending', 'Approved', 'Rejected'] as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export interface Product {
  name: string;
  description: string;
  price: number;
  salePrice: number;
  status: ProductStatus;
}
